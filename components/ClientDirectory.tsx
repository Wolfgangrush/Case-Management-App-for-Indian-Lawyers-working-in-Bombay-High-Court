import React, { useState } from 'react';
import { Search, Plus, Mail, Phone, Briefcase, X, User, Folder, FileText, Scale, Trash2 } from 'lucide-react';
import { Client, ClientCaseDetails } from '../types';
import { CASE_TYPES } from '../constants';

interface ClientDirectoryProps {
  clients: Client[];
  onAddClient: (client: Client) => void;
  onOpenVault: (folderId: string) => void;
  onDeleteClient: (id: string) => void;
}

export const ClientDirectory: React.FC<ClientDirectoryProps> = ({ clients, onAddClient, onOpenVault, onDeleteClient }) => {
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'personal' | 'case' | 'instructions'>('personal');
  const [isEditing, setIsEditing] = useState(false); // Track if we are editing/viewing existing

  // Form State
  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    company: '',
    status: 'Active',
    instructions: '',
  });

  const [caseDetailsData, setCaseDetailsData] = useState<Partial<ClientCaseDetails>>({
    caseType: 'CRA',
    state: 'MAHARASHTRA',
    district: 'NAGPUR',
    benchType: 'Single',
    judicialBranch: 'Civil',
    stage: 'FOR ADMISSION',
    acts: 'Code of Civil Procedure 1908'
  });

  const handleOpenClient = (client: Client) => {
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      company: client.company,
      status: client.status,
      instructions: client.instructions
    });
    if (client.caseDetails) {
      setCaseDetailsData(client.caseDetails);
    } else {
      setCaseDetailsData({ 
        caseType: 'CRA', state: 'MAHARASHTRA', district: 'NAGPUR', 
        benchType: 'Single', judicialBranch: 'Civil', stage: 'FOR ADMISSION', acts: 'Code of Civil Procedure 1908' 
      });
    }
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleNewClient = () => {
    setFormData({ 
      name: '', email: '', phone: '', address: '', company: '', status: 'Active', instructions: '' 
    });
    setCaseDetailsData({ 
      caseType: 'CRA', state: 'MAHARASHTRA', district: 'NAGPUR', 
      benchType: 'Single', judicialBranch: 'Civil', stage: 'FOR ADMISSION', acts: 'Code of Civil Procedure 1908' 
    });
    setIsEditing(false);
    setIsModalOpen(true);
    setActiveModalTab('personal');
  };

  // Handlers
  const handleSubmit = () => {
    if (isEditing) {
      setIsModalOpen(false);
      return; // For now just viewing/mock editing
    }

    if (!formData.name || !formData.email) return; // Basic validation

    const newClient: Client = {
      id: `C${Date.now()}`, // Simple ID generation
      name: formData.name!,
      email: formData.email!,
      phone: formData.phone || '',
      address: formData.address || '',
      company: formData.company || undefined,
      status: (formData.status as any) || 'Active',
      totalMatters: 1, // Defaulting to 1 as we are adding case details
      instructions: formData.instructions,
      caseDetails: caseDetailsData as ClientCaseDetails
    };

    onAddClient(newClient);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 h-full flex flex-col relative">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Client Directory</h2>
          <p className="text-gray-500 text-sm mt-1">Manage contacts and intake profiles</p>
        </div>
        <button 
          onClick={handleNewClient}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium flex items-center gap-2"
        >
          <Plus size={16} /> New Client
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 border border-red-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search clients by name, company or phone..." 
            className="w-full bg-gray-50 border border-gray-300 pl-10 pr-4 py-2 text-sm text-gray-900 focus:outline-none focus:border-red-500 placeholder-gray-500"
          />
        </div>
      </div>

      {/* Client Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-4">
        {clients.map((client) => (
          <div 
            key={client.id} 
            onClick={() => handleOpenClient(client)}
            className="bg-white border border-red-200 p-5 hover:border-red-400 transition-all duration-200 group flex flex-col cursor-pointer relative"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-red-50 flex items-center justify-center text-red-600 font-bold border border-red-100">
                {client.name.charAt(0)}
              </div>
              <span className={`px-2 py-1 text-xs font-medium border ${
                client.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 
                client.status === 'Lead' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                'bg-gray-100 text-gray-600 border-gray-200'
              }`}>
                {client.status}
              </span>
            </div>
            
            <button 
               onClick={(e) => { e.stopPropagation(); onDeleteClient(client.id); }}
               className="absolute top-2 right-2 p-2 text-gray-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
               title="Delete Client"
            >
               <Trash2 size={16} />
            </button>

            <h3 className="text-lg font-semibold text-gray-900 mb-1">{client.name}</h3>
            {client.company && <p className="text-sm text-gray-500 mb-4">{client.company}</p>}
            {!client.company && <p className="text-sm text-gray-500 mb-4">Individual</p>}

            <div className="space-y-2.5 text-sm text-gray-600 flex-1">
              <div className="flex items-center gap-3">
                <Mail size={14} className="text-gray-400" />
                <span className="truncate">{client.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={14} className="text-gray-400" />
                <span>{client.phone}</span>
              </div>
              {client.caseDetails?.cnr && (
                 <div className="flex items-center gap-3 mt-2 pt-2 border-t border-red-100">
                    <Scale size={14} className="text-red-500" />
                    <span className="text-xs text-red-700 bg-red-50 px-1.5 py-0.5 font-mono border border-red-100">
                      {client.caseDetails.caseType} - {client.caseDetails.cnr.substring(0, 10)}...
                    </span>
                 </div>
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-red-100 flex gap-2">
              <button 
                 onClick={(e) => {
                   e.stopPropagation();
                   const folderId = client.folderId || `client-${client.id}`;
                   onOpenVault(folderId);
                 }}
                 className="flex-1 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors flex items-center justify-center gap-2 z-10 border border-red-100"
              >
                <Folder size={14} /> Open Vault
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* --- NEW/EDIT CLIENT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="bg-white border border-red-200 w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-red-100">
              <h2 className="text-xl font-bold text-gray-900">{isEditing ? 'Client Profile' : 'Add New Client Profile'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-600">
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-red-100 px-6 bg-gray-50">
              <button 
                onClick={() => setActiveModalTab('personal')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeModalTab === 'personal' ? 'border-red-600 text-red-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
              >
                <User size={16} /> Personal Info
              </button>
              <button 
                onClick={() => setActiveModalTab('case')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeModalTab === 'case' ? 'border-red-600 text-red-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
              >
                <Scale size={16} /> Case Profile
              </button>
              <button 
                onClick={() => setActiveModalTab('instructions')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeModalTab === 'instructions' ? 'border-red-600 text-red-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
              >
                <FileText size={16} /> Instructions
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1">
              
              {/* TAB 1: PERSONAL */}
              {activeModalTab === 'personal' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Full Name *</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border border-gray-300 px-3 py-2 text-gray-900 focus:border-red-500 outline-none" placeholder="e.g. Rahul Patil" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Email *</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-50 border border-gray-300 px-3 py-2 text-gray-900 focus:border-red-500 outline-none" placeholder="client@example.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Phone</label>
                    <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-gray-50 border border-gray-300 px-3 py-2 text-gray-900 focus:border-red-500 outline-none" placeholder="+91..." />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Address</label>
                    <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-gray-50 border border-gray-300 px-3 py-2 text-gray-900 focus:border-red-500 outline-none" placeholder="Residential or Office Address" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Company (Optional)</label>
                    <input type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full bg-gray-50 border border-gray-300 px-3 py-2 text-gray-900 focus:border-red-500 outline-none" placeholder="Company Name" />
                  </div>
                </div>
              )}

              {/* TAB 2: CASE PROFILE (eCourts) */}
              {activeModalTab === 'case' && (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-200 text-xs text-blue-700 mb-2">
                    Enter details exactly as they appear on eCourts Services.
                  </div>
                  
                  {/* Row 1 */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Case Type</label>
                      <select 
                        value={caseDetailsData.caseType} 
                        onChange={e => setCaseDetailsData({...caseDetailsData, caseType: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-300 px-3 py-2 text-gray-900 focus:border-red-500 outline-none text-sm"
                      >
                        {CASE_TYPES.map(type => (
                           <option key={type.code} value={type.code}>
                              {type.code} - {type.name}
                           </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">CNR Number</label>
                      <input type="text" value={caseDetailsData.cnr || ''} onChange={e => setCaseDetailsData({...caseDetailsData, cnr: e.target.value})} className="w-full bg-gray-50 border border-gray-300 px-3 py-2 text-gray-900 focus:border-red-500 outline-none font-mono" placeholder="HCBM04034..." />
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Filing Number</label>
                      <input type="text" value={caseDetailsData.filingNumber || ''} onChange={e => setCaseDetailsData({...caseDetailsData, filingNumber: e.target.value})} className="w-full bg-gray-50 border border-gray-300 px-3 py-2 text-gray-900 focus:border-red-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Filing Date</label>
                      <input type="date" value={caseDetailsData.filingDate || ''} onChange={e => setCaseDetailsData({...caseDetailsData, filingDate: e.target.value})} className="w-full bg-gray-50 border border-gray-300 px-3 py-2 text-gray-900 focus:border-red-500 outline-none" />
                    </div>
                  </div>

                   {/* Row 3 */}
                   <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Registration No.</label>
                      <input type="text" value={caseDetailsData.registrationNumber || ''} onChange={e => setCaseDetailsData({...caseDetailsData, registrationNumber: e.target.value})} className="w-full bg-gray-50 border border-gray-300 px-3 py-2 text-gray-900 focus:border-red-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Registration Date</label>
                      <input type="date" value={caseDetailsData.registrationDate || ''} onChange={e => setCaseDetailsData({...caseDetailsData, registrationDate: e.target.value})} className="w-full bg-gray-50 border border-gray-300 px-3 py-2 text-gray-900 focus:border-red-500 outline-none" />
                    </div>
                  </div>

                  <div className="border-t border-gray-200 my-4 pt-4">
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Current Stage</label>
                    <input type="text" value={caseDetailsData.stage || ''} onChange={e => setCaseDetailsData({...caseDetailsData, stage: e.target.value})} className="w-full bg-gray-50 border border-gray-300 px-3 py-2 text-gray-900 focus:border-red-500 outline-none" placeholder="FOR ADMISSION..." />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Next Hearing</label>
                      <input type="date" value={caseDetailsData.nextHearingDate || ''} onChange={e => setCaseDetailsData({...caseDetailsData, nextHearingDate: e.target.value})} className="w-full bg-gray-50 border border-gray-300 px-3 py-2 text-gray-900 focus:border-red-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Coram (Judge)</label>
                      <input type="text" value={caseDetailsData.coram || ''} onChange={e => setCaseDetailsData({...caseDetailsData, coram: e.target.value})} className="w-full bg-gray-50 border border-gray-300 px-3 py-2 text-gray-900 focus:border-red-500 outline-none" placeholder="Hon'ble Justice..." />
                    </div>
                  </div>
                  
                  <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Acts & Sections</label>
                      <input type="text" value={caseDetailsData.acts || ''} onChange={e => setCaseDetailsData({...caseDetailsData, acts: e.target.value})} className="w-full bg-gray-50 border border-gray-300 px-3 py-2 text-gray-900 focus:border-red-500 outline-none" placeholder="e.g. Code of Civil Procedure 1908, Sec 115" />
                  </div>
                </div>
              )}

              {/* TAB 3: INSTRUCTIONS */}
              {activeModalTab === 'instructions' && (
                <div className="h-full flex flex-col">
                  <div className="p-3 bg-gray-100 text-xs text-gray-600 mb-4 border border-gray-200">
                     Add any specific instructions, client notes, or case background that should be available when opening this matter.
                  </div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Client Instructions / Notes</label>
                  <textarea 
                    value={formData.instructions} 
                    onChange={e => setFormData({...formData, instructions: e.target.value})} 
                    className="flex-1 w-full bg-gray-50 border border-gray-300 p-3 text-gray-900 focus:border-red-500 outline-none min-h-[200px] resize-none" 
                    placeholder="Enter detailed instructions here..."
                  />
                  <div className="mt-4 flex items-center gap-2">
                     <input type="checkbox" id="createVault" checked disabled className="bg-gray-200 border-gray-300 text-red-600 focus:ring-red-500" />
                     <label htmlFor="createVault" className="text-sm text-gray-600">Automatically create Digital Vault folder</label>
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-500 hover:text-gray-900 text-sm font-medium">Cancel</button>
              <button onClick={handleSubmit} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium shadow-sm">
                {isEditing ? 'Save Changes' : 'Create Client Profile'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};