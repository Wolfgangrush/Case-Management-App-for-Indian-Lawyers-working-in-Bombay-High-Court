import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Plus, X, Trash2 } from 'lucide-react';
import { TODAY_HEARINGS } from '../constants';
import { Task, Client, Case } from '../types';

interface CalendarViewProps {
  tasks: Task[];
  onAddTask: (newTask: Task) => void;
  onDeleteTask: (id: string) => void;
  onToggleTask: (id: string) => void;
  clients: Client[];
  cases: Case[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onAddTask, onDeleteTask, onToggleTask, clients, cases }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'High'|'Medium'|'Low'>('Medium');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState('');
  
  // Navigation State
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 20)); // Start at Nov 2025

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date(2025, 10, 20));
  };

  const handleCreateTask = () => {
    if (!newTaskTitle) return;
    const task: Task = {
      id: `T${Date.now()}`,
      title: newTaskTitle,
      dueDate: newTaskDate || new Date().toISOString().split('T')[0],
      priority: newTaskPriority,
      status: 'Pending',
      associatedClientId: selectedClientId || undefined,
      associatedCaseId: selectedCaseId || undefined
    };
    onAddTask(task);
    setIsModalOpen(false);
    setNewTaskTitle('');
    setNewTaskDate('');
    setSelectedClientId('');
    setSelectedCaseId('');
  };

  const getClientName = (id?: string) => clients.find(c => c.id === id)?.name;
  const getCaseName = (id?: string) => {
     const c = cases.find(ca => ca.id === id);
     return c ? `${c.caseType} ${c.registrationNumber}` : undefined;
  };

  return (
    <div className="h-full flex gap-6 relative">
       {/* Main Calendar Grid */}
       <div className="flex-1 bg-white border border-red-200 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <CalendarIcon className="text-red-600" /> 
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
             </h2>
             <div className="flex items-center gap-2">
                <button 
                    onClick={handlePrevMonth}
                    className="p-1 hover:bg-gray-100 text-gray-400 hover:text-gray-900"
                >
                    <ChevronLeft size={20} />
                </button>
                <button 
                    onClick={handleToday}
                    className="px-3 py-1 bg-gray-100 text-sm text-gray-700 hover:bg-gray-200"
                >
                    Today
                </button>
                <button 
                    onClick={handleNextMonth}
                    className="p-1 hover:bg-gray-100 text-gray-400 hover:text-gray-900"
                >
                    <ChevronRight size={20} />
                </button>
             </div>
          </div>
          
          {/* Days Header */}
          <div className="grid grid-cols-7 mb-2">
             {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-semibold text-gray-400 uppercase py-2">{day}</div>
             ))}
          </div>

          {/* Calendar Grid */}
          <div className="flex-1 grid grid-cols-7 grid-rows-5 gap-1">
             {Array.from({ length: 35 }).map((_, i) => {
                // Mock logic for days based on November 2025 starting roughly on a Saturday (Nov 1 2025 is Sat)
                // Adjustment: if current month is Nov 2025, show real days, else just fill numbers 1-30 for demo
                const isNov25 = currentDate.getFullYear() === 2025 && currentDate.getMonth() === 10;
                
                let day: number;
                if (isNov25) {
                    day = i - 5; // Offset for Nov 2025 (Starts Sat)
                } else {
                    day = i + 1; // Generic
                }
                
                const validDay = day > 0 && day <= 30;
                const isToday = isNov25 && day === 20;
                
                // Construct date string for filtering
                // We only show events if we are in the "mock" month of Nov 2025
                const dateStr = (validDay && isNov25) ? `2025-11-${day.toString().padStart(2, '0')}` : '';
                
                // Filter content for this day
                const dayHearings = dateStr ? TODAY_HEARINGS.filter(h => h.date === dateStr) : [];
                const dayTasks = dateStr ? tasks.filter(t => t.dueDate === dateStr) : [];
                
                if (!validDay) return <div key={i} className="bg-gray-50/50"></div>;
                
                return (
                   <div key={i} className={`p-2 border ${isToday ? 'bg-red-50 border-red-500' : 'bg-white border-gray-200 hover:bg-gray-50'} relative flex flex-col transition-colors overflow-hidden`}>
                      <span className={`text-sm font-medium mb-1 ${isToday ? 'text-red-600' : 'text-gray-500'}`}>{day}</span>
                      
                      <div className="space-y-1 overflow-y-auto no-scrollbar">
                        {/* Hearings */}
                        {dayHearings.map((h, idx) => (
                           <div key={`h-${idx}`} className="px-1.5 py-0.5 bg-red-100 text-red-800 text-[9px] font-medium border border-red-200 truncate rounded-sm" title={`Hearing: ${h.purpose} (${h.caseId})`}>
                              H: {h.purpose}
                           </div>
                        ))}
                        
                        {/* Tasks */}
                        {dayTasks.map((t, idx) => (
                           <div 
                              key={`t-${idx}`} 
                              className={`px-1.5 py-0.5 text-[9px] border truncate rounded-sm cursor-pointer ${
                                 t.status === 'Completed' 
                                 ? 'bg-gray-100 text-gray-400 border-gray-200 line-through' 
                                 : 'bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-300'
                              }`}
                              title={`Task: ${t.title}`}
                              onClick={(e) => { e.stopPropagation(); onToggleTask(t.id); }}
                           >
                              {t.title}
                           </div>
                        ))}
                      </div>
                   </div>
                );
             })}
          </div>
       </div>

       {/* Right Sidebar: Schedule & Tasks */}
       <div className="w-80 flex flex-col gap-6">
          {/* Today's Schedule */}
          <div className="bg-white border border-red-200 p-5">
             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Schedule (Nov 20)</h3>
             <div className="space-y-4">
               {TODAY_HEARINGS.map((h) => (
                  <div key={h.id} className="flex gap-3 relative pb-4 last:pb-0">
                     {/* Timeline line */}
                     <div className="absolute left-[19px] top-8 bottom-0 w-0.5 bg-red-100 last:hidden"></div>
                     
                     <div className="flex flex-col items-center">
                        <div className="w-10 h-10 bg-white border border-red-200 flex items-center justify-center text-xs font-bold text-gray-900 shrink-0 z-10 shadow-sm">
                           {h.time.split(' ')[0]}
                        </div>
                     </div>
                     <div>
                        <p className="text-sm font-semibold text-gray-900">{h.purpose}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{h.caseId}</p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                           <Clock size={10} />
                           <span>{h.courtHall}</span>
                        </div>
                     </div>
                  </div>
               ))}
             </div>
          </div>

          {/* Tasks List */}
          <div className="flex-1 bg-white border border-red-200 p-5 overflow-y-auto">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Tasks</h3>
                <button onClick={() => setIsModalOpen(true)} className="text-red-600 hover:text-red-700 text-xs font-medium flex items-center gap-1">
                   <Plus size={12} /> Add
                </button>
             </div>
             
             <div className="space-y-3">
                {tasks.map(task => (
                   <div key={task.id} className="group flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 hover:border-red-200 transition-colors cursor-pointer relative">
                      <div 
                        onClick={(e) => {
                           e.stopPropagation();
                           onToggleTask(task.id);
                        }}
                        className={`mt-0.5 w-4 h-4 border-2 flex items-center justify-center cursor-pointer ${task.status === 'Completed' ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-red-500'}`}
                      >
                         {task.status === 'Completed' && <CheckCircle size={10} className="text-green-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className={`text-sm font-medium ${task.status === 'Completed' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                           {task.title}
                         </p>
                         {(task.associatedClientId || task.associatedCaseId) && (
                            <p className="text-[10px] text-gray-500 mt-1 truncate">
                               {getClientName(task.associatedClientId)}
                               {task.associatedClientId && task.associatedCaseId ? ' • ' : ''}
                               {getCaseName(task.associatedCaseId)}
                            </p>
                         )}
                         <div className="flex items-center justify-between mt-2">
                            <span className={`text-[10px] px-1.5 py-0.5 border ${
                               task.priority === 'High' ? 'bg-red-50 text-red-700 border-red-100' : 
                               task.priority === 'Medium' ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-gray-100 text-gray-600 border-gray-200'
                            }`}>
                               {task.priority}
                            </span>
                            <span className="text-[10px] text-gray-400">{task.dueDate}</span>
                         </div>
                      </div>
                      <button 
                        onClick={(e) => {
                           e.stopPropagation();
                           onDeleteTask(task.id);
                        }}
                        className="absolute top-2 right-2 p-1 text-gray-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                      >
                         <Trash2 size={14} />
                      </button>
                   </div>
                ))}
             </div>
          </div>
       </div>

       {/* New Task Modal */}
       {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
             <div className="bg-white border border-red-200 w-full max-w-sm shadow-2xl p-5">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="text-lg font-bold text-gray-900">Add Task</h3>
                   <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-600"><X size={18}/></button>
                </div>
                
                <div className="space-y-3">
                  <input 
                    autoFocus
                    type="text" 
                    value={newTaskTitle} 
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Task Description"
                    className="w-full bg-gray-50 border border-gray-300 p-2 text-gray-900 text-sm focus:border-red-500 outline-none"
                  />
                  
                  <div className="flex gap-2">
                     <input 
                       type="date"
                       value={newTaskDate}
                       onChange={(e) => setNewTaskDate(e.target.value)}
                       className="bg-gray-50 border border-gray-300 p-2 text-gray-900 text-sm flex-1 outline-none focus:border-red-500"
                     />
                     <select 
                        value={newTaskPriority}
                        onChange={(e) => setNewTaskPriority(e.target.value as any)}
                        className="bg-gray-50 border border-gray-300 p-2 text-gray-900 text-sm outline-none focus:border-red-500"
                     >
                        <option>High</option><option>Medium</option><option>Low</option>
                     </select>
                  </div>

                  <div>
                     <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Link to Client (Optional)</label>
                     <select 
                        value={selectedClientId}
                        onChange={(e) => setSelectedClientId(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 p-2 text-gray-900 text-sm outline-none focus:border-red-500"
                     >
                        <option value="">None</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                     </select>
                  </div>

                  <div>
                     <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Link to Matter (Optional)</label>
                     <select 
                        value={selectedCaseId}
                        onChange={(e) => setSelectedCaseId(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 p-2 text-gray-900 text-sm outline-none focus:border-red-500"
                     >
                        <option value="">None</option>
                        {cases.map(c => <option key={c.id} value={c.id}>{c.caseType} {c.registrationNumber}</option>)}
                     </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                   <button onClick={() => setIsModalOpen(false)} className="px-3 py-1.5 text-gray-500 hover:text-gray-900 text-sm">Cancel</button>
                   <button onClick={handleCreateTask} className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium">Add</button>
                </div>
             </div>
          </div>
       )}
    </div>
  );
};