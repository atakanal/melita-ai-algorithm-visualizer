import React, { useState, useEffect } from 'react';
import { Network, Clock, Database, Lightbulb, X, Maximize2, Cpu, AlertTriangle } from 'lucide-react'; 
import MermaidDiagram from './MermaidDiagram';
import { SimulationResponse } from '../types';

interface OutputPanelProps {
  data: SimulationResponse | null;
  isLoading: boolean;
  error?: string | null; 
}

/**
 * Loading state UX enhancement.
 * Rotating these technical messages keeps the user engaged during the 
 * 5-20 second wait time required for the LLM to process complex algorithms.
 */
const LOADING_MESSAGES = [
  "Calculating Big O Notation...",
  "Generating Execution Graph...",
  "Analyzing Recursion Depth...",
  "Preparing AI Optimization Tips...",
  "Finalizing Visuals..."
];

/**
 * OutputPanel Component
 * * The visualization layer of the application.
 * * Responsibilities:
 * - Orchestrates the transition between Loading, Error, and Success states.
 * - Renders the interactive Mermaid diagram (Execution Graph).
 * - Displays analytical metrics (Time/Space Complexity) in a structured dashboard.
 */
const OutputPanel: React.FC<OutputPanelProps> = ({ data, isLoading, error }) => {
  const [showTipModal, setShowTipModal] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // Effect: Cycle through loading messages every 2.5s to reduce perceived latency
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isLoading) {
      intervalId = setInterval(() => {
        setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % LOADING_MESSAGES.length);
      }, 2500);
    } else {
      setCurrentMessageIndex(0);
    }
    return () => clearInterval(intervalId);
  }, [isLoading]);

  return (
    <div className="flex flex-col h-full bg-cyber-black relative overflow-hidden h-screen overflow-y-auto pb-20">
      
      {/* 1. OPTIMIZATION TIP MODAL (Overlay) */}
      {/* Provides a focused view for the AI's detailed optimization suggestions */}
      {showTipModal && data?.optimizationTip && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0a0a0e] border border-yellow-500/30 rounded-lg shadow-[0_0_50px_rgba(234,179,8,0.2)] max-w-md w-full relative">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-yellow-500/10">
              <div className="flex items-center space-x-2">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                <span className="font-bold text-yellow-500 tracking-wider text-sm uppercase">AI Optimization Tip</span>
              </div>
              <button onClick={() => setShowTipModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 text-gray-300 font-sans leading-relaxed text-sm">
              {data.optimizationTip}
            </div>
            <div className="px-4 py-3 border-t border-gray-800 bg-gray-900/50 text-right">
              <button onClick={() => setShowTipModal(false)} className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs text-white rounded border border-gray-700 transition-all">
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Bar Indicator (Gradient changes based on error state) */}
      <div className={`h-1 w-full bg-gradient-to-r ${error ? 'from-red-600 to-orange-600' : 'from-cyber-cyan to-cyber-purple'}`}></div>

      {/* 2. CONDITIONAL RENDERING LOGIC */}
      
      {/* STATE A: LOADING VIEW */}
      {isLoading ? (
        <div className="flex-grow flex flex-col items-center justify-center text-cyber-cyan space-y-6">
          <div className="relative">
             <div className="absolute -inset-4 bg-cyber-cyan/20 rounded-full blur-xl animate-pulse"></div>
             <Cpu className="w-20 h-20 animate-spin-slow relative z-10" />
          </div>
          <h2 className="text-3xl font-bold font-mono tracking-[0.2em] animate-pulse bg-clip-text text-transparent bg-gradient-to-r from-cyber-cyan to-purple-500">
            ANALYZING
          </h2>
          <div className="h-6 overflow-hidden">
             <p key={currentMessageIndex} className="text-cyber-dim font-mono text-sm tracking-wider animate-in fade-in slide-in-from-bottom-2 duration-500">
               {LOADING_MESSAGES[currentMessageIndex]}
             </p>
          </div>
        </div>

      /* STATE B: ERROR VIEW */
      ) : error ? (
        <div className="flex-grow flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
            <div className="mb-6 rounded-full bg-red-900/20 p-6 border border-red-500/30 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
                <AlertTriangle className="w-16 h-16 text-red-500" />
            </div>
            <h3 className="mb-3 text-2xl font-bold text-red-400 tracking-wide font-mono">SYSTEM_ERROR_DETECTED</h3>
            <div className="max-w-md p-4 bg-red-950/30 border border-red-900/50 rounded-lg backdrop-blur-sm">
                <p className="text-red-200/90 font-sans leading-relaxed">{error}</p>
            </div>
            <button onClick={() => window.location.reload()} className="mt-8 px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-mono text-sm rounded transition-all">REBOOT_SYSTEM()</button>
        </div>

      /* STATE C: IDLE / EMPTY STATE */
      ) : !data ? (
        <div className="flex-grow flex flex-col items-center justify-center text-cyber-dim space-y-4 opacity-50">
          <Network className="w-20 h-20" />
          <p className="text-lg font-mono">AWAITING INPUT_</p>
        </div>

      /* STATE D: SUCCESS / VISUALIZATION DASHBOARD */
      ) : (
        <div className="grid grid-rows-4 h-full overflow-hidden">
          
          {/* SECTION 1: EXECUTION GRAPH (65% Height) */}
          <div className="row-span-3 flex flex-col border-b border-cyber-dark min-h-0" style={{ flex: 3, minHeight: '65%' }}>
            <div className="px-6 py-3 bg-cyber-panel/50 border-b border-cyber-dark flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                 <Network className="w-4 h-4 text-cyber-cyan" />
                 <h2 className="text-sm font-bold tracking-wider text-cyber-cyan uppercase">Execution Visualization</h2>
              </div>
            </div>
            <div className="flex-grow bg-[#0a0a0e] relative overflow-hidden">
               
               {/* UI Fix: Positioned badge at bottom-right to avoid overlapping diagram nodes */}
               <div className="absolute bottom-4 right-4 text-[10px] text-cyber-dim font-mono border border-cyber-dim/20 px-2 py-1 rounded bg-black/50 backdrop-blur z-20 pointer-events-none">
                RENDERER: MERMAID.JS
              </div>

              <div className="w-full h-full">
               <MermaidDiagram chart={data.mermaidGraph} />
              </div>
            </div>
          </div> 

          {/* SECTION 2: METRICS & REASONING (35% Height) */}
          <div className="row-span-1 flex flex-col min-h-0 bg-cyber-black border-t border-gray-800">
             
             {/* Complexity Indicators (Grid) */}
             <div className="grid grid-cols-3 gap-px bg-gray-800 border-b border-gray-800">
                <div className="bg-[#0a0a0e] p-3 flex flex-col items-center justify-center text-center group hover:bg-gray-900 transition-colors">
                    <div className="flex items-center space-x-2 mb-1">
                        <Clock className="w-3 h-3 text-fuchsia-400" />
                        <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Time</span>
                    </div>
                    <span className="text-sm font-mono font-bold text-fuchsia-400">{data.timeComplexity || "?"}</span>
                </div>

                <div className="bg-[#0a0a0e] p-3 flex flex-col items-center justify-center text-center group hover:bg-gray-900 transition-colors">
                    <div className="flex items-center space-x-2 mb-1">
                        <Database className="w-3 h-3 text-cyan-400" />
                        <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Space</span>
                    </div>
                    <span className="text-sm font-mono font-bold text-cyan-400">{data.spaceComplexity || "?"}</span>
                </div>

                {/* Interactive Tip Trigger */}
                <div 
                    onClick={() => setShowTipModal(true)}
                    className="bg-[#0a0a0e] p-3 flex flex-col items-center justify-center text-center relative overflow-hidden cursor-pointer hover:bg-yellow-900/10 transition-colors group"
                >
                      <div className="flex items-center space-x-2 mb-1">
                        <Lightbulb className="w-3 h-3 text-yellow-400" />
                        <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold group-hover:text-yellow-400 transition-colors">AI Tip</span>
                        <Maximize2 className="w-3 h-3 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-[10px] text-gray-300 leading-tight line-clamp-2 px-2 select-none">
                        {data.optimizationTip || "No tip"}
                    </span>
                </div>
             </div>

            {/* AI Explanation Text */}
            <div className="flex-grow p-4 overflow-y-auto bg-cyber-black text-gray-300 text-sm">
                <div className="prose prose-invert max-w-none prose-p:text-xs prose-headings:text-sm prose-strong:text-white">
                {/* Syntax Highlighting: Simple regex parsing to style AI emphasis */}
                {data.explanation.split('\n').map((line, i) => (
                  <p key={i} dangerouslySetInnerHTML={{ 
                    __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-cyber-cyan">$1</strong>')
                  }}></p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutputPanel;