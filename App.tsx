import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { MatterList } from './components/MatterList';
import { DigitalVault } from './components/DigitalVault';
import { ClientDirectory } from './components/ClientDirectory';
import { LexIndica } from './components/LexIndica';
import { DrafterAI } from './components/DrafterAI';
import { CalendarView } from './components/CalendarView';
import { Billing } from './components/Billing';
import { MOCK_CLIENTS, MOCK_CASES, TASKS } from './constants';
import { Client, Case, Task, FileSystemItem, TimeEntry } from './types';
import { X, ShieldAlert, Lock } from 'lucide-react';

// Initial Vault State Generator
const generateInitialVaultItems = (clients: Client[]): FileSystemItem[] => {
  const items: FileSystemItem[] = [
    { id: 'root-1', parentId: null, name: 'Clients', type: 'folder', date: 'Today' },
    { id: 'root-2', parentId: null, name: 'Judgments Library', type: 'folder', date: 'Yesterday' },
    { id: 'root-3', parentId: null, name: 'Bare Acts', type: 'folder', date: 'Last Week' },
    { id: 'root-4', parentId: null, name: 'Draft Templates', type: 'folder', date: 'Last Week' },
  ];

  clients.forEach((client, index) => {
    // If client already has a folderId (from mock), use it, else generate one
    const folderId = client.folderId || `client-${client.id}`;
    
    // Ensure we don't create duplicates if mock data already implies existence
    if (!items.find(i => i.id === folderId)) {
      items.push({ 
        id: folderId, 
        parentId: 'root-1', 
        name: client.name, 
        type: 'folder', 
        date: 'Today' 
      });

      // Demo files for first client
      if (index === 0) {
        items.push(
          { id: 'f1', parentId: folderId, name: 'Vakalatnama.pdf', type: 'file', fileType: 'pdf', size: '1.2 MB', date: 'Today' },
          { id: 'f2', parentId: folderId, name: 'Case_Brief.docx', type: 'file', fileType: 'doc', size: '24 KB', date: 'Yesterday' },
          { id: 'f3', parentId: folderId, name: 'Evidence_Photos.jpg', type: 'file', fileType: 'image', size: '4.5 MB', date: '2 days ago' }
        );
      }
    }
  });

  return items;
};

