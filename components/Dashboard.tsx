import React, { useState, useMemo } from 'react';
import { KPICard } from './KPICard';
import { Briefcase, Calendar, Clock, FileText, Activity, ArrowRight, X, CheckCircle, Loader2 } from 'lucide-react';
import { TODAY_HEARINGS, RECENT_DOCUMENTS } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TimeEntry } from '../types';

interface DashboardProps {
  onNavigate: (tab: string) => void;
  timeEntries: TimeEntry[];
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, timeEntries }) => {
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // --- Dynamic Data Calculation ---

  // 1. Weekly Activity Chart Data
  const weeklyActivityData = useMemo(() => {
    const curr = new Date();
    // Normalize to get start of week (Monday)
    const dayOfWeek = curr.getDay() || 7; // Make Sunday 7, Mon 1
    const startOfWeek = new Date(curr);
    startOfWeek.setDate(curr.getDate() - dayOfWeek + 1);
    startOfWeek.setHours(0, 0, 0, 0);

    const data = [];
    for (let i = 0; i < 6; i++) { // Mon to Sat (6 days)
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      
      // Construct YYYY-MM-DD string to match TimeEntry date format
      const dateStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      
      const hours = timeEntries
        .filter(e => e.date === dateStr)
        .reduce((sum, e) => sum + e.hours, 0);

      data.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        billable: hours,
        nonBillable: 0 // Placeholder if we want to track non-billable separately later
      });
    }
    return data;
  }, [timeEntries]);

  // 2. Monthly Billable Hours KPI
  const currentMonthHours = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return timeEntries.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).reduce((sum, e) => sum + e.hours, 0);
  }, [timeEntries]);

  const currentMonthName = new Date().toLocaleString('default', { month: 'short' });

  // --- Handlers ---

  const handleSaveNote = () => {
    if (!noteText.trim()) return;
    // In a real app, save to DB
    setIsNoteModalOpen(false);
    setNoteText('');
    alert("Note saved to Daily Journal.");
  };

  const handleSyncStatus = () => {
    setIsSyncing(true);
    setSyncStatus('Connecting to eCourts...');
    
    setTimeout(() => {
       setSyncStatus('Fetching case updates...');
    }, 1500);

    setTimeout(() => {
       setIsSyncing(false);
       setSyncStatus('Sync Complete! 2 Cases updated.');
       setTimeout(() => setSyncStatus(null), 3000);
    }, 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Good morning, Advocate.</h1>
          <p className="text-gray-500">Here is your overview for today.</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => setIsNoteModalOpen(true)}
             className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium flex items-center gap-2 transition-colors"
           >
             <FileText size={16} /> New Note
           </button>
           <button 
             onClick={handleSyncStatus}
             disabled={isSyncing}
             className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
           >
             {isSyncing ? <Loader2 size={16} className="animate-spin" /> : null}
             {isSyncing ? 'Syncing...' : 'Sync Status'}
           </button>
        </div>
      </div>

      {syncStatus && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 text-sm flex items-center gap-2 animate-fade-in">
           <CheckCircle size={16} /> {syncStatus}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          label="Matters Listed Today" 
          value={TODAY_HEARINGS.length} 
          icon={Calendar} 
          trend="+2" 
          trendPositive={true}
          onClick={() => onNavigate('calendar')}
        />
        <KPICard 
          label="Active Cases" 
          value="42" 
          icon={Briefcase} 
          trend="+5%" 
          trendPositive={true}
          onClick={() => onNavigate('matters')}
        />
        <KPICard 
          label="Pending Drafts" 
          value="7" 
          icon={FileText} 
          trend="-2" 
          trendPositive={true}
          onClick={() => onNavigate('drafting')}
        />
        <KPICard 
          label={`Billable Hours (${currentMonthName})`}
          value={currentMonthHours.toFixed(1)}
          icon={Clock} 
          trend="Dynamic" 
          trendPositive={true}
          onClick={() => onNavigate('billing')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Section */}
        <div className="lg:col-span-2 bg-white border border-red-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Weekly Activity (Hours Logged)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis stroke="#9ca3af" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', color: '#111827' }}
                  cursor={{ fill: '#f3f4f6', opacity: 0.4 }}
                />
                <Bar dataKey="billable" name="Billable Hours" stackId="a" fill="#dc2626" radius={[0, 0, 0, 0]} />
                <Bar dataKey="nonBillable" name="Non-Billable" stackId="a" fill="#9ca3af" radius={[0, 0, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Today's Agenda */}
        <div className="bg-white border border-red-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Today's Docket</h3>
            <button onClick={() => onNavigate('calendar')} className="text-red-600 text-xs hover:text-red-700 font-medium">View Calendar</button>
          </div>
          
          <div className="space-y-4">
            {TODAY_HEARINGS.map((hearing) => (
              <div key={hearing.id} className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 hover:border-red-200 transition-colors">
                <div className="flex flex-col items-center justify-center min-w-[40px] h-[40px] bg-white border border-gray-200 text-red-600 font-bold text-xs">
                  <span>{hearing.time.split(':')[0]}</span>
                  <span>{hearing.time.split(' ')[1]}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">{hearing.caseId}</p>
                  <p className="text-xs text-gray-500">{hearing.purpose} • {hearing.courtHall}</p>
                </div>
              </div>
            ))}
            {TODAY_HEARINGS.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-8">No hearings listed today.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Documents / Activity */}
      <div className="bg-white border border-red-200 overflow-hidden">
        <div className="p-6 border-b border-red-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <Activity size={18} className="text-gray-400" />
        </div>
        <div className="divide-y divide-gray-100">
          {RECENT_DOCUMENTS.map((doc, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gray-100 text-gray-600 group-hover:text-red-600 transition-colors">
                  <FileText size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{doc.title}</p>
                  <p className="text-xs text-gray-500">{doc.case}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 border border-gray-200">{doc.type}</span>
                <span className="text-xs text-gray-400">{doc.date}</span>
                <ArrowRight size={14} className="text-gray-400 group-hover:text-red-600" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Note Modal */}
      {isNoteModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
            <div className="bg-white border border-red-200 w-full max-w-lg shadow-2xl p-6">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900">New Quick Note</h3>
                  <button onClick={() => setIsNoteModalOpen(false)} className="text-gray-400 hover:text-red-600"><X size={20}/></button>
               </div>
               <textarea 
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Type your note here..."
                  className="w-full h-32 bg-gray-50 border border-gray-300 p-3 text-gray-900 focus:border-red-500 outline-none resize-none mb-4"
                  autoFocus
               />
               <div className="flex justify-end gap-2">
                  <button onClick={() => setIsNoteModalOpen(false)} className="px-4 py-2 text-gray-500 hover:text-gray-900 text-sm">Cancel</button>
                  <button onClick={handleSaveNote} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium">Save Note</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};