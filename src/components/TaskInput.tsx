import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Target, Briefcase } from 'lucide-react';
import { WorkTask, UserGoals, Frequency } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface TaskInputProps {
  onTasksChange: (tasks: WorkTask[]) => void;
  onGoalsChange: (goals: UserGoals) => void;
  initialTasks: WorkTask[];
  initialGoals: UserGoals;
}

export default function TaskInput({ onTasksChange, onGoalsChange, initialTasks, initialGoals }: TaskInputProps) {
  const [tasks, setTasks] = useState<WorkTask[]>(initialTasks);
  const [goals, setGoals] = useState<UserGoals>(initialGoals);
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState<Partial<WorkTask>>({
    title: '',
    description: '',
    hoursPerWeek: 1,
    frequency: 'daily',
    repetitiveness: 0.5,
  });

  const handleAddLevel = () => {
    if (!newTask.title || !newTask.description) return;
    const task: WorkTask = {
      id: crypto.randomUUID(),
      title: newTask.title!,
      description: newTask.description!,
      hoursPerWeek: Number(newTask.hoursPerWeek) || 1,
      frequency: newTask.frequency as Frequency,
      repetitiveness: Number(newTask.repetitiveness) || 0.5,
    };
    const updatedTasks = [...tasks, task];
    setTasks(updatedTasks);
    onTasksChange(updatedTasks);
    setNewTask({ title: '', description: '', hoursPerWeek: 1, frequency: 'daily', repetitiveness: 0.5 });
    setIsAdding(false);
  };

  const removeTask = (id: string) => {
    const updatedTasks = tasks.filter(t => t.id !== id);
    setTasks(updatedTasks);
    onTasksChange(updatedTasks);
  };

  return (
    <div className="space-y-8">
      <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <Target size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800 leading-none">Operational Context</h2>
            <p className="text-[10px] text-slate-400 mt-1 font-medium italic">Define your high-level work objectives</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-1">
            <label className="label-caps !text-[9px]">Primary Work Goal</label>
            <input
              type="text"
              value={goals.mainGoal}
              onChange={(e) => {
                const g = { ...goals, mainGoal: e.target.value };
                setGoals(g);
                onGoalsChange(g);
              }}
              placeholder="e.g., Scale my marketing agency Operations"
              className="w-full bg-transparent border-b border-slate-100 focus:border-blue-500 outline-none py-2 transition-colors text-sm font-medium"
            />
          </div>
          <div className="space-y-1">
            <label className="label-caps !text-[9px]">Focus Area</label>
            <input
              type="text"
              value={goals.focusArea}
              onChange={(e) => {
                const g = { ...goals, focusArea: e.target.value };
                setGoals(g);
                onGoalsChange(g);
              }}
              placeholder="e.g., Client communication & reporting"
              className="w-full bg-transparent border-b border-slate-100 focus:border-blue-500 outline-none py-2 transition-colors text-sm font-medium"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mx-2">
          <div className="flex items-center gap-2 text-slate-500">
            <Briefcase size={18} />
            <h2 className="text-xs font-bold uppercase tracking-widest">Workflow Inventory</h2>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <Plus size={14} /> New Task
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence initial={false}>
            {isAdding && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="overflow-hidden"
              >
                <div className="bg-white border border-blue-100 rounded-3xl p-6 shadow-md space-y-6 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="label-caps !text-[9px]">Task Definition</label>
                        <input
                          type="text"
                          placeholder="Short title (e.g., Client sync)"
                          className="w-full px-4 py-2.5 border border-slate-100 bg-slate-50/50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 transition-all text-sm font-medium"
                          value={newTask.title}
                          onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="label-caps !text-[9px]">Description</label>
                        <textarea
                          placeholder="What specific steps do you take?"
                          className="w-full px-4 py-2.5 border border-slate-100 bg-slate-50/50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 min-h-[100px] transition-all text-sm font-medium"
                          value={newTask.description}
                          onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                           <label className="label-caps !text-[9px]">Hours / Wk</label>
                          <input
                            type="number"
                            className="w-full px-4 py-2.5 border border-slate-100 bg-slate-50/50 rounded-xl outline-none text-sm font-mono font-bold"
                            value={newTask.hoursPerWeek}
                            onChange={e => setNewTask({ ...newTask, hoursPerWeek: Number(e.target.value) })}
                          />
                        </div>
                        <div className="space-y-1">
                           <label className="label-caps !text-[9px]">Cycle</label>
                          <select
                            className="w-full px-4 py-2.5 border border-slate-100 bg-slate-50/50 rounded-xl outline-none bg-white text-sm font-medium"
                            value={newTask.frequency}
                            onChange={e => setNewTask({ ...newTask, frequency: e.target.value as Frequency })}
                          >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="occasionally">Occasionally</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center label-caps !text-[9px]">
                          <span>Repetitiveness</span>
                          <span className="text-blue-600 font-mono italic">{Math.round((newTask.repetitiveness || 0) * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600"
                          value={newTask.repetitiveness}
                          onChange={e => setNewTask({ ...newTask, repetitiveness: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button onClick={() => setIsAdding(false)} className="text-xs font-bold uppercase tracking-widest px-6 py-3 text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
                    <button onClick={handleAddLevel} className="text-xs font-bold uppercase tracking-widest px-8 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 shadow-sm transition-all">Save Activity</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-slate-200 rounded-3xl p-6 flex items-center gap-6 group hover:border-blue-200 transition-all shadow-sm"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-tight truncate">{task.title}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-50 text-slate-400 border border-slate-100 font-bold uppercase tracking-tighter">{task.frequency}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1 italic font-medium leading-relaxed opacity-70">
                     {task.description}
                  </p>
                </div>
                <div className="flex items-center gap-10 shrink-0">
                  <div className="text-right">
                    <p className="label-caps !text-[8px] mb-1">Weekly Time</p>
                    <p className="text-sm font-mono font-bold text-slate-700 tracking-tighter">{task.hoursPerWeek}h</p>
                  </div>
                  <div className="w-24">
                    <p className="label-caps !text-[8px] mb-1">Repetition</p>
                    <div className="flex items-center gap-2">
                       <div className="flex-1 h-1 bg-slate-50 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: `${task.repetitiveness * 100}%` }} />
                       </div>
                       <span className="text-[10px] font-mono font-bold text-slate-400 leading-none">{Math.round(task.repetitiveness * 100)}%</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeTask(task.id)}
                    className="p-2 text-slate-200 hover:text-slate-400 transition-colors rounded-xl hover:bg-slate-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {tasks.length === 0 && !isAdding && (
            <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-3xl opacity-60">
              <div className="mx-auto w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
                <Briefcase size={24} />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Inventory Empty</p>
              <p className="text-[10px] text-slate-400 mt-1 italic">Add your first task to begin the cycle.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
