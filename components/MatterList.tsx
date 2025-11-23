import React, { useState } from 'react';
import { Case, CaseStage, CourtType } from '../types';
import { CASE_TYPES } from '../constants';
import { Search, Filter, Download, Plus, X, FileText, Calendar, User, Trash2 } from 'lucide-react';

interface MatterListProps {
  cases: Case[];
  onAddCase: (newCase: Case) => void;
  onDeleteCase: (id: string) => void;
}

export const MatterList: React.FC<MatterListProps> = ({ cases, onAddCase, onDeleteCase }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewCase, setViewCase] = useState<Case | null>(null);
  const [filterText, setFilterText] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // New Case Form State
  const [formData, setFormData] = useState<Partial<Case>>({
    cnr: '',
    caseType: 'WP',
    petitioner: '',
    respondent: '',
    court: CourtType.HC_NAGPUR,
    bench: 'Single Bench',
    judge: '',
    stage: CaseStage.ADMISSION,
    nextHearing: '',
    registrationNumber: '',
    filingDate: new Date().toISOString().split('T')[0]
  });

  const getStageColor = (stage: CaseStage) => {
    switch (stage) {
      case CaseStage.ADMISSION: return 'bg-red-50 text-red-700 border-red-200';
      case CaseStage.HEARING: return 'bg-orange-50 text-orange-700 border-orange-200';
      case CaseStage.ORDERS: return 'bg-blue-50 text-blue-700 border-blue-200';
      case CaseStage.DISPOSED: return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const handleExport = () => {
    // Generate CSV content
    const headers = ['CNR', 'Registration No', 'Petitioner', 'Respondent', 'Court', 'Judge', 'Stage', 'Next Hearing'];
    const rows = cases.map(c => [
      c.cnr, c.registrationNumber, c.petitioner, c.respondent, c.court, c.judge, c.stage, c.nextHearing
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `case_docket_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = () => {
    if (!formData.cnr || !formData.petitioner) return;

    const newCase: Case = {
      id: `CS-${Date.now()}`,
      cnr: formData.cnr!,
      filingDate: formData.filingDate!,
      registrationNumber: formData.registrationNumber || 'Pending',
      petitioner: formData.petitioner!,
      respondent: formData.respondent || '',
      court: formData.court as CourtType,
      bench: formData.bench || '',
      judge: formData.judge || '',
      stage: formData.stage as CaseStage,
      nextHearing: formData.nextHearing || 'TBD',
      caseType: formData.caseType || 'WP'
    };

    onAddCase(newCase);
    setIsModalOpen(false);
    setFormData({ // Reset
        cnr: '', caseType: 'WP', petitioner: '', respondent: '', court: CourtType.HC_NAGPUR, 
        bench: 'Single Bench', judge: '', stage: CaseStage.ADMISSION, nextHearing: '', 
        registrationNumber: '', filingDate: new Date().toISOString().split('T')[0]
    });
  };

  const filteredCases = cases.filter(c => 
    c.cnr.toLowerCase().includes(filterText.toLowerCase()) || 
    c.petitioner.toLowerCase().includes(filterText.toLowerCase()) ||
    c.respondent.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="space-y-6 h-full flex flex-col relative">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Case Docket</h2>
        <div className="flex gap-2">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Download size={16} /> Export
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus size={16} /> New Matter
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 bg-white p-2 border border-red-200">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Search by CNR, Party Name or Case No..." 
            className="w-full bg-gray-50 border border-gray-300 pl-10 pr-4 py-2 text-sm text-gray-900 focus:outline-none focus:border-red-500 placeholder-gray-500"
          />
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 border text-sm transition-colors ${showFilters ? 'bg-red-600 border-red-600 text-white' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
        >
          <Filter size={16} /> Filter
        </button>
      </div>

      {showFilters && (
         <div className="p-4 bg-gray-50 border border-gray-200 flex gap-4 animate-fade-in">
            <select className="bg-white border border-gray-300 px-3 py-1.5 text-sm text-gray-900 outline-none focus:border-red-500">
               <option>All Courts</option>
               <option>High Court</option>
               <option>District Court</option>
            </select>
            <select className="bg-white border border-gray-300 px-3 py-1.5 text-sm text-gray-900 outline-none focus:border-red-500">
               <option>All Stages</option>
               <option>Admission</option>
               <option>Hearing</option>
            </select>
         </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto bg-white border border-red-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-medium sticky top-0 z-10 border-b border-red-100">
            <tr>
              <th className="px-6 py-4">CNR / Reg. No</th>
              <th className="px-6 py-4">Parties</th>
              <th className="px-6 py-4">Court & Judge</th>
              <th className="px-6 py-4">Stage</th>
              <th className="px-6 py-4">Next Hearing</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredCases.map((matter) => (
              <tr key={matter.id} className="hover:bg-red-50/50 transition-colors group cursor-pointer" onClick={() => setViewCase(matter)}>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{matter.cnr}</div>
                  <div className="text-xs text-gray-500 mt-1">{matter.registrationNumber}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-gray-800 font-medium line-clamp-1" title={matter.petitioner}>
                    {matter.petitioner}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">vs</div>
                  <div className="text-gray-600 line-clamp-1" title={matter.respondent}>
                    {matter.respondent}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-gray-700">{matter.bench}</div>
                  <div className="text-xs text-gray-500 mt-1">{matter.judge}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium border ${getStageColor(matter.stage)}`}>
                    {matter.stage}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">
                   {matter.nextHearing}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setViewCase(matter); }}
                      className="text-red-600 hover:text-red-700 font-medium px-2 py-1 hover:bg-red-50 text-xs"
                    >
                      View
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteCase(matter.id); }}
                      className="text-gray-400 hover:text-red-600 p-1 hover:bg-red-50 rounded"
                      title="Delete Case"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Matter Modal */}
      {isModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
            <div className="bg-white border border-red-200 w-full max-w-2xl shadow-2xl p-6 flex flex-col max-h-[90vh]">
               <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                  <h3 className="text-xl font-bold text-gray-900">Add New Matter</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-600"><X size={20}/></button>
               </div>
               
               <div className="overflow-y-auto space-y-4 pr-2">
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Case Type</label>
                        <select 
                           value={formData.caseType} 
                           onChange={e => setFormData({...formData, caseType: e.target.value})} 
                           className="w-full bg-gray-50 border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-red-500 text-sm"
                        >
                           {CASE_TYPES.map(type => (
                              <option key={type.code} value={type.code}>
                                 {type.code} - {type.name}
                              </option>
                           ))}
                        </select>
                     </div>
                     <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">CNR Number</label>
                        <input type="text" value={formData.cnr} onChange={e => setFormData({...formData, cnr: e.target.value})} className="w-full bg-gray-50 border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-red-500" placeholder="e.g. HCBM..." />
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Petitioner</label>
                        <input type="text" value={formData.petitioner} onChange={e => setFormData({...formData, petitioner: e.target.value})} className="w-full bg-gray-50 border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-red-500" />
                     </div>
                     <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Respondent</label>
                        <input type="text" value={formData.respondent} onChange={e => setFormData({...formData, respondent: e.target.value})} className="w-full bg-gray-50 border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-red-500" />
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Registration No.</label>
                        <input type="text" value={formData.registrationNumber} onChange={e => setFormData({...formData, registrationNumber: e.target.value})} className="w-full bg-gray-50 border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-red-500" />
                     </div>
                     <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Next Hearing</label>
                        <input type="date" value={formData.nextHearing} onChange={e => setFormData({...formData, nextHearing: e.target.value})} className="w-full bg-gray-50 border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-red-500" />
                     </div>
                  </div>

                  <div>
                     <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Judge / Coram</label>
                     <input type="text" value={formData.judge} onChange={e => setFormData({...formData, judge: e.target.value})} className="w-full bg-gray-50 border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-red-500" placeholder="Hon'ble Justice..." />
                  </div>
               </div>

               <div className="flex justify-end gap-3 mt-6 border-t border-gray-200 pt-4">
                  <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-500 hover:text-gray-900 text-sm">Cancel</button>
                  <button onClick={handleSubmit} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium">Add Matter</button>
               </div>
            </div>
         </div>
      )}

      {/* Case View Modal */}
      {viewCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
           <div className="bg-white border border-red-200 w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-red-100 bg-gray-50">
                 <div>
                    <div className="flex items-center gap-2 mb-1">
                       <span className="px-2 py-0.5 text-xs font-bold bg-red-600 text-white">{viewCase.caseType}</span>
                       <h3 className="text-xl font-bold text-gray-900">{viewCase.registrationNumber}</h3>
                    </div>
                    <p className="text-xs text-gray-500 font-mono">CNR: {viewCase.cnr}</p>
                 </div>
                 <button onClick={() => setViewCase(null)} className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50"><X size={24}/></button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                 {/* Status Banner */}
                 <div className={`p-4 border flex justify-between items-center ${getStageColor(viewCase.stage)}`}>
                    <div>
                       <p className="text-xs uppercase font-bold opacity-70">Current Stage</p>
                       <p className="font-bold text-lg">{viewCase.stage}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-xs uppercase font-bold opacity-70">Next Hearing</p>
                       <div className="flex items-center gap-2 font-bold text-lg">
                          <Calendar size={18}/>
                          {viewCase.nextHearing}
                       </div>
                    </div>
                 </div>

                 {/* Parties */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 border border-gray-200">
                       <p className="text-xs text-blue-600 uppercase font-bold mb-2">Petitioner</p>
                       <div className="flex items-start gap-3">
                          <User className="text-gray-400 mt-1" size={20} />
                          <p className="text-gray-900 font-medium">{viewCase.petitioner}</p>
                       </div>
                    </div>
                    <div className="bg-gray-50 p-4 border border-gray-200">
                       <p className="text-xs text-red-600 uppercase font-bold mb-2">Respondent</p>
                       <div className="flex items-start gap-3">
                          <User className="text-gray-400 mt-1" size={20} />
                          <p className="text-gray-900 font-medium">{viewCase.respondent}</p>
                       </div>
                    </div>
                 </div>

                 {/* Court Details */}
                 <div className="bg-gray-50 p-4 border border-gray-200">
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                       <FileText size={16} className="text-gray-400"/> Court Details
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                       <div>
                          <p className="text-gray-500 text-xs">Court Name</p>
                          <p className="text-gray-800">{viewCase.court}</p>
                       </div>
                       <div>
                          <p className="text-gray-500 text-xs">Bench Type</p>
                          <p className="text-gray-800">{viewCase.bench}</p>
                       </div>
                       <div className="col-span-2">
                          <p className="text-gray-500 text-xs">Coram / Judge</p>
                          <p className="text-gray-800 font-medium text-red-600">{viewCase.judge}</p>
                       </div>
                       <div>
                          <p className="text-gray-500 text-xs">Filing Date</p>
                          <p className="text-gray-800">{viewCase.filingDate}</p>
                       </div>
                    </div>
                 </div>
              </div>
              
              <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                 <button onClick={() => setViewCase(null)} className="px-6 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-sm font-medium">Close</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};