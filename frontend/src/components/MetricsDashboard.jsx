import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import { 
  Mic, Paperclip, Send, Loader2, Sparkles, TrendingUp, 
  FileText, CheckCircle2, ShieldAlert, Zap, Clock,
  Play, Sliders, Archive, Code, Database, ChevronRight, BarChart3, Download, Activity, Cpu, Trash2
} from 'lucide-react';

export function MetricsDashboard({ 
  activeTab, setActiveTab, sessionState, executionHistory = [], onDeleteTask,
  promptInput, setPromptInput, uploadProgress, handleFileUpload, onExecute 
}) {
  const fileInputRef = useRef(null);
  const terminalEndRef = useRef(null);

  // -------------------------------------------------------------
  // CENTRALIZED VARIABLE DECLARATIONS (Scope Resolved)
  // -------------------------------------------------------------
  const activeStep = sessionState.timelineSteps?.find(s => s.status === 'running');
  const activeStepId = activeStep ? activeStep.id : null;

  const primarySheet = sessionState.parsedData?.sheets?.[0];
  const calculatedRows = primarySheet?.rowCount || 0;

  // Active node state mapper
  const getNodeState = (nodeId) => {
    if (sessionState.status === 'completed') return 'completed';
    if (!activeStepId) return 'idle';

    const mapping = {
      parsing: ['manager'],
      analysis: ['manager', 'analyst'],
      insights: ['manager', 'analyst', 'strategist'],
      charts: ['manager', 'analyst', 'strategist', 'designer'],
      documents: ['manager', 'analyst', 'strategist', 'designer', 'writer'],
      slides: ['manager', 'analyst', 'strategist', 'designer', 'writer'],
      packaging: ['manager', 'analyst', 'strategist', 'designer', 'writer', 'exporter']
    };

    const activeList = mapping[activeStepId] || [];
    if (activeList[activeList.length - 1] === nodeId) return 'running';
    if (activeList.includes(nodeId)) return 'completed';
    return 'idle';
  };

  // -------------------------------------------------------------
  // AI REASONING STREAM
  // -------------------------------------------------------------
  const [streamMessages, setStreamMessages] = useState([]);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [streamMessages]);

  useEffect(() => {
    if (!activeStep) return;

    const dialogMapping = {
      parsing: [
        { sender: 'Manager', text: `👉 Ingesting raw document binary streams for "${sessionState.fileMetadata?.name || 'document'}"...`, color: 'text-[#06B6D4]' },
        { sender: 'Manager', text: `✓ Verified file header structures. Local sandbox paths assigned.`, color: 'text-[#06B6D4]' }
      ],
      analysis: [
        { sender: 'Manager', text: `🔄 Initializing quantitative audit. Handing task off to Data Analyst...`, color: 'text-[#06B6D4]' },
        { sender: 'Analyst', text: `👋 Data Analyst here. Reading rows and evaluating mathematical boundaries...`, color: 'text-[#10B981]' },
        { sender: 'Analyst', text: `✓ Extracted categorical labels. Cleaned sparse data offsets.`, color: 'text-[#10B981]' }
      ],
      insights: [
        { sender: 'Manager', text: `🔄 Passing calculated matrix indices to Business Strategist...`, color: 'text-[#06B6D4]' },
        { sender: 'Strategist', text: `👋 Strategist here. Reviewing performance thresholds and calculating margin deltas...`, color: 'text-[#8B5CF6]' },
        { sender: 'Strategist', text: `✓ Strategic operational objectives formulated. Risks isolated.`, color: 'text-[#8B5CF6]' }
      ],
      charts: [
        { sender: 'Manager', text: `🔄 Forwarding trends to Presentation Designer for visual mapping...`, color: 'text-[#06B6D4]' },
        { sender: 'Designer', text: `👋 Designer here. Selecting high-contrast chart layouts and color palettes...`, color: 'text-[#3B82F6]' },
        { sender: 'Designer', text: `✓ High-resolution PNG data visualizations successfully rendered to disk.`, color: 'text-[#3B82F6]' }
      ],
      documents: [
        { sender: 'Manager', text: `🔄 Handing over semantic summaries to Report Writer...`, color: 'text-[#06B6D4]' },
        { sender: 'Writer', text: `👋 Writer here. Drafting executive briefing summaries and corporate communication templates...`, color: 'text-[#FAFAFA]' },
        { sender: 'Writer', text: `✓ Executive Word (.docx) and PDF summaries generated.`, color: 'text-[#FAFAFA]' }
      ],
      slides: [
        { sender: 'Designer', text: `👋 Designer here. Compiling vector layout trees into Microsoft PowerPoint (.pptx) deck...`, color: 'text-[#3B82F6]' },
        { sender: 'Designer', text: `✓ Completed deck composition. Spacing rules verified.`, color: 'text-[#3B82F6]' }
      ],
      packaging: [
        { sender: 'Manager', text: `🔄 Assigning final compression tasks to Export Manager...`, color: 'text-[#06B6D4]' },
        { sender: 'Exporter', text: `👋 Exporter here. Packaging compiled documentation directories...`, color: 'text-[#10B981]' },
        { sender: 'Exporter', text: `✓ Consolidated workspace ZIP compiled successfully.`, color: 'text-[#10B981]' }
      ]
    };

    const newLines = dialogMapping[activeStep.id] || [];
    newLines.forEach((line, index) => {
      const isAlreadyAdded = streamMessages.some(m => m.text === line.text);
      if (!isAlreadyAdded) {
        setTimeout(() => {
          setStreamMessages(prev => {
            if (prev.some(m => m.text === line.text)) return prev;
            return [...prev, line];
          });
        }, index * 700);
      }
    });
  }, [sessionState.timelineSteps]);

  useEffect(() => {
    if (sessionState.status === 'idle') {
      setStreamMessages([]);
    }
  }, [sessionState.status]);

  // -------------------------------------------------------------
  // SCHEMA-AGNOSTIC DATA TELEMETRY
  // -------------------------------------------------------------
  const parseCompanyTelemetry = () => {
    const rawData = sessionState.parsedData;

    if (rawData?.type === 'pdf') {
      const textContent = rawData.text || '';
      
      const stopWords = new Set([
        'the', 'and', 'to', 'of', 'in', 'is', 'a', 'this', 'that', 'for', 'on', 'with', 
        'as', 'at', 'by', 'an', 'be', 'or', 'are', 'from', 'it', 'our', 'your', 'about', 
        'more', 'this', 'how', 'which', 'their', 'will', 'with'
      ]);

      const wordFrequencies = {};
      textContent.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 3 && !stopWords.has(w))
        .forEach(w => {
          wordFrequencies[w] = (wordFrequencies[w] || 0) + 1;
        });

      const sortedKeywords = Object.entries(wordFrequencies)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);

      const chartData = sortedKeywords.map(([word, count]) => ({
        name: word.toUpperCase(),
        Relevance: count
      }));

      return {
        hasData: chartData.length > 0,
        labelKey: 'Keyword',
        primaryMetric: 'Relevance',
        secondaryMetric: 'Relevance',
        chartData
      };
    }

    if (!primarySheet || !primarySheet.rows || primarySheet.rows.length === 0) {
      return {
        hasData: false,
        labelKey: 'Month',
        primaryMetric: '',
        secondaryMetric: '',
        chartData: []
      };
    }

    const headers = primarySheet.headers;
    const numericKeys = [];
    const categoricalKeys = [];

    headers.forEach(header => {
      const sampleCells = primarySheet.rows.slice(0, 5).map(r => r[header]);
      const isNumeric = sampleCells.every(cell => {
        if (cell === null || cell === undefined || cell === '') return true;
        return !isNaN(Number(cell));
      });

      if (isNumeric && sampleCells.some(c => c !== null && c !== '')) {
        numericKeys.push(header);
      } else {
        categoricalKeys.push(header);
      }
    });

    const labelPriorityKeywords = ['product', 'name', 'region', 'date', 'month', 'company', 'category', 'item', 'customer'];
    let labelKey = categoricalKeys.find(key => 
      labelPriorityKeywords.some(kw => String(key).toLowerCase().includes(kw))
    ) || categoricalKeys[0] || headers[0];

    const metricPriorityKeywords = ['revenue', 'sold', 'units', 'amount', 'sales', 'total', 'profit', 'satisfaction', 'cost', 'score'];
    const sortedNumericKeys = [...numericKeys].sort((a, b) => {
      const aMatch = metricPriorityKeywords.some(kw => String(a).toLowerCase().includes(kw));
      const bMatch = metricPriorityKeywords.some(kw => String(b).toLowerCase().includes(kw));
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
    });

    const primaryMetric = sortedNumericKeys[0] || headers[1] || 'Metric_1';
    const secondaryMetric = sortedNumericKeys[1] || sortedNumericKeys[0] || headers[1] || 'Metric_2';

    const chartData = primarySheet.rows.slice(0, 10).map((row) => {
      const labelValue = row[labelKey];
      const dataPoint = {
        name: labelValue !== null && labelValue !== undefined ? String(labelValue).slice(0, 12) : 'Record'
      };

      dataPoint[primaryMetric] = Number(row[primaryMetric]) || 0;
      dataPoint[secondaryMetric] = Number(row[secondaryMetric]) || 0;

      return dataPoint;
    });

    return {
      hasData: true,
      labelKey,
      primaryMetric,
      secondaryMetric,
      chartData
    };
  };

  const telemetry = parseCompanyTelemetry();

  const metrics = [
    { title: 'Hours Saved', value: calculatedRows ? `${(calculatedRows * 0.05).toFixed(1)} hrs` : sessionState.parsedData?.type === 'pdf' ? '0.5 hrs' : '0.0 hrs', icon: Clock, change: sessionState.parsedData ? 'Automation scaling active' : '+0% this week' },
    { title: 'Data Records', value: calculatedRows ? calculatedRows.toLocaleString() : sessionState.parsedData?.type === 'pdf' ? 'Text extracted' : '0', icon: TrendingUp, change: sessionState.parsedData ? '100% parsed locally' : 'Workspace clean' },
    { title: 'Columns Mapped', value: primarySheet?.columnsCount || (sessionState.parsedData?.type === 'pdf' ? '6' : '0'), icon: BarChart3, change: primarySheet ? `Table: ${primarySheet.sheetName}` : sessionState.parsedData?.type === 'pdf' ? 'Format: PDF Text' : 'Idle state' },
    { title: 'Workforce State', value: sessionState.status === 'completed' ? 'Finished' : sessionState.status === 'analyzing' ? 'Active' : 'Idle', icon: Zap, change: 'Ollama Pipeline' }
  ];

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleTemplateSelect = (prompt) => {
    setPromptInput(prompt);
    setActiveTab('dashboard');
  };

  const getPercentage = () => {
    if (sessionState.status === 'completed') return 100;
    if (sessionState.timelineSteps.length === 0) return 0;
    const completedCount = sessionState.timelineSteps.filter(s => s.status === 'completed').length;
    return Math.floor((completedCount / sessionState.timelineSteps.length) * 100);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6 font-mono"
    >
      {/* 1. Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* KPI Header Grid */}
          <div className="grid grid-cols-4 gap-4">
            {metrics.map((card, i) => {
              const Icon = card.icon;
              return (
                <div key={i} className="glass-card p-5 rounded-14 flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider">{card.title}</p>
                    <h3 className="text-lg font-bold tracking-tight text-[#FAFAFA] mt-1">{card.value}</h3>
                    <span className="text-[9px] text-[#10B981] font-semibold mt-1 block">{card.change}</span>
                  </div>
                  <div className="w-8 h-8 rounded-10 bg-[#09090B] border border-[#1E1E22] flex items-center justify-center text-[#06B6D4]">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Core Command Box */}
          <div className="glass-card p-5 rounded-10 space-y-4 relative overflow-hidden">
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-wider text-[#FAFAFA]">
                Automation Pipeline Ingestion
              </h2>
            </div>

            <div className="space-y-3">
              <textarea
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Specify execution criteria (e.g., Prepare a sales report evaluating leading profit margins)..."
                className="w-full h-16 p-3 text-xs rounded-8 custom-input resize-none"
              />

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} 
                    className="hidden" 
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="h-8 px-3 rounded-8 bg-[#09090B] hover:bg-[#121214] text-[#FAFAFA] text-[10px] font-bold border border-[#1E1E22] flex items-center gap-1.5 transition-all"
                  >
                    <Paperclip className="w-3.5 h-3.5 text-[#71717A]" />
                    <span>Upload Local File</span>
                  </button>

                  {sessionState.fileMetadata && (
                    <div className="text-[9px] bg-[#10B981]/5 text-[#10B981] px-2.5 py-1 rounded-8 border border-[#10B981]/15 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      <span className="font-semibold truncate max-w-40">{sessionState.fileMetadata.name} ({Math.floor(sessionState.fileMetadata.size / 1024)} KB)</span>
                    </div>
                  )}
                </div>

                <button 
                  onClick={onExecute}
                  disabled={sessionState.status === 'analyzing' || uploadProgress}
                  className="h-8 px-4 rounded-8 bg-[#06B6D4] hover:bg-[#06B6D4]/90 text-black text-[10px] font-bold shadow-sm transition-all flex items-center gap-1.5"
                >
                  {sessionState.status === 'analyzing' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Running Stream...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Execute Mission</span>
                    </>
                  )}
                </button>
              </div>

              {/* Progress Tracking Indicator */}
              {sessionState.status === 'analyzing' && (
                <div className="pt-2.5 border-t border-[#1E1E22] space-y-2 animate-pulse">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-[#A1A1AA]">MISSION PROGRESS</span>
                    <span className="text-[#06B6D4] font-bold">{getPercentage()}%</span>
                  </div>
                  <div className="w-full h-1 bg-[#09090B] border border-[#1E1E22] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] transition-all duration-300" style={{ width: `${getPercentage()}%` }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Drag & Drop Upload Block */}
          {!sessionState.fileMetadata && (
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-[#1E1E22] hover:border-[#2E2E35] bg-[#0D0D0F]/40 transition-all rounded-10 p-5 flex flex-col items-center justify-center gap-2 cursor-pointer group"
            >
              <p className="text-[10px] font-semibold text-[#FAFAFA]">Drag and drop spreadsheet files or click to browse</p>
              <p className="text-[9px] text-[#71717A]">Supports .XLSX, .CSV, .PDF up to 10MB</p>
            </div>
          )}

          {/* DYNAMIC "AI REASONING STREAM" TERMINAL PANEL */}
          {sessionState.status === 'analyzing' && (
            <div className="glass-card p-5 rounded-10 border border-[#1E1E22] bg-[#0D0D0F]/85 font-mono space-y-4">
              <div className="flex justify-between items-center border-b border-[#1E1E22] pb-3">
                <h3 className="text-[9px] font-bold uppercase tracking-wider text-[#A1A1AA] flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#8B5CF6] animate-pulse" />
                  AI Operations reasoning stream
                </h3>
                <span className="text-[8px] uppercase tracking-wider px-2 py-0.5 rounded status-badge-active animate-pulse">
                  Live Streaming
                </span>
              </div>

              {/* Scrolling Terminal Output Buffer */}
              <div className="h-44 overflow-y-auto space-y-2 text-[10px] leading-relaxed pr-2 select-text font-mono">
                {streamMessages.map((msg, idx) => (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex gap-2"
                  >
                    <span className={`font-bold shrink-0 ${msg.color || 'text-[#A1A1AA]'}`}>
                      {msg.sender === 'Manager' ? '🧠 AI Manager:' : `🤖 ${msg.sender}:`}
                    </span>
                    <span className="text-[#FAFAFA]/95">{msg.text}</span>
                  </motion.div>
                ))}
                
                {/* Active connection cursor indicator */}
                <div className="flex gap-1.5 text-[#06B6D4] animate-pulse items-center">
                  <span className="font-bold shrink-0">&gt;</span>
                  <span className="text-[9px] uppercase tracking-wider">System engine executing operations...</span>
                </div>

                <div ref={terminalEndRef} />
              </div>
            </div>
          )}

          {/* NEURAL WORKER HANDOFF ROUTING GRAPH */}
          {sessionState.status === 'analyzing' && (
            <div className="glass-card p-6 rounded-10 border border-[#1E1E22] space-y-6 relative overflow-hidden bg-[#0D0D0F]/50">
              <h3 className="text-[9px] font-bold uppercase tracking-wider text-[#71717A] flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#8B5CF6]" />
                Neural Worker Handoff Routing Graph
              </h3>

              <div className="flex items-center justify-between max-w-lg mx-auto relative px-4 py-2">
                <div className="absolute left-10 right-10 top-[28px] h-[1px] bg-[#1E1E22] -z-10" />

                {/* Node 1: AI Manager */}
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border text-xs font-mono font-bold transition-all ${
                    getNodeState('manager') === 'running' 
                      ? 'border-[#8B5CF6] bg-[#8B5CF6]/10 text-[#8B5CF6] scale-105' 
                      : getNodeState('manager') === 'completed'
                        ? 'border-[#10B981] bg-[#10B981]/10 text-[#10B981]'
                        : 'border-[#1E1E22] bg-[#09090B] text-[#71717A]'
                  }`}>
                    🧠
                  </div>
                  <span className="text-[8px] uppercase tracking-wider text-[#71717A]">Manager</span>
                </div>

                {/* Node 2: Data Analyst */}
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border text-xs font-mono font-bold transition-all ${
                    getNodeState('analyst') === 'running' 
                      ? 'border-[#06B6D4] bg-[#06B6D4]/10 text-[#06B6D4] scale-105' 
                      : getNodeState('analyst') === 'completed'
                        ? 'border-[#10B981] bg-[#10B981]/10 text-[#10B981]'
                        : 'border-[#1E1E22] bg-[#09090B] text-[#71717A]'
                  }`}>
                    📊
                  </div>
                  <span className="text-[8px] uppercase tracking-wider text-[#71717A]">Analyst</span>
                </div>

                {/* Node 3: Business Strategist */}
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border text-xs font-mono font-bold transition-all ${
                    getNodeState('strategist') === 'running' 
                      ? 'border-[#06B6D4] bg-[#06B6D4]/10 text-[#06B6D4] scale-105' 
                      : getNodeState('strategist') === 'completed'
                        ? 'border-[#10B981] bg-[#10B981]/10 text-[#10B981]'
                        : 'border-[#1E1E22] bg-[#09090B] text-[#71717A]'
                  }`}>
                    📈
                  </div>
                  <span className="text-[8px] uppercase tracking-wider text-[#71717A]">Strategist</span>
                </div>

                {/* Node 4: Creator */}
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border text-xs font-mono font-bold transition-all ${
                    getNodeState('writer') === 'running' || getNodeState('designer') === 'running'
                      ? 'border-[#06B6D4] bg-[#06B6D4]/10 text-[#06B6D4] scale-105' 
                      : getNodeState('writer') === 'completed'
                        ? 'border-[#10B981] bg-[#10B981]/10 text-[#10B981]'
                        : 'border-[#1E1E22] bg-[#09090B] text-[#71717A]'
                  }`}>
                    📝
                  </div>
                  <span className="text-[8px] uppercase tracking-wider text-[#71717A]">Creator</span>
                </div>

                {/* Node 5: Exporter */}
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border text-xs font-mono font-bold transition-all ${
                    getNodeState('exporter') === 'running' 
                      ? 'border-[#06B6D4] bg-[#06B6D4]/10 text-[#06B6D4] scale-105' 
                      : getNodeState('exporter') === 'completed'
                        ? 'border-[#10B981] bg-[#10B981]/10 text-[#10B981]'
                        : 'border-[#1E1E22] bg-[#09090B] text-[#71717A]'
                  }`}>
                    📦
                  </div>
                  <span className="text-[8px] uppercase tracking-wider text-[#71717A]">Export</span>
                </div>

              </div>
            </div>
          )}

          {/* Dynamic Ingest Area Chart or Dashed Idle State */}
          {!telemetry.hasData ? (
            <div className="border border-dashed border-[#1E1E22] bg-[#0D0D0F]/30 rounded-14 p-8 flex flex-col items-center justify-center text-center gap-2.5 h-56">
              <BarChart3 className="w-6 h-6 text-[#71717A] animate-pulse" />
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#FAFAFA]">Awaiting Data Telemetry</h4>
              <p className="text-[10px] text-[#71717A] max-w-xs leading-relaxed">
                Ingest a spreadsheet or PDF document above. Your workspace will automatically parse columns, map key semantics, and render dynamic telemetry charts here.
              </p>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-5 rounded-14 space-y-4"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA]">
                    {telemetry.primaryMetric.toUpperCase()} BY {telemetry.labelKey.toUpperCase()}
                  </h3>
                  <p className="text-[10px] text-[#71717A] mt-0.5">
                    Showing dynamic progression of {telemetry.primaryMetric} across individual {telemetry.labelKey} records.
                  </p>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border status-badge-success">
                  Active Ingest
                </span>
              </div>
              <div className="w-full h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={telemetry.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#71717A" fontSize={9} tickLine={false} axisLine={false} />
                    <YAxis stroke="#71717A" fontSize={9} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ background: '#0D0D0F', border: '1px solid #1E1E22', borderRadius: '8px' }}
                      labelStyle={{ fontSize: '10px', color: '#FAFAFA', fontWeight: 'bold' }}
                      itemStyle={{ fontSize: '10px', color: '#06B6D4' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey={telemetry.primaryMetric} 
                      stroke="#06B6D4" 
                      strokeWidth={1.5} 
                      fillOpacity={1} 
                      fill="url(#cyanGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* 2. Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#FAFAFA]">Active System Tasks</h2>
              <p className="text-xs text-[#A1A1AA] mt-1">Monitor operational progress and download compiled documentation.</p>
            </div>
            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
              sessionState.status === 'analyzing' 
                ? 'status-badge-active animate-pulse'
                : 'status-badge-success'
            }`}>
              {sessionState.status === 'analyzing' ? 'Active execution' : 'Idle'}
            </span>
          </div>

          <div className="space-y-4">
            {sessionState.status === 'analyzing' && (
              <div className="glass-card p-4 rounded-14 flex items-center justify-between border-l-2 border-l-[#8B5CF6]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-10 bg-[#09090B] border border-[#1E1E22] flex items-center justify-center text-[#8B5CF6] animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-[#8B5CF6]">TSK_ACTIVE</span>
                    <h4 className="text-xs font-semibold text-[#FAFAFA] mt-0.5">Processing {sessionState.fileMetadata?.name}</h4>
                  </div>
                </div>
              </div>
            )}

            {executionHistory.length > 0 ? (
              executionHistory.map((tsk, i) => (
                <div key={i} className="glass-card p-4 rounded-14 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-10 bg-[#09090B] border border-[#1E1E22] flex items-center justify-center text-[#10B981]">
                        <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-[#06B6D4]">{tsk.id}</span>
                          <span className="text-xs text-[#FAFAFA] font-medium">Completed analysis for {tsk.fileName}</span>
                        </div>
                        <p className="text-[9px] font-mono text-[#71717A] mt-0.5">RUN_ID: {tsk.sessionId}  |  {tsk.timestamp}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border status-badge-success">
                        Success
                      </span>
                      {/* Operational delete trash button */}
                      <button 
                        onClick={() => onDeleteTask(tsk.sessionId)}
                        className="p-1.5 rounded-8 text-[#71717A] hover:text-[#EF4444] hover:bg-[#EF4444]/5 border border-transparent hover:border-[#EF4444]/15 transition-all"
                        title="Delete Task Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-3 border-t border-[#1E1E22]">
                    <span className="text-[9px] font-mono font-bold text-[#71717A] tracking-wider">OUTPUTS:</span>
                    <a href={tsk.artifacts?.pdfUrl} download className="h-7 px-2.5 rounded-8 bg-[#09090B] hover:bg-[#121214] border border-[#1E1E22] text-[10px] text-[#FAFAFA] font-semibold flex items-center gap-1.5 transition-colors">
                      <FileText className="w-3 h-3 text-[#EF4444]" /> PDF Report
                    </a>
                    <a href={tsk.artifacts?.docxUrl} download className="h-7 px-2.5 rounded-8 bg-[#09090B] hover:bg-[#121214] border border-[#1E1E22] text-[10px] text-[#FAFAFA] font-semibold flex items-center gap-1.5 transition-colors">
                      <FileText className="w-3 h-3 text-[#3B82F6]" /> Word Report
                    </a>
                    <a href={tsk.artifacts?.pptxUrl} download className="h-7 px-2.5 rounded-8 bg-[#09090B] hover:bg-[#121214] border border-[#1E1E22] text-[10px] text-[#FAFAFA] font-semibold flex items-center gap-1.5 transition-colors">
                      <Zap className="w-3 h-3 text-[#F59E0B]" /> Slides
                    </a>
                    <a href={tsk.artifacts?.zipUrl} download className="h-7 px-2.5 rounded-8 bg-[#06B6D4]/5 hover:bg-[#06B6D4]/10 border border-[#06B6D4]/15 text-[10px] text-[#06B6D4] font-bold flex items-center gap-1.5 transition-colors">
                      <Archive className="w-3 h-3" /> Archive ZIP
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-card p-6 rounded-14 text-center space-y-3">
                <Clock className="w-6 h-6 text-[#71717A] mx-auto animate-pulse" />
                <h4 className="text-xs font-bold text-[#FAFAFA]">No active logs detected</h4>
                <p className="text-[10px] text-[#71717A] max-w-xs mx-auto">Ingest database metrics on the central dashboard module to begin automated task queues.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#FAFAFA]">Ready-Made Templates</h2>
            <p className="text-xs text-[#A1A1AA] mt-1">Select a configuration template card below to pre-populate your command buffer.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { title: '📊 Monthly Sales Report', desc: 'Analyzes margins, parses anomalies, plans visualization charts, and compiles ppt templates.', prompt: 'Prepare a complete monthly sales review, outlining leading revenue drivers, flagging operational deficits, and rendering performance line graphs.' },
              { title: '📝 Business Document Summary', desc: 'Extracts critical structural findings, compiles key objective lists, and drafts emails.', prompt: 'Summarize this internal operations document, list top 3 operational objectives, and draft a team announcement email.' },
              { title: '📈 Regional Margin Review', desc: 'Isolates unprofitable territories, evaluates cost models, and drafts strategic initiatives.', prompt: 'Evaluate cost of operations versus territory profitability, isolate territories with sub-optimal margins, and build an action plan.' },
              { title: '⚙️ General Data Audit', desc: 'Inspects column structures, calculates cell statistics, and prints summary documentation.', prompt: 'Inspect this spreadsheet data structure, verify column datatypes, calculate basic averages, and output a summary pdf.' }
            ].map((tmpl, i) => (
              <div 
                key={i} 
                onClick={() => handleTemplateSelect(tmpl.prompt)}
                className="glass-card p-5 rounded-10 bg-[#121214]/40 hover:bg-[#121214] cursor-pointer border border-[#1E1E22] group transition-all"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-xs font-bold text-[#FAFAFA] group-hover:text-[#06B6D4] transition-colors">{tmpl.title}</h3>
                  <ChevronRight className="w-3.5 h-3.5 text-[#71717A] group-hover:text-[#06B6D4] transition-all" />
                </div>
                <p className="text-[11px] text-[#A1A1AA] mt-2 leading-relaxed">{tmpl.desc}</p>
                <div className="mt-4 p-2 bg-[#09090B] border border-[#1E1E22] rounded-8 text-[9px] font-mono text-[#71717A] truncate">
                  Prompt: {tmpl.prompt}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#FAFAFA]">Execution Archive Logs</h2>
            <p className="text-xs text-[#A1A1AA] mt-1">Review previously parsed sheets, database sizes, and session logs.</p>
          </div>

          <div className="space-y-4">
            {executionHistory.length > 0 ? (
              executionHistory.map((hist, i) => (
                <div key={i} className="glass-card p-4 rounded-14 flex items-center justify-between border-l-2 border-l-[#06B6D4] border border-[rgba(255,255,255,0.04)] bg-[#121214]/20 hover:bg-[#121214]/50 transition-all">
                  <div className="flex items-center gap-3.5">
                    <div className="w-8 h-8 rounded-10 bg-[#09090B] border border-[#1E1E22] flex items-center justify-center text-[#06B6D4]">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#FAFAFA]">{hist.fileName}</h4>
                      <p className="text-[9px] font-mono text-[#71717A] mt-0.5">Session ID: {hist.sessionId}  |  Size: {(hist.fileSize / 1024).toFixed(1)} KB  |  {hist.timestamp}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <a href={hist.artifacts?.zipUrl} download className="h-8 px-3 rounded-8 bg-[#09090B] hover:bg-[#121214] border border-[#1E1E22] text-[10px] text-[#FAFAFA] font-semibold flex items-center gap-1.5 transition-colors">
                      <Download className="w-3.5 h-3.5" /> Download Archive ZIP
                    </a>
                    {/* Operational delete trash button for history archive as well */}
                    <button 
                      onClick={() => onDeleteTask(hist.sessionId)}
                      className="p-2 rounded-8 text-[#71717A] hover:text-[#EF4444] hover:bg-[#EF4444]/5 border border-transparent hover:border-[#EF4444]/15 transition-all"
                      title="Delete Archived Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-card p-6 rounded-14 text-center space-y-3">
                <Archive className="w-6 h-6 text-[#71717A] mx-auto animate-pulse" />
                <h4 className="text-xs font-bold text-[#FAFAFA]">No history files logged</h4>
                <p className="text-[10px] text-[#71717A] max-w-sm mx-auto">Once your AI completes a workspace task, completed files will be archived here for persistent access.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Advanced Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#FAFAFA]">Advanced Workspace Analysis</h2>
            <p className="text-xs text-[#A1A1AA] mt-1">
              {telemetry.hasData 
                ? `Mapped dynamically from database column vectors: "${telemetry.primaryMetric}" and "${telemetry.secondaryMetric}"` 
                : 'Advanced statistical metrics and placeholders.'}
            </p>
          </div>

          {!telemetry.hasData ? (
            <div className="border border-dashed border-[#1E1E22] bg-[#0D0D0F]/30 rounded-10 p-12 flex flex-col items-center justify-center text-center gap-2.5 h-72">
              <Sliders className="w-6 h-6 text-[#71717A] animate-pulse" />
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#FAFAFA]">No Active Ingest Detected</h4>
              <p className="text-[10px] text-[#71717A] max-w-xs leading-relaxed">
                Ingest a spreadsheet or PDF document above. Advanced analytical models require parsed metrics to evaluate distributions and variance trends.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {/* Primary Series: BarChart */}
              <div className="glass-card p-5 rounded-14 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA]">
                    {telemetry.primaryMetric.toUpperCase()} BY {telemetry.labelKey.toUpperCase()}
                  </h3>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border status-badge-success">
                    Active Ingest
                  </span>
                </div>
                <div className="w-full h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={telemetry.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#71717A" fontSize={9} tickLine={false} axisLine={false} />
                      <YAxis stroke="#71717A" fontSize={9} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ background: '#0D0D0F', border: '1px solid #1E1E22', borderRadius: '8px' }}
                        itemStyle={{ color: '#06B6D4', fontSize: '10px' }}
                      />
                      <Bar dataKey={telemetry.primaryMetric} fill="#06B6D4" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Secondary Series: AreaChart */}
              <div className="glass-card p-5 rounded-14 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA]">
                    {telemetry.secondaryMetric.toUpperCase()} BY {telemetry.labelKey.toUpperCase()}
                  </h3>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border status-badge-active">
                    Active Ingest
                  </span>
                </div>
                <div className="w-full h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={telemetry.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#71717A" fontSize={9} tickLine={false} axisLine={false} />
                      <YAxis stroke="#71717A" fontSize={9} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ background: '#0D0D0F', border: '1px solid #1E1E22', borderRadius: '8px' }}
                        itemStyle={{ color: '#8B5CF6', fontSize: '10px' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey={telemetry.secondaryMetric} 
                        stroke="#8B5CF6" 
                        fill="#8B5CF6" 
                        fillOpacity={0.06} 
                        strokeWidth={1.5} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#FAFAFA]">System Core Settings</h2>
            <p className="text-xs text-[#A1A1AA] mt-1">Configure your workspace local LLM endpoint parameters and variables.</p>
          </div>

          <div className="space-y-4">
            <div className="glass-card p-5 rounded-14 space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#06B6D4] flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5" /> Local Model Configuration
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-[#A1A1AA] uppercase tracking-wider block">Ollama Model ID</label>
                  <input 
                    type="text" 
                    value="qwen2.5-coder:7b" 
                    disabled 
                    className="w-full h-9 px-3.5 text-xs rounded-10 custom-input opacity-65 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-[#A1A1AA] uppercase tracking-wider block">Inference Host Port</label>
                  <input 
                    type="text" 
                    value="http://localhost:11434/v1" 
                    disabled 
                    className="w-full h-9 px-3.5 text-xs rounded-10 custom-input opacity-65 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="glass-card p-5 rounded-14 space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#8B5CF6] flex items-center gap-2">
                <Code className="w-3.5 h-3.5" /> Backend API Environment
              </h3>
              
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-[#A1A1AA] uppercase tracking-wider block">Endpoint Routing URL</label>
                <input 
                  type="text" 
                  value="http://localhost:5001/api" 
                  disabled 
                  className="w-full h-9 px-3.5 text-xs rounded-10 custom-input opacity-65 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}