import React from 'react';
import { 
  LayoutDashboard, Layers, Sliders, History, BarChart3, Settings, 
  User, HardDrive, Cpu, Terminal, LogOut
} from 'lucide-react';

export function Sidebar({ activeTab, setActiveTab, onLogout }) {
  const menuItems = [
    { id: 'dashboard', label: 'Workspace', icon: LayoutDashboard, shortcut: '⌘1' },
    { id: 'tasks', label: 'Tasks', icon: Layers, shortcut: '⌘2' },
    { id: 'templates', label: 'Templates', icon: Sliders, shortcut: '⌘3' },
    { id: 'history', label: 'Archive', icon: History, shortcut: '⌘4' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, shortcut: '⌘5' },
    { id: 'settings', label: 'Settings', icon: Settings, shortcut: '⌘6' }
  ];

  return (
    <aside className="w-[300px] h-screen bg-[#121214] border-r border-[#1E1E22] flex flex-col justify-between shrink-0 select-none">
      
      {/* Brand Header */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-10 bg-[#09090B] border border-[#1E1E22] flex items-center justify-center shadow-inner">
            <Terminal className="w-5 h-5 text-[#06B6D4]" />
          </div>
          <div>
            <div className="text-xs font-bold tracking-tight text-[#FAFAFA] uppercase">
              NeuroSyn Copilot
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <span className="text-[9px] font-mono tracking-wider text-[#A1A1AA] uppercase">
                OS v2.0-Production
              </span>
            </div>
          </div>
        </div>

        {/* Menu Navigation Items */}
        <nav className="mt-10 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full h-10 px-3 rounded-10 flex items-center justify-between text-xs font-medium transition-all duration-150 group ${
                  isActive 
                    ? 'text-[#FAFAFA] bg-[#1E1E22] border-l-2 border-l-[#06B6D4]' 
                    : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#1E1E22]/40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${
                    isActive ? 'text-[#06B6D4]' : 'text-[#71717A]'
                  }`} />
                  <span>{item.label}</span>
                </div>

                <span className="text-[9px] font-mono text-[#71717A] bg-[#09090B] border border-[#1E1E22] px-1.5 py-0.5 rounded-4 opacity-70 group-hover:opacity-100 transition-opacity">
                  {item.shortcut}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile and Telemetry */}
      <div className="p-6 border-t border-[#1E1E22] space-y-6">
        
        {/* Storage Telemetry */}
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-mono">
            <span className="text-[#A1A1AA] flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5" /> STG_THRESHOLD
            </span>
            <span className="text-[#FAFAFA]">4.2% (42.8 MB)</span>
          </div>
          <div className="w-full h-1 bg-[#09090B] border border-[#1E1E22] rounded-full overflow-hidden">
            <div className="h-full bg-[#06B6D4] rounded-full" style={{ width: '4.2%' }} />
          </div>
        </div>

        {/* User Card with unified Logout trigger */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#09090B] border border-[#1E1E22] flex items-center justify-center text-xs font-mono font-bold text-[#06B6D4]">
              OP
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#FAFAFA] truncate">Enterprise Admin</p>
              <p className="text-[9px] font-mono text-[#71717A] truncate">neurosyn-admin@company.local</p>
            </div>
          </div>
          
          <button 
            onClick={onLogout}
            className="p-2 text-[#71717A] hover:text-[#EF4444] hover:bg-[#EF4444]/5 border border-transparent hover:border-[#EF4444]/15 rounded-8 transition-all"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}