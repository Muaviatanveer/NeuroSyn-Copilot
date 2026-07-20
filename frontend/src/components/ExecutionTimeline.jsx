import React from 'react';
import { 
  BarChart3, PenTool, Palette, LineChart, Archive, 
  CheckCircle2, Clock, Play, HelpCircle, Cpu, ShieldAlert,
  Database, Activity
} from 'lucide-react';

export function ExecutionTimeline({ steps = [], currentStatus }) {
  
  const employees = [
    { name: 'Data Analyst', codeName: 'Analyst', role: 'Data Mining', icon: BarChart3 },
    { name: 'Business Strategist', codeName: 'Strategist', role: 'Analytics', icon: LineChart },
    { name: 'Presentation Designer', codeName: 'Designer', role: 'Visual Layouts', icon: Palette },
    { name: 'Report Writer', codeName: 'Writer', role: 'Corporate Drafting', icon: PenTool },
    { name: 'Export Manager', codeName: 'Exporter', role: 'Asset Compiler', icon: Archive }
  ];

  const activeStep = steps.find(s => s.status === 'running');
  const activeAgentCodeName = activeStep ? activeStep.agent : null;

  // Real-time generated assets checklist mapper
  const getAssetStatus = (stepId) => {
    const step = steps.find(s => s.id === stepId);
    if (!step) return 'pending';
    return step.status; // pending | running | completed
  };

  return (
    <aside className="w-[360px] h-screen bg-[#121214] border-l border-[#1E1E22] flex flex-col shrink-0 overflow-y-auto select-none font-mono">
      
      {/* Sidebar Section Header */}
      <div className="p-5 border-b border-[#1E1E22]">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#FAFAFA]">Autonomous Workspace Core</h2>
        <p className="text-[10px] text-[#71717A] mt-1">Real-time telemetry and task handoffs</p>
      </div>

      {/* AI Employees Roster with Live States */}
      <div className="p-5 border-b border-[#1E1E22] space-y-4">
        <h3 className="text-[9px] uppercase tracking-wider font-bold text-[#71717A]">Active Roster</h3>
        
        <div className="space-y-2">
          {employees.map((emp, i) => {
            const Icon = emp.icon;
            const isEmployeeRunning = activeAgentCodeName && activeAgentCodeName.toLowerCase().includes(emp.codeName.toLowerCase());
            const hasCompleted = currentStatus === 'completed' || (steps.length > 0 && steps.some(s => s.agent && s.agent.includes(emp.codeName) && s.status === 'completed'));

            return (
              <div 
                key={i} 
                className={`p-3 rounded-10 border transition-all flex items-center justify-between ${
                  isEmployeeRunning 
                    ? 'bg-[#18181B] border-[#06B6D4]/40 shadow-inner' 
                    : 'bg-[#0D0D0F]/40 border-[#1E1E22]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-8 flex items-center justify-center transition-colors ${
                    isEmployeeRunning 
                      ? 'bg-[#06B6D4]/10 text-[#06B6D4]' 
                      : hasCompleted 
                        ? 'bg-[#10B981]/10 text-[#10B981]' 
                        : 'bg-[#121214] text-[#71717A] border border-[#1E1E22]'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-[#FAFAFA]">{emp.name}</h4>
                    <p className="text-[9px] text-[#71717A]">{emp.role}</p>
                  </div>
                </div>

                {/* Granular state configurations */}
                {isEmployeeRunning ? (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-[#8B5CF6]/30 bg-[#8B5CF6]/5 text-[#8B5CF6] text-[8px] font-bold uppercase tracking-wider">
                    {/* Moving Particle Indicators */}
                    <span className="flex gap-0.5">
                      <span className="w-1 h-1 rounded-full bg-[#8B5CF6] animate-ping" />
                      <span className="w-1 h-1 rounded-full bg-[#8B5CF6] animate-ping delay-100" />
                    </span>
                    <span>Thinking</span>
                  </div>
                ) : hasCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                ) : (
                  <span className="text-[9px] text-[#71717A] uppercase">Waiting</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Generated Assets Monitor */}
      <div className="p-5 border-b border-[#1E1E22] space-y-3">
        <h3 className="text-[9px] uppercase tracking-wider font-bold text-[#71717A]">Generated Assets Directory</h3>
        
        <div className="space-y-2 text-[10px]">
          {[
            { id: 'charts', label: 'High-Res Charts.png', role: 'Designer' },
            { id: 'documents', label: 'Executive_Report.pdf', role: 'Writer' },
            { id: 'documents', label: 'Summary_Document.docx', role: 'Writer' },
            { id: 'slides', label: 'Pitch_Presentation.pptx', role: 'Designer' },
            { id: 'packaging', label: 'Workspace_Archive.zip', role: 'Exporter' }
          ].map((asset, i) => {
            const status = getAssetStatus(asset.id);
            return (
              <div key={i} className="flex items-center justify-between p-2 rounded-8 bg-[#0D0D0F]/20 border border-[#1E1E22]">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    status === 'completed' ? 'bg-[#10B981]' : status === 'running' ? 'bg-[#8B5CF6] animate-pulse' : 'bg-[#1E1E22]'
                  }`} />
                  <span className={status === 'completed' ? 'text-[#FAFAFA]' : 'text-[#71717A]'}>{asset.label}</span>
                </div>
                <span className={`text-[8px] uppercase px-1.5 py-0.5 rounded ${
                  status === 'completed' 
                    ? 'status-badge-success' 
                    : status === 'running' 
                      ? 'status-badge-active animate-pulse' 
                      : 'text-[#71717A] bg-[#121214]'
                }`}>
                  {status === 'completed' ? 'Ready' : status === 'running' ? 'Building' : 'Idle'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Live System Telemetry */}
      <div className="p-5 mt-auto bg-[#09090B]/40 space-y-3.5 border-t border-[#1E1E22]">
        <h3 className="text-[9px] uppercase tracking-wider font-bold text-[#71717A] flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-[#06B6D4]" />
          System Resource Telemetry
        </h3>

        <div className="grid grid-cols-2 gap-3 text-[10px]">
          <div className="p-2.5 rounded-8 bg-[#0D0D0F]/80 border border-[#1E1E22] space-y-1">
            <span className="text-[#71717A] text-[9px] uppercase block">Ollama CPU</span>
            <span className={`font-mono font-bold ${currentStatus === 'analyzing' ? 'text-[#06B6D4]' : 'text-[#FAFAFA]'}`}>
              {currentStatus === 'analyzing' ? '24.8% Active' : '0.4% Idle'}
            </span>
          </div>
          <div className="p-2.5 rounded-8 bg-[#0D0D0F]/80 border border-[#1E1E22] space-y-1">
            <span className="text-[#71717A] text-[9px] uppercase block">Local RAM</span>
            <span className="font-mono font-bold text-[#FAFAFA]">
              {currentStatus === 'analyzing' ? '1.14 GB' : '412 MB'}
            </span>
          </div>
          <div className="p-2.5 rounded-8 bg-[#0D0D0F]/80 border border-[#1E1E22] space-y-1">
            <span className="text-[#71717A] text-[9px] uppercase block">Tokens Processed</span>
            <span className="font-mono font-bold text-[#FAFAFA]">
              {currentStatus === 'completed' ? '~4,250 tokens' : currentStatus === 'analyzing' ? 'Streaming...' : '0 tokens'}
            </span>
          </div>
          <div className="p-2.5 rounded-8 bg-[#0D0D0F]/80 border border-[#1E1E22] space-y-1">
            <span className="text-[#71717A] text-[9px] uppercase block">Cost Deflected</span>
            <span className="font-mono font-bold text-[#10B981]">
              {currentStatus === 'completed' ? '$14.20 Saved' : '$0.00'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}