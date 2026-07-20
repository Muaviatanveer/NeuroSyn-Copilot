import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export function LoginPage({ onLoginSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [consoleLines, setConsoleLogs] = useState([]);
  const [logIndex, setLogIndex] = useState(0);

  const logsSequence = [
    "[22:17:02] Initializing AI Manager...",
    "[22:17:03] Local AI Connected (qwen2.5-coder:7b)",
    "[22:17:04] MongoDB Connected (mongodb://127.0.0.1:27017)",
    "[22:17:05] Secure Workspace Sandbox Verified",
    "[22:17:06] AI Workforce operational & standby",
    "[22:17:07] Waiting for Client Authentication stream..."
  ];

  useEffect(() => {
    if (logIndex >= logsSequence.length) return;
    const interval = setTimeout(() => {
      setConsoleLogs(prev => [...prev, logsSequence[logIndex]]);
      setLogIndex(prev => prev + 1);
    }, 1100);
    return () => clearTimeout(interval);
  }, [logIndex]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      /* global google */
      if (window.google) {
        google.accounts.id.initialize({
          // UPDATED: Placed your real verified Google Client ID here
          client_id: '430589265444-hls1guitmiv2nmbp2fighqu14tvj7jmp.apps.googleusercontent.com',
          callback: handleCredentialResponse,
        });

        // Renders Google's official button inside the overlapping ghost container
        google.accounts.id.renderButton(
          document.getElementById('ghost-google-btn-container'),
          { 
            theme: 'dark', 
            size: 'large', 
            width: '382', 
            shape: 'rectangular'
          }
        );
      }
    };
  }, []);

  const handleCredentialResponse = async (response) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });

      if (!res.ok) throw new Error('Identity verification declined.');
      const result = await res.json();
      
      onLoginSuccess(result.user);
    } catch (err) {
      console.error(err);
      setError('Google verification failed. Click the button to try again.');
    } finally {
      setLoading(false);
    }
  };

  const triggerDemoBypass = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: 'muaviakha83@gmail.com',
          password: 'bypass_demo_pass'
        }),
      });

      if (!res.ok) throw new Error('Demo bypass offline.');
      const result = await res.json();
      onLoginSuccess(result.user);
    } catch (err) {
      setError('Bypass failed. Please verify local backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeveloperLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error('Developer credentials declined.');
      const result = await res.json();

      onLoginSuccess(result.user);
    } catch (err) {
      console.error(err);
      setError('Invalid developer credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#050507] text-[#FAFAFA] flex flex-col justify-between font-mono relative select-none p-12 overflow-y-auto">
      
      {/* Background vector dot-grid */}
      <div className="absolute inset-0 bg-blueprint-bg opacity-30 pointer-events-none" />

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-12 w-full max-w-7xl mx-auto my-auto z-10 relative">
        
        {/* LEFT COLUMN - TELEMETRY & ARCHITECTURE PIPELINE */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-12">
          
          {/* Top Logo */}
          <div className="space-y-1.5">
            <h1 className="text-lg font-bold tracking-wider text-[#FAFAFA]">NEUROSYN-COPILOT</h1>
            <p className="text-[10px] text-[#71717A] tracking-wider uppercase">ENGINEERING INTELLIGENCE OPERATING SYSTEM</p>
          </div>

          {/* Central Live Architecture Pipeline Card */}
          <div className="space-y-4 max-w-md">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
              <span className="text-[9px] font-bold text-[#A1A1AA] uppercase tracking-wider">LIVE COGNITIVE AUTONOMOUS PIPELINE</span>
            </div>

            <div className="p-5 rounded-12 border border-[#1E1E22] bg-[#0D0D0F]/30 space-y-4 relative overflow-hidden">
              <div className="absolute left-[31px] top-6 bottom-6 w-[1px] bg-[#1E1E22]" />

              {[
                { step: '01', title: 'Spreadsheet / PDF Binary Ingestion', status: 'completed' },
                { step: '02', title: 'AI Manager Workforce Orchestration', status: 'completed' },
                { step: '03', title: 'Data Analyst Statistical KPI Extraction', status: 'completed' },
                { step: '04', title: 'Designer High-Res Visual Chart Render', status: 'completed' },
                { step: '05', title: 'Exporter PDF, PPTX, & ZIP Compilation', status: 'completed' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs pl-2 relative z-10">
                  <div className="flex items-center gap-3">
                    <span className="text-[#71717A] font-mono">{item.step} //</span>
                    <span className={idx === 1 ? "text-[#06B6D4]" : "text-[#FAFAFA]"}>{item.title}</span>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Telemetry Counters */}
          <div className="grid grid-cols-4 gap-4 pt-6 border-t border-[#1E1E22]/60">
            {[
              { label: 'Hours Saved', val: '1,248' },
              { label: 'Records Parsed', val: '8,394' },
              { label: 'Documents Written', val: '12,882' },
              { label: 'Tasks Compiled', val: '98,141' }
            ].map((metric, i) => (
              <div key={i} className="space-y-1">
                <span className="text-[9px] text-[#71717A] uppercase block">{metric.label}</span>
                <span className="text-[14px] font-bold text-[#FAFAFA] font-mono block">{metric.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN - SECURE CREDENTIALS PANEL */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-12 lg:pl-12 lg:border-l lg:border-[#1E1E22]/60">
          
          {/* Top Status */}
          <div className="flex justify-between items-center text-[10px] text-[#71717A] font-mono">
            <span>BUILD: STABLE</span>
            <span>SYSTEM VERSION: v2.0.4</span>
          </div>

          {/* Centered Sign In Form Card */}
          <div className="glass-card p-6 rounded-12 bg-[#0D0D0F]/80 border border-[#1E1E22] space-y-6">
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-[#FAFAFA]">Welcome Back</h3>
              <p className="text-[10px] text-[#71717A]">Continue building with NeuroSyn-Copilot</p>
            </div>

            {error && (
              <p className="text-[9px] text-center font-mono text-[#EF4444] bg-[#EF4444]/5 border border-[#EF4444]/15 py-2 px-3 rounded-8">
                {error}
              </p>
            )}

            {/* Email/Password Fields */}
            <form onSubmit={handleDeveloperLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-[#71717A] uppercase tracking-wider block">Developer Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@company.com" 
                  className="w-full h-10 px-3.5 text-xs rounded-8 custom-input"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-bold text-[#71717A] uppercase tracking-wider">Password</label>
                  <span className="text-[8px] text-[#71717A] hover:text-[#FAFAFA] cursor-pointer">Forgot?</span>
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••" 
                  className="w-full h-10 px-3.5 text-xs rounded-8 custom-input"
                />
              </div>

              {/* Sign In Trigger */}
              <button 
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded-8 bg-[#FAFAFA] hover:bg-[#E4E4E7] text-black font-bold text-xs transition-colors duration-150 flex items-center justify-center"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'SIGN IN'}
              </button>
            </form>

            <div className="text-center flex items-center justify-between gap-3">
              <hr className="border-[#1E1E22] flex-1" />
              <span className="text-[8px] text-[#71717A] font-bold uppercase">or connect socially</span>
              <hr className="border-[#1E1E22] flex-1" />
            </div>

            {/* Custom Google SSO Action Button viewport */}
            <div className="space-y-3">
              {loading ? (
                <div className="w-full h-14 bg-[#09090B] border border-[#1E1E22] rounded-14 flex items-center justify-center gap-2 text-xs text-[#71717A]">
                  <Loader2 className="w-4 h-4 animate-spin text-[#06B6D4]" />
                  <span>Activating workspace...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  
                  {/* Relative container holding our custom button + overlapping invisible Google iframe */}
                  <div className="relative w-full h-14 overflow-hidden rounded-14">
                    
                    {/* Our Custom styled White Button */}
                    <button 
                      className="absolute inset-0 w-full h-full bg-[#FAFAFA] hover:bg-[#E4E4E7] text-black font-semibold text-xs transition-all duration-150 flex items-center justify-center gap-3 z-0"
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.18 1-.76 1.85-1.61 2.42v2.77h2.61c1.53-2.41 2.64-5.96 2.64-9.2z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-2.61-2.77c-.72.48-1.64.77-2.61.77-2.62 0-4.83-1.77-5.62-4.14H1.05v2.87C2.87 20.35 7.15 23 12 23z"/>
                        <path fill="#FBBC05" d="M6.38 14.2c-.2-.6-.31-1.24-.31-1.9s.11-1.3.31-1.9V7.53H1.05C.38 8.87 0 10.39 0 12s.38 3.13 1.05 4.47l5.33-2.27z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.15 1 2.87 3.65 1.05 7.53l5.33 2.27c.79-2.37 3-4.14 5.62-4.14z"/>
                      </svg>
                      <span>Continue with Google</span>
                    </button>

                    {/* Official Google Iframe container overlaying directly on top of ours */}
                    <div 
                      id="ghost-google-btn-container" 
                      className="absolute inset-0 opacity-[0.01] hover:opacity-[0.02] cursor-pointer z-10 flex justify-center items-center overflow-hidden" 
                    />
                  </div>

                  {/* Outlined Developer Bypass Button */}
                  <button 
                    onClick={triggerDemoBypass}
                    className="w-full h-11 rounded-14 border border-[#1E1E22] hover:bg-[#121214] text-[10px] text-[#A1A1AA] hover:text-[#FAFAFA] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                  >
                    <span>⚡ Initialize Demo Session</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Connectivity Status Indicators */}
          <div className="flex items-center justify-between text-[9px] text-[#71717A] font-mono pt-4 border-t border-[#1E1E22]/60">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <span>Local LLM: Ready</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <span>MongoDB: Connected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <span>Sandbox: Active</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}