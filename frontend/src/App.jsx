import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Bell, Loader2 } from 'lucide-react';

import { Sidebar } from './components/Sidebar';
import { MetricsDashboard } from './components/MetricsDashboard';
import { ExecutionTimeline } from './components/ExecutionTimeline';
import { SuccessScreen } from './components/SuccessScreen';
import { LoginPage } from './components/LoginPage';

// Unified relative path (resolves locally to port 3000 -> 5001 and on Vercel to your live domain)
const API_BASE = '/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [executionHistory, setExecutionHistory] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [booting, setBooting] = useState(false);
  const [bootStep, setBootStep] = useState(0);

  const [sessionState, setSessionState] = useState({
    sessionId: null,
    status: 'idle',
    fileMetadata: null,
    parsedData: null,
    timelineSteps: [],
    artifacts: null,
    neuroScore: null
  });

  const [promptInput, setPromptInput] = useState('');
  const [uploadProgress, setUploadProgress] = useState(false);
  const [notification, setNotification] = useState(null);

  const triggerNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 5000);
  };

  useEffect(() => {
    const cachedProfile = localStorage.getItem('neurosyn_user');
    if (cachedProfile) {
      setCurrentUser(JSON.parse(cachedProfile));
    }
    setAuthChecked(true);
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchUserHistory();
    }
  }, [currentUser]);

  const fetchUserHistory = async () => {
    try {
      const response = await fetch(`${API_BASE}/history`, {
        headers: { 'x-user-id': currentUser.googleId }
      });
      if (response.ok) {
        const data = await response.json();
        setExecutionHistory(data.history || []);
      }
    } catch (err) {
      console.warn('Could not query user task logs.', err);
    }
  };

  const handleDeleteTask = async (sessionId) => {
    try {
      const response = await fetch(`${API_BASE}/history/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': currentUser.googleId
        }
      });

      if (!response.ok) throw new Error('Delete transaction declined.');

      setExecutionHistory(prev => prev.filter(item => item.sessionId !== sessionId));
      triggerNotification('Task record deleted from archive.');
    } catch (err) {
      console.error(err);
      triggerNotification('Failed to delete task record.');
    }
  };

  const handleLoginSuccess = (profile) => {
    setBooting(true);
    
    const interval = setInterval(() => {
      setBootStep(prev => {
        if (prev >= 3) {
          clearInterval(interval);
          setTimeout(() => {
            localStorage.setItem('neurosyn_user', JSON.stringify(profile));
            setCurrentUser(profile);
            setBooting(false);
            setBootStep(0);
            triggerNotification(`Authorized secure session: ${profile.name}`);
          }, 600);
          return prev;
        }
        return prev + 1;
      });
    }, 600);
  };

  const handleLogout = () => {
    localStorage.removeItem('neurosyn_user');
    setCurrentUser(null);
    setExecutionHistory([]);
    triggerNotification('Session closed safely.');
  };

  useEffect(() => {
    if (sessionState.status === 'completed') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#06B6D4', '#10B981', '#8B5CF6']
      });
      triggerNotification('Mission complete. Workspace artifacts generated.');
    }
  }, [sessionState.status]);

  const handleFileUpload = async (file) => {
    setUploadProgress(true);
    setSessionState(prev => ({ ...prev, status: 'uploading' }));
    
    const formData = new FormData();
    formData.append('file', file);
    if (sessionState.sessionId) {
      formData.append('sessionId', sessionState.sessionId);
    }

    try {
      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: { 'x-user-id': currentUser.googleId },
        body: formData
      });

      if (!response.ok) throw new Error('Upload transaction declined.');
      const result = await response.json();
      
      setSessionState(prev => ({
        ...prev,
        sessionId: result.sessionId,
        status: 'idle',
        fileMetadata: result.file,
        parsedData: result.parsed
      }));

      triggerNotification(`Ingested and verified "${result.file.name}" structure.`);
    } catch (err) {
      console.error(err);
      setSessionState(prev => ({ ...prev, status: 'failed' }));
      triggerNotification('Error parsing uploaded file format.');
    } finally {
      setUploadProgress(false);
    }
  };

  const triggerWorkflowExecution = () => {
    if (!sessionState.sessionId || !sessionState.parsedData) {
      triggerNotification('Please upload data structure before initializing execution.');
      return;
    }

    setSessionState(prev => ({ ...prev, status: 'analyzing' }));
    
    const eventSource = new EventSource(`${API_BASE}/execute/${sessionState.sessionId}?userId=${currentUser.googleId}`);

    eventSource.addEventListener('timeline', (event) => {
      const state = JSON.parse(event.data);
      setSessionState(prev => ({ ...prev, timelineSteps: state.steps }));
    });

    eventSource.addEventListener('done', (event) => {
      const state = JSON.parse(event.data);
      
      setSessionState(prev => {
        const fileName = prev.fileMetadata?.name || 'Ingested Document';
        const fileSize = prev.fileMetadata?.size || 0;

        setExecutionHistory(historyPrev => [
          {
            id: `TSK-${state.sessionId.slice(0, 4).toUpperCase()}`,
            sessionId: state.sessionId,
            fileName: fileName,
            fileSize: fileSize,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            artifacts: state.artifacts,
            neuroScore: state.neuroScore
          },
          ...historyPrev
        ]);

        return {
          ...prev,
          status: 'completed',
          timelineSteps: state.steps,
          artifacts: state.artifacts,
          neuroScore: state.neuroScore
        };
      });
      
      eventSource.close();
    });

    eventSource.addEventListener('error', (event) => {
      const errorData = JSON.parse(event.data);
      setSessionState(prev => ({ ...prev, status: 'failed' }));
      triggerNotification(`Execution Error: ${errorData.message}`);
      eventSource.close();
    });
  };

  if (!authChecked) return null;

  if (!currentUser && !booting) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  if (booting) {
    const bootLines = [
      "Connecting local enterprise database profile...",
      "Syncing MongoDB workflow metadata collections...",
      "Ingesting local AI model weights: qwen2.5-coder:7b...",
      "Decrypting secure corporate token environments..."
    ];

    return (
      <div className="min-h-screen w-full bg-blueprint-bg flex items-center justify-center p-6 font-mono relative">
        <div className="absolute top-0 left-0 w-[450px] h-[450px] bg-[#06B6D4]/3 rounded-full blur-[120px] pointer-events-none" />
        <div className="w-[420px] bg-[#121214] border border-[#1E1E22] rounded-12 p-6 space-y-5 shadow-2xl">
          <div className="flex items-center gap-3 border-b border-[#1E1E22] pb-3">
            <Loader2 className="w-4 h-4 animate-spin text-[#06B6D4]" />
            <span className="text-[10px] font-bold text-[#FAFAFA] uppercase tracking-wider">Kernel Initialization Boot</span>
          </div>
          <div className="space-y-2 text-[10px] text-[#A1A1AA] leading-relaxed">
            {bootLines.slice(0, bootStep + 1).map((line, idx) => (
              <div key={idx} className="flex gap-2">
                <span className="text-[#10B981] font-bold">✓</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blueprint-bg text-[#FAFAFA] flex overflow-hidden">
      
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 glass-card px-4 py-3 rounded-12 border border-[#1E1E22] flex items-center gap-3"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#06B6D4] animate-pulse" />
            <span className="text-11 font-mono text-[#FAFAFA]">{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header Block */}
        <header className="h-[72px] border-b border-[#1E1E22] px-8 flex items-center justify-between bg-[#121214] sticky top-0 z-10 select-none">
          <div className="flex items-center gap-4">
            <h1 className="text-xs font-bold uppercase tracking-wider text-[#FAFAFA] font-mono">
              NeuroSyn-Copilot Enterprise Workspace
            </h1>
            <div className="h-4 w-[1px] bg-[#1E1E22]" />
            <div className="flex items-center gap-2 text-[10px] text-[#A1A1AA] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              <span>Workspace: {currentUser.name}</span>
              <span className="text-[#71717A]">•</span>
              <span className="text-[#06B6D4]">Local AI Engaged</span>
            </div>
          </div>

          <div className="flex items-center gap-4 font-mono">
            <div className="text-[10px] text-[#71717A] bg-[#09090B] border border-[#1E1E22] px-2.5 py-1 rounded-6">
              SYSTEM ENGINE: <span className="text-[#10B981] font-bold">99.98% OPERATIONAL</span>
            </div>
            <button className="p-2 text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors">
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-[#09090B]/50">
          <AnimatePresence mode="wait">
            {sessionState.status === 'completed' ? (
              <SuccessScreen 
                key="success" 
                artifacts={sessionState.artifacts} 
                neuroScore={sessionState.neuroScore}
                onReset={() => setSessionState({
                  sessionId: null,
                  status: 'idle',
                  fileMetadata: null,
                  parsedData: null,
                  timelineSteps: [],
                  artifacts: null,
                  neuroScore: null
                })}
              />
            ) : (
              <MetricsDashboard 
                key="workspace"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                sessionState={sessionState}
                executionHistory={executionHistory}
                onDeleteTask={handleDeleteTask}
                promptInput={promptInput}
                setPromptInput={setPromptInput}
                uploadProgress={uploadProgress}
                handleFileUpload={handleFileUpload}
                onExecute={triggerWorkflowExecution}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      <ExecutionTimeline 
        steps={sessionState.timelineSteps} 
        currentStatus={sessionState.status}
      />
    </div>
  );
}