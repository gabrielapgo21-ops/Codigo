/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { WorkTask, UserGoals, TaskAnalysis } from './types';
import TaskInput from './components/TaskInput';
import TaskDashboard from './components/TaskDashboard';
import AutomationPlan from './components/AutomationPlan';
import { analyzeTasks } from './services/geminiService';
import { LayoutDashboard, Settings2, Sparkles, Loader2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const INITIAL_TASKS: WorkTask[] = [
  {
    id: '1',
    title: 'Customer Ticket Routing',
    description: 'Manually reading every support email and tagging it with the right department or product category.',
    hoursPerWeek: 4,
    frequency: 'daily',
    repetitiveness: 0.9,
  },
  {
    id: '2',
    title: 'Weekly Performance Synthesis',
    description: 'Collecting data from 3 different dashboards and summarizing it into a 2-page PDF report for the founders.',
    hoursPerWeek: 6,
    frequency: 'weekly',
    repetitiveness: 0.7,
  }
];

const INITIAL_GOALS: UserGoals = {
  mainGoal: 'Scale operational efficiency for our growing SaaS platform.',
  focusArea: 'Customer Support and Resource Allocation',
};

export default function App() {
  const [tasks, setTasks] = useState<WorkTask[]>(INITIAL_TASKS);
  const [goals, setGoals] = useState<UserGoals>(INITIAL_GOALS);
  const [analyses, setAnalyses] = useState<TaskAnalysis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'input' | 'dashboard' | 'plan'>('input');

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const results = await analyzeTasks(tasks, goals);
      setAnalyses(results);
      setActiveTab('dashboard');
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Sidebar / Navigation Rail */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full p-4 md:p-8 gap-8">
        
        {/* Navigation Sidebar */}
        <aside className="md:w-64 shrink-0 space-y-6">
          <div className="flex items-center gap-3 px-2 mb-10">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-sm">
               <Sparkles size={22} strokeWidth={2.5} />
            </div>
            <div>
               <h1 className="text-xl font-bold tracking-tight text-slate-800">TaskAuto<span className="text-blue-600">.ai</span></h1>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Logic Dashboard</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('input')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'input' 
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200' 
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              <Settings2 size={18} />
              <span>Workflow Setup</span>
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'dashboard' 
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200' 
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              <LayoutDashboard size={18} />
              <span>Insight Grid</span>
            </button>
            <button
              onClick={() => setActiveTab('plan')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'plan' 
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200' 
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              <Sparkles size={18} />
              <span>Automation AI</span>
            </button>
          </nav>

          <div className="pt-10 px-2">
             <button
                onClick={runAnalysis}
                disabled={isAnalyzing || tasks.length === 0}
                className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-sm hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group"
             >
                {isAnalyzing ? (
                   <Loader2 size={18} className="animate-spin" />
                ) : (
                   <Sparkles size={18} className="group-hover:scale-110 transition-transform" />
                )}
                {isAnalyzing ? 'Analyzing...' : 'Run Intelligence'}
             </button>
          </div>

          <div className="mt-auto p-5 bg-white border border-slate-200 rounded-3xl">
             <div className="flex gap-2 text-blue-600 mb-2">
                <Info size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest italic">Analysis Tip</span>
             </div>
             <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                Target tasks in the top-right quadrant for maximum efficiency gains.
             </p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
             {activeTab === 'input' && (
                <motion.div
                   key="input"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   transition={{ duration: 0.2 }}
                >
                   <TaskInput 
                      onTasksChange={setTasks}
                      onGoalsChange={setGoals}
                      initialTasks={tasks}
                      initialGoals={goals}
                   />
                </motion.div>
             )}

             {activeTab === 'dashboard' && (
                <motion.div
                   key="dashboard"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   transition={{ duration: 0.2 }}
                >
                   <TaskDashboard 
                      tasks={tasks}
                      analyses={analyses}
                   />
                </motion.div>
             )}

             {activeTab === 'plan' && (
                <motion.div
                   key="plan"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   transition={{ duration: 0.2 }}
                >
                   <AutomationPlan 
                      tasks={tasks}
                      analyses={analyses}
                   />
                </motion.div>
             )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

