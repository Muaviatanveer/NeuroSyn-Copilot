import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, LineChart, PenTool, Palette, Archive, Cpu, Check } from 'lucide-react';

export function LoginPageOrchestrator({ children }) {
  const [activeIndex, setActiveNodeIndex] = useState(1);

  // Radial node coordinates (X, Y offsets relative to the parent card center)
  const nodes = [
    { id: 'manager', label: 'AI Manager', icon: Cpu, x: 0, y: -210, role: 'Orchestrator', isManager: true },
    { id: 'analyst', label: 'Data Analyst', icon: BarChart3, x: -330, y: -100, role: 'Data Mining' },
    { id: 'strategist', label: 'Business Strategist', icon: LineChart, x: 330, y: -100, role: 'Analytics' },
    { id: 'writer', label: 'Report Writer', icon: PenTool, x: 350, y: 50, role: 'Drafting' },
    { id: 'designer', label: 'Presentation Designer', icon: Palette, x: -310, y: 160, role: 'Layouts' },
    { id: 'exporter', label: 'Export Manager', icon: Archive, x: 310, y: 160, role: 'Compiler' }
  ];

  // Automated diagnostic loop scanning employees (1 to 5)
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNodeIndex(prev => (prev === nodes.length - 1 ? 1 : prev + 1));
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const getNodeStatus = (index) => {
    if (index === 0) return 'manager'; // Manager is apex
    if (index === activeIndex) return 'active';
    if (index < activeIndex) return 'completed';
    return 'idle';
  };

  return (
    <div className="relative w-full min-h-[580px] flex items-center justify-center select-none font-mono">
      
      {/* Subtle Concentric Neural Grid Rings (Theme Detail) */}
      <div className="absolute w-[680px] h-[680px] rounded-full border border-[rgba(255,255,255,0.012)] pointer-events-none z-0" />
      <div className="absolute w-[820px] h-[820px] rounded-full border border-[rgba(255,255,255,0.008)] pointer-events-none z-0" />

      {/* SVG Connections Layer (Connecting Apex Manager and Card Corners) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        {nodes.map((node, idx) => {
          // Calculate center coordinates inside parent viewport
          const centerViewportX = 430; // Half of parent container approximate width
          const centerViewportY = 290; // Half of parent container approximate height

          const startX = centerViewportX + nodes[0].x;
          const startY = centerViewportY + nodes[0].y;
          const endX = centerViewportX + node.x;
          const endY = centerViewportY + node.y;

          if (idx === 0) return null; // No line to self

          const status = getNodeStatus(idx);
          const isActive = status === 'active';
          const isCompleted = status === 'completed';

          return (
            <g key={node.id}>
              {/* Idle line */}
              <line 
                x1={startX} y1={startY} x2={endX} y2={endY} 
                stroke="#1E1E22" strokeWidth="1" strokeDasharray="3 3"
                opacity="0.3"
              />
              {/* Active flowing cyan path */}
              {isActive && (
                <motion.line 
                  x1={startX} y1={startY} x2={endX} y2={endY} 
                  stroke="#06B6D4" strokeWidth="1.5"
                  initial={{ strokeDashoffset: 20 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                  strokeDasharray="6 4"
                />
              )}
              {/* Completed solid green path */}
              {isCompleted && (
                <line 
                  x1={startX} y1={startY} x2={endX} y2={endY} 
                  stroke="#10B981" strokeWidth="1" opacity="0.6"
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Centered Login Card Child */}
      <div className="relative z-10 mx-auto">
        {children}
      </div>

      {/* Outer Floating Employee Nodes */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-20">
        {nodes.map((node, idx) => {
          const Icon = node.icon;
          const status = getNodeStatus(idx);
          const isManager = node.isManager;
          const isActive = status === 'active';
          const isCompleted = status === 'completed';

          // Coordinates are centered relative to the middle of the parent frame
          const leftOffset = `calc(50% + ${node.x}px - ${isManager ? '28px' : '20px'})`;
          const topOffset = `calc(50% + ${node.y}px - ${isManager ? '28px' : '20px'})`;

          return (
            <div
              key={node.id}
              style={{ position: 'absolute', left: leftOffset, top: topOffset }}
              className="group pointer-events-auto"
            >
              {/* Node Core circle */}
              <motion.div
                animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                transition={{ repeat: Infinity, duration: 2.5 }}
                className={`rounded-full border flex items-center justify-center transition-all ${
                  isManager 
                    ? 'w-14 h-14 border-[#8B5CF6]/50 bg-[#8B5CF6]/5 text-[#8B5CF6] shadow-sm shadow-[#8B5CF6]/5' 
                    : isActive
                      ? 'w-10 h-10 border-[#06B6D4] bg-[#06B6D4]/10 text-[#06B6D4] shadow-sm shadow-[#06B6D4]/5'
                      : isCompleted
                        ? 'w-10 h-10 border-[#10B981] bg-[#10B981]/5 text-[#10B981]'
                        : 'w-10 h-10 border-[#1E1E22] bg-[#09090B] text-[#71717A] hover:border-[#2E2E35]'
                }`}
              >
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </motion.div>

              {/* Hover Tooltip Details */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-13 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none bg-[#0D0D0F] border border-[#1E1E22] px-3 py-2 rounded-8 text-center space-y-0.5 shadow-xl w-36">
                <span className="text-[10px] font-bold text-[#FAFAFA] block">{node.label}</span>
                <span className="text-[8px] text-[#71717A] block">{node.role}</span>
                <span className={`text-[8px] font-bold uppercase tracking-wider block mt-1 ${
                  isActive ? 'text-[#06B6D4]' : isCompleted ? 'text-[#10B981]' : 'text-[#71717A]'
                }`}>
                  {isActive ? 'Computing' : isCompleted ? 'Ready' : 'Standby'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}