// Initial Billing Data
const INITIAL_TIME_ENTRIES: TimeEntry[] = [
  { id: '1', clientId: 'C001', clientName: 'Dream Infrastructure & Developers', caseId: 'CS-102', description: 'Drafting Writ Petition', date: '2025-11-18', hours: 2.5, rate: 5000, amount: 12500, billed: false },
  { id: '2', clientId: 'C002', clientName: 'Rahul Naresh Puglia', caseId: 'CS-101', description: 'Client Consultation regarding CRA', date: '2025-11-19', hours: 1.0, rate: 4500, amount: 4500, billed: false },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Lifted State with LocalStorage Persistence for Offline Capability
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('nyaya_clients');
    return saved ? JSON.parse(saved) : MOCK_CLIENTS;
  });

  const [cases, setCases] = useState<Case[]>(() => {
    const saved = localStorage.getItem('nyaya_cases');
    return saved ? JSON.parse(saved) : MOCK_CASES;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('nyaya_tasks');
    return saved ? JSON.parse(saved) : TASKS;
  });

  const [vaultItems, setVaultItems] = useState<FileSystemItem[]>(() => {
    const saved = localStorage.getItem('nyaya_vault');
    return saved ? JSON.parse(saved) : generateInitialVaultItems(MOCK_CLIENTS);
  });

  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(() => {
    const saved = localStorage.getItem('nyaya_billing');
    return saved ? JSON.parse(saved) : INITIAL_TIME_ENTRIES;
  });
  
  // Persist changes
  useEffect(() => localStorage.setItem('nyaya_clients', JSON.stringify(clients)), [clients]);
  useEffect(() => localStorage.setItem('nyaya_cases', JSON.stringify(cases)), [cases]);
  useEffect(() => localStorage.setItem('nyaya_tasks', JSON.stringify(tasks)), [tasks]);
  useEffect(() => localStorage.setItem('nyaya_vault', JSON.stringify(vaultItems)), [vaultItems]);
  useEffect(() => localStorage.setItem('nyaya_billing', JSON.stringify(timeEntries)), [timeEntries]);

  // Security State
  const [masterPassword, setMasterPassword] = useState('admin');
  const [deleteIntent, setDeleteIntent] = useState<{
    type: 'client' | 'case' | 'task' | 'vaultItem';
    id: string;
  } | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  
  // State to handle deep linking to a specific vault folder
  const [targetVaultFolderId, setTargetVaultFolderId] = useState<string | null>(null);

  // UI State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // --- ADD HANDLERS ---

  const handleAddClient = (newClientData: Client) => {
    const folderId = `client-${newClientData.id}`;
    const clientWithFolder: Client = { ...newClientData, folderId: folderId };
    setClients(prev => [...prev, clientWithFolder]);

    const newFolder: FileSystemItem = {
      id: folderId,
      parentId: 'root-1',
      name: newClientData.name,
      type: 'folder',
      date: 'Just now'
    };
    setVaultItems(prev => [...prev, newFolder]);
  };

  const handleAddCase = (newCase: Case) => {
    setCases(prev => [newCase, ...prev]);
  };

  const handleAddTask = (newTask: Task) => {
    setTasks(prev => [newTask, ...prev]);
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: t.status === 'Completed' ? 'Pending' : 'Completed' } : t
    ));
  };

  const handleAddTimeEntry = (entry: TimeEntry) => {
    setTimeEntries(prev => [entry, ...prev]);
  };

  const handleDeleteTimeEntry = (id: string) => {
    setTimeEntries(prev => prev.filter(e => e.id !== id));
  };

  // --- DELETE REQUEST HANDLERS (Triggers Modal) ---

  const requestDeleteClient = (id: string) => setDeleteIntent({ type: 'client', id });
  const requestDeleteCase = (id: string) => setDeleteIntent({ type: 'case', id });
  const requestDeleteTask = (id: string) => setDeleteIntent({ type: 'task', id });
  const requestDeleteVaultItem = (id: string) => setDeleteIntent({ type: 'vaultItem', id });

  // --- CONFIRM DELETE LOGIC ---

  const handleConfirmDelete = () => {
    if (passwordInput !== masterPassword) {
      setPasswordError(true);
      return;
    }

    if (!deleteIntent) return;

    switch (deleteIntent.type) {
      case 'client':
        setClients(prev => prev.filter(c => c.id !== deleteIntent.id));
        break;
      case 'case':
        setCases(prev => prev.filter(c => c.id !== deleteIntent.id));
        break;
      case 'task':
        setTasks(prev => prev.filter(t => t.id !== deleteIntent.id));
        break;
      case 'vaultItem':
        setVaultItems(prev => {
           return prev.filter(item => item.id !== deleteIntent.id && item.parentId !== deleteIntent.id);
        });
        break;
    }

    // Reset
    setDeleteIntent(null);
    setPasswordInput('');
    setPasswordError(false);
  };

  const handleCancelDelete = () => {
    setDeleteIntent(null);
    setPasswordInput('');
    setPasswordError(false);
  };

  const handleOpenVaultFolder = (folderId: string) => {
    setTargetVaultFolderId(folderId);
    setActiveTab('vault');
  };

  const handleSignOut = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      window.location.reload();
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveTab} timeEntries={timeEntries} />;
      case 'matters':
        return <MatterList cases={cases} onAddCase={handleAddCase} onDeleteCase={requestDeleteCase} />;
      case 'vault':
        return (
          <DigitalVault 
            items={vaultItems} 
            onItemsChange={setVaultItems} 
            onDeleteRequest={requestDeleteVaultItem}
            initialFolderId={targetVaultFolderId}
            onFolderOpened={() => setTargetVaultFolderId(null)}
          />
        );
      case 'clients':
        return (
          <ClientDirectory 
            clients={clients} 
            onAddClient={handleAddClient} 
            onDeleteClient={requestDeleteClient}
            onOpenVault={handleOpenVaultFolder}
          />
        );
      case 'research':
        return <LexIndica />;
      case 'drafting':
        return <DrafterAI vaultItems={vaultItems} onVaultChange={setVaultItems} />;
      case 'calendar':
        return (
          <CalendarView 
            tasks={tasks} 
            onAddTask={handleAddTask} 
            onDeleteTask={requestDeleteTask}
            onToggleTask={handleToggleTask}
            clients={clients}
            cases={cases}
          />
        );
      case 'billing':
        return <Billing entries={timeEntries} onAddEntry={handleAddTimeEntry} onDeleteEntry={handleDeleteTimeEntry} />;
      default:
        return <Dashboard onNavigate={setActiveTab} timeEntries={timeEntries} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans selection:bg-red-100">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenSettings={() => setIsSettingsOpen(true)}
        onSignOut={handleSignOut}
      />
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto h-full">
          {renderContent()}
        </div>
      </main>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-fade-in">
           <div className="bg-white border border-red-200 shadow-2xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-bold text-gray-900">Settings</h3>
                 <button onClick={() => setIsSettingsOpen(false)} className="text-gray-400 hover:text-red-600"><X size={20}/></button>
              </div>
              
              <div className="space-y-6">
                 <div>
                    <h4 className="text-sm font-bold text-gray-500 mb-2">Security</h4>
                    <label className="block text-xs text-gray-400 mb-1">Admin Password (Default: admin)</label>
                    <div className="flex gap-2">
                       <input 
                         type="text" 
                         value={masterPassword}
                         onChange={(e) => setMasterPassword(e.target.value)}
                         className="flex-1 bg-gray-50 border border-gray-300 px-3 py-2 text-gray-900 text-sm focus:border-red-500 outline-none"
                       />
                    </div>
                 </div>

                 <div>
                    <h4 className="text-sm font-bold text-gray-500 mb-2">Appearance</h4>
                    <div className="flex gap-3">
                       <button className="px-3 py-2 bg-white border border-gray-200 text-gray-600 text-sm hover:border-red-500 hover:text-red-600">Dark Mode</button>
                       <button className="px-3 py-2 bg-red-600 text-white text-sm border border-red-600">Light Mode</button>
                    </div>
                 </div>

                 <div>
                    <h4 className="text-sm font-bold text-gray-500 mb-2">Account</h4>
                    <p className="text-xs text-gray-500 mb-2">Advocate License: MAH/1234/2018</p>
                 </div>
              </div>

              <div className="mt-8 flex justify-end">
                 <button onClick={() => setIsSettingsOpen(false)} className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium">Done</button>
              </div>
           </div>
        </div>
      )}

      {/* Password Confirmation Modal */}
      {deleteIntent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
           <div className="bg-white border-l-4 border-red-600 shadow-2xl p-6 w-full max-w-sm">
              <div className="flex items-start gap-4 mb-4">
                 <div className="p-2 bg-red-100 text-red-600 rounded-full shrink-0">
                    <ShieldAlert size={24} />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3>
                    <p className="text-sm text-gray-600 mt-1">
                       This action cannot be undone. Please enter your admin password to proceed.
                    </p>
                 </div>
              </div>

              <div className="mb-6">
                 <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Password</label>
                 <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="password" 
                      autoFocus
                      value={passwordInput}
                      onChange={(e) => {
                        setPasswordInput(e.target.value);
                        setPasswordError(false);
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleConfirmDelete()}
                      className={`w-full bg-gray-50 border ${passwordError ? 'border-red-500' : 'border-gray-300'} pl-10 pr-4 py-2 text-gray-900 text-sm focus:outline-none focus:border-red-500`}
                      placeholder="Enter password..."
                    />
                 </div>
                 {passwordError && <p className="text-xs text-red-600 mt-1">Incorrect password.</p>}
              </div>

              <div className="flex justify-end gap-2">
                 <button onClick={handleCancelDelete} className="px-4 py-2 text-gray-600 hover:bg-gray-100 text-sm font-medium">Cancel</button>
                 <button onClick={handleConfirmDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium">Delete Permanently</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}