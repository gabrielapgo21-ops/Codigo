import React from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell, ReferenceLine } from 'recharts';
import { WorkTask, TaskAnalysis } from '../types';
import { Brain, Cpu, TrendingDown, Clock } from 'lucide-react';
import { motion } from 'motion/react';

interface TaskDashboardProps {
  tasks: WorkTask[];
  analyses: TaskAnalysis[];
}

export default function TaskDashboard({ tasks, analyses }: TaskDashboardProps) {
  const chartData = tasks.map(task => {
    const analysis = analyses.find(a => a.taskId === task.id);
    return {
      name: task.title,
      repetitiveness: task.repetitiveness * 100,
      hours: task.hoursPerWeek,
      score: analysis?.automationScore || 0,
      id: task.id
    };
  });

  const totalPossibleSavings = analyses.reduce((acc, a) => {
    const match = a.savingsEstimate.match(/(\d+\.?\d*)/);
    return acc + (match ? parseFloat(match[1]) : 0);
  }, 0);

  const topCandidates = [...analyses]
    .sort((a, b) => b.automationScore - a.automationScore)
    .slice(0, 3);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-slate-200 shadow-xl rounded-2xl">
          <p className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2 mb-2 tracking-tight">{data.name}</p>
          <div className="space-y-1.5">
            <p className="label-caps flex justify-between gap-6">
              <span>Time Cost</span> 
              <span className="text-slate-900 font-mono tracking-tighter">{data.hours}h/wk</span>
            </p>
            <p className="label-caps flex justify-between gap-6">
              <span>Repetition</span> 
              <span className="text-slate-900 font-mono tracking-tighter">{Math.round(data.repetitiveness)}%</span>
            </p>
            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest flex justify-between gap-6">
              <span>AI Score</span> 
              <span className="font-mono tracking-tighter">{data.score}%</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="glass-card p-5"
        >
          <p className="label-caps mb-1">Weekly Waste</p>
          <p className="text-3xl font-light text-slate-800">
            {Math.round(totalPossibleSavings / 4)} <span className="text-sm text-slate-400">hrs</span>
          </p>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           className="glass-card p-5"
        >
          <p className="label-caps mb-1 text-blue-600">AI Potential</p>
          <p className="text-3xl font-light text-slate-800">
            {Math.round(analyses.reduce((acc, a) => acc + a.automationScore, 0) / (analyses.length || 1))}%
          </p>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="glass-card p-5"
        >
          <p className="label-caps mb-1">Automation Hubs</p>
          <p className="text-3xl font-light text-slate-800">
             {analyses.filter(a => a.automationScore > 75).length} <span className="text-sm text-slate-400">High</span>
          </p>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
           className="bg-blue-600 p-5 rounded-3xl shadow-sm text-white"
        >
          <p className="text-xs font-bold opacity-80 uppercase tracking-widest mb-1">Value Creation</p>
          <p className="text-3xl font-medium tracking-tight">
            ${Math.round(totalPossibleSavings * 50)} <span className="text-sm opacity-80 font-normal">/mo</span>
          </p>
        </motion.div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[500px]">
        {/* Task Analysis Matrix */}
        <div className="flex-[1.8] bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="font-semibold text-slate-700 tracking-tight text-sm uppercase tracking-widest">Workflow Matrix</h2>
            <div className="flex gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
               <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div> High Impact</span>
            </div>
          </div>
          <div className="flex-1 p-6">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
                <XAxis 
                   type="number" 
                   dataKey="repetitiveness" 
                   name="Repetitiveness" 
                   unit="%" 
                   stroke="#cbd5e1" 
                   fontSize={10}
                   tick={{ fill: '#94a3b8' }}
                   label={{ value: 'Repetitiveness →', position: 'bottom', offset: -10, fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                />
                <YAxis 
                   type="number" 
                   dataKey="hours" 
                   name="Hours" 
                   unit="h" 
                   stroke="#cbd5e1" 
                   fontSize={10}
                   tick={{ fill: '#94a3b8' }}
                   label={{ value: 'Time (h/wk) →', angle: -90, position: 'insideLeft', offset: 15, fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                />
                <ZAxis type="number" dataKey="score" range={[150, 800]} />
                <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#e2e8f0' }} />
                <ReferenceLine x={50} stroke="#f1f5f9" strokeDasharray="3 3" />
                <ReferenceLine y={Math.max(...tasks.map(t => t.hoursPerWeek)) / 2} stroke="#f1f5f9" strokeDasharray="3 3" />
                <Scatter data={chartData}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.score > 70 ? '#2563eb' : entry.score > 40 ? '#60a5fa' : '#cbd5e1'} 
                      className="transition-all hover:opacity-80"
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Panel */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col p-6 overflow-hidden">
           <h3 className="label-caps mb-6">Automation Blueprint</h3>
           <div className="space-y-4 flex-1 overflow-y-auto pr-1 custom-scrollbar">
              {topCandidates.map((analysis, idx) => {
                const task = tasks.find(t => t.id === analysis.taskId);
                return (
                  <motion.div 
                    key={analysis.taskId}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + (idx * 0.1) }}
                    className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:border-blue-200 transition-all cursor-default"
                  >
                    <div className="flex justify-between items-start mb-2">
                       <h4 className="text-xs font-bold text-slate-800 leading-tight pr-4 uppercase tracking-tight">{task?.title}</h4>
                       <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 shrink-0">
                          {analysis.automationScore}%
                       </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed italic mb-3">
                       "{analysis.reasoning}"
                    </p>
                    <div className="flex items-center gap-3">
                       <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                          {analysis.automationTool}
                       </span>
                       <span className="text-[10px] font-bold text-slate-400 ml-auto flex items-center gap-1">
                          <Clock size={12} className="opacity-50" /> {analysis.savingsEstimate}
                       </span>
                    </div>
                  </motion.div>
                );
              })}
           </div>
           
           <button 
             onClick={() => {}} // Could link to implementation tab
             className="w-full mt-6 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors"
           >
             Deploy Workflows
           </button>
        </div>
      </div>
    </div>
  );
}
