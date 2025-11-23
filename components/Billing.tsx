import React, { useState } from 'react';
import { IndianRupee, Clock, Plus, Printer, FileText, CheckCircle, Search, Download, Trash2 } from 'lucide-react';
import { MOCK_CLIENTS, MOCK_CASES } from '../constants';
import { TimeEntry } from '../types';

interface BillingProps {
  entries: TimeEntry[];
  onAddEntry: (entry: TimeEntry) => void;
  onDeleteEntry: (id: string) => void;
}

export const Billing: React.FC<BillingProps> = ({ entries, onAddEntry, onDeleteEntry }) => {
  // --- State ---
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceClient, setInvoiceClient] = useState('');

  // Form State
  const [newEntry, setNewEntry] = useState({
    clientId: '',
    caseId: '',
    description: '',
    hours: '',
    rate: '5000', // Default hourly rate in INR
    date: new Date().toISOString().split('T')[0]
  });

  // --- Handlers ---
  const handleLogTime = () => {
    if (!newEntry.clientId || !newEntry.hours) {
      alert("Please select a client and enter hours.");
      return;
    }

    const client = MOCK_CLIENTS.find(c => c.id === newEntry.clientId);
    const entry: TimeEntry = {
      id: Date.now().toString(),
      clientId: newEntry.clientId,
      clientName: client?.name || 'Unknown Client',
      caseId: newEntry.caseId,
      description: newEntry.description,
      date: newEntry.date,
      hours: parseFloat(newEntry.hours),
      rate: parseFloat(newEntry.rate),
      amount: parseFloat(newEntry.hours) * parseFloat(newEntry.rate),
      billed: false
    };

    onAddEntry(entry);
    setIsLogModalOpen(false);
    setNewEntry({ clientId: '', caseId: '', description: '', hours: '', rate: '5000', date: new Date().toISOString().split('T')[0] });
  };

  const handleDeleteEntry = (id: string) => {
    if (window.confirm("Are you sure you want to delete this time entry?")) {
      onDeleteEntry(id);
    }
  };

  const handleGenerateInvoice = () => {
    if (!invoiceClient) {
      alert("Please select a client to generate an invoice.");
      return;
    }
    setIsInvoiceModalOpen(true);
  };

  const handlePrintInvoice = () => {
    const printContent = document.getElementById('invoice-preview');
    if (printContent) {
        const win = window.open('', '', 'height=700,width=800');
        if (win) {
            win.document.write('<html><head><title>Invoice</title>');
            win.document.write('<style>body{font-family:sans-serif; padding: 20px;} table{width:100%; border-collapse: collapse;} th, td{border: 1px solid #ddd; padding: 8px; text-align: left;} th{background-color: #f2f2f2;} .total{font-weight: bold; text-align: right; margin-top: 20px; font-size: 1.2em;}</style>');
            win.document.write('</head><body>');
            win.document.write(printContent.innerHTML);
            win.document.write('</body></html>');
            win.document.close();
            win.print();
        }
    }
  };

  const filteredEntries = invoiceClient 
    ? entries.filter(e => e.clientId === invoiceClient && !e.billed)
    : entries.filter(e => !e.billed);

  const totalBillable = entries.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6 h-full flex flex-col relative">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <IndianRupee className="text-red-600" /> Billable Hours & Invoicing
          </h2>
          <p className="text-gray-500 text-sm mt-1">Track time, manage rates, and generate PDF invoices.</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => setIsLogModalOpen(true)}
             className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium flex items-center gap-2 shadow-sm"
           >
             <Plus size={16} /> Log Time
           </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white border border-red-200 p-5">
            <p className="text-gray-500 text-xs uppercase font-semibold">Total Unbilled</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1 flex items-center">
               <IndianRupee size={20} className="text-gray-400 mr-1" />
               {totalBillable.toLocaleString('en-IN')}
            </h3>
         </div>
         <div className="bg-white border border-red-200 p-5">
            <p className="text-gray-500 text-xs uppercase font-semibold">Hours Logged (Nov)</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1 flex items-center gap-2">
               <Clock size={20} className="text-red-600" />
               {entries.reduce((acc, curr) => acc + curr.hours, 0)} hrs
            </h3>
         </div>
         <div className="bg-white border border-red-200 p-5">
            <p className="text-gray-500 text-xs uppercase font-semibold">Pending Invoices</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">0</h3>
         </div>
      </div>

      {/* Entries List */}
      <div className="flex-1 bg-white border border-red-200 flex flex-col overflow-hidden">
         <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Unbilled Time Entries</h3>
            <div className="flex items-center gap-2">
               <select 
                 value={invoiceClient}
                 onChange={(e) => setInvoiceClient(e.target.value)}
                 className="bg-gray-50 border border-gray-300 text-gray-900 text-sm px-3 py-2 outline-none focus:border-red-500"
               >
                 <option value="">All Clients</option>
                 {MOCK_CLIENTS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
               </select>
               <button 
                 onClick={handleGenerateInvoice}
                 className="px-3 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                 disabled={!invoiceClient}
               >
                 <FileText size={16} /> Generate Invoice
               </button>
            </div>
         </div>
         
         <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-sm">
               <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-medium sticky top-0 border-b border-gray-200">
                  <tr>
                     <th className="px-6 py-3">Date</th>
                     <th className="px-6 py-3">Client / Case</th>
                     <th className="px-6 py-3">Description</th>
                     <th className="px-6 py-3">Hours</th>
                     <th className="px-6 py-3">Rate</th>
                     <th className="px-6 py-3 text-right">Amount</th>
                     <th className="px-6 py-3 text-right">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {filteredEntries.length > 0 ? filteredEntries.map(entry => (
                     <tr key={entry.id} className="hover:bg-red-50/30">
                        <td className="px-6 py-3 text-gray-600">{entry.date}</td>
                        <td className="px-6 py-3">
                           <div className="text-gray-900 font-medium">{entry.clientName}</div>
                           <div className="text-xs text-gray-500">{entry.caseId || 'General Consultation'}</div>
                        </td>
                        <td className="px-6 py-3 text-gray-600">{entry.description}</td>
                        <td className="px-6 py-3 text-gray-600">{entry.hours}</td>
                        <td className="px-6 py-3 text-gray-600">₹{entry.rate}</td>
                        <td className="px-6 py-3 text-right font-medium text-gray-900">₹{entry.amount.toLocaleString('en-IN')}</td>
                        <td className="px-6 py-3 text-right">
                           <button 
                             onClick={() => handleDeleteEntry(entry.id)}
                             className="text-gray-400 hover:text-red-600 p-1 hover:bg-red-50"
                             title="Delete Entry"
                           >
                             <Trash2 size={16} />
                           </button>
                        </td>
                     </tr>
                  )) : (
                     <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                           No unbilled entries found for selection.
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {/* --- Log Time Modal --- */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
           <div className="bg-white border border-red-200 w-full max-w-lg shadow-2xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Log Billable Time</h3>
              
              <div className="space-y-4">
                 <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Client</label>
                    <select 
                      value={newEntry.clientId}
                      onChange={(e) => setNewEntry({...newEntry, clientId: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-red-500"
                    >
                      <option value="">Select Client...</option>
                      {MOCK_CLIENTS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                 </div>
                 
                 <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Matter / Case (Optional)</label>
                    <select 
                       value={newEntry.caseId}
                       onChange={(e) => setNewEntry({...newEntry, caseId: e.target.value})}
                       className="w-full bg-gray-50 border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-red-500"
                    >
                       <option value="">General Consultation</option>
                       {MOCK_CASES.map(c => <option key={c.id} value={c.id}>{c.caseType} - {c.petitioner}</option>)}
                    </select>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Date</label>
                       <input 
                         type="date" 
                         value={newEntry.date}
                         onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
                         className="w-full bg-gray-50 border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-red-500"
                       />
                    </div>
                    <div>
                       <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Hours</label>
                       <input 
                         type="number" 
                         step="0.1"
                         value={newEntry.hours}
                         onChange={(e) => setNewEntry({...newEntry, hours: e.target.value})}
                         className="w-full bg-gray-50 border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-red-500"
                         placeholder="e.g. 1.5"
                       />
                    </div>
                 </div>

                 <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Hourly Rate (₹)</label>
                    <input 
                      type="number" 
                      value={newEntry.rate}
                      onChange={(e) => setNewEntry({...newEntry, rate: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-red-500"
                    />
                 </div>

                 <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Description</label>
                    <textarea 
                      value={newEntry.description}
                      onChange={(e) => setNewEntry({...newEntry, description: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-red-500 resize-none h-24"
                      placeholder="Describe work done..."
                    />
                 </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                 <button onClick={() => setIsLogModalOpen(false)} className="px-4 py-2 text-gray-500 hover:text-gray-900 text-sm">Cancel</button>
                 <button onClick={handleLogTime} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium">Log Time</button>
              </div>
           </div>
        </div>
      )}

      {/* --- Invoice Preview Modal --- */}
      {isInvoiceModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
            <div className="bg-white text-gray-900 w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-200">
               {/* Invoice Content (ID for printing) */}
               <div id="invoice-preview" className="p-10 overflow-y-auto flex-1 font-serif bg-white">
                  <div className="flex justify-between items-start border-b border-gray-200 pb-6 mb-6">
                     <div>
                        <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
                        <p className="text-gray-500 mt-1">#INV-{Date.now().toString().slice(-6)}</p>
                     </div>
                     <div className="text-right">
                        <h2 className="font-bold text-xl">Chambers of Adv. Rushikesh R. Mahajan</h2>
                        <p className="text-sm text-gray-600">High Court Chambers, Nagpur</p>
                        <p className="text-sm text-gray-600">Maharashtra, India - 440001</p>
                     </div>
                  </div>

                  <div className="mb-8">
                     <p className="text-xs uppercase font-bold text-gray-500 mb-1">Bill To:</p>
                     <h3 className="text-xl font-bold">{MOCK_CLIENTS.find(c => c.id === invoiceClient)?.name}</h3>
                     <p className="text-gray-600">{MOCK_CLIENTS.find(c => c.id === invoiceClient)?.address}</p>
                     <p className="text-gray-600">Date: {new Date().toLocaleDateString()}</p>
                  </div>

                  <table className="w-full mb-8">
                     <thead>
                        <tr className="border-b-2 border-gray-800">
                           <th className="text-left py-2 font-bold text-gray-800">Description</th>
                           <th className="text-right py-2 font-bold text-gray-800">Hours</th>
                           <th className="text-right py-2 font-bold text-gray-800">Rate</th>
                           <th className="text-right py-2 font-bold text-gray-800">Amount</th>
                        </tr>
                     </thead>
                     <tbody>
                        {filteredEntries.map(e => (
                           <tr key={e.id} className="border-b border-gray-200">
                              <td className="py-3">
                                 <p className="font-medium text-gray-900">{e.description}</p>
                                 <p className="text-xs text-gray-500">{e.date} • {e.caseId}</p>
                              </td>
                              <td className="text-right py-3 text-gray-800">{e.hours}</td>
                              <td className="text-right py-3 text-gray-800">₹{e.rate}</td>
                              <td className="text-right py-3 text-gray-800">₹{e.amount.toLocaleString('en-IN')}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>

                  <div className="flex justify-end">
                     <div className="w-1/2">
                        <div className="flex justify-between py-2 border-b border-gray-200">
                           <span className="font-medium text-gray-700">Subtotal</span>
                           <span className="text-gray-900">₹{filteredEntries.reduce((a, c) => a + c.amount, 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200">
                           <span className="font-medium text-gray-700">Tax (18% GST)</span>
                           <span className="text-gray-900">₹{(filteredEntries.reduce((a, c) => a + c.amount, 0) * 0.18).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between py-4 text-xl font-bold text-gray-900">
                           <span>Total Due</span>
                           <span>₹{(filteredEntries.reduce((a, c) => a + c.amount, 0) * 1.18).toLocaleString('en-IN')}</span>
                        </div>
                     </div>
                  </div>
                  
                  <div className="mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
                     <p>Thank you for your business. Please make checks payable to "Chambers of Adv. Rushikesh R. Mahajan".</p>
                  </div>
               </div>

               {/* Actions */}
               <div className="bg-gray-50 p-4 flex justify-end gap-3 border-t border-gray-200">
                  <button onClick={() => setIsInvoiceModalOpen(false)} className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium">Close</button>
                  <button onClick={handlePrintInvoice} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium flex items-center gap-2">
                     <Printer size={16} /> Print / Save PDF
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};