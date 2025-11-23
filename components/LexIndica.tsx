import React, { useState, useRef } from 'react';
import { KNOWLEDGE_BASE } from '../constants';
import { Search, BookOpen, Book, ArrowRight, Star, X, Plus, UploadCloud } from 'lucide-react';
import { Act } from '../types';

// Extended type to handle custom uploads with local URLs
interface LibraryItem extends Act {
  fileUrl?: string; // Blob URL for preview
  fileName?: string;
}

export const LexIndica: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'browse' | 'ask'>('browse');
  const [aiResponse, setAiResponse] = useState('');
  const [question, setQuestion] = useState('');
  
  // State for library items (initialized with mock data)
  const [library, setLibrary] = useState<LibraryItem[]>(KNOWLEDGE_BASE);
  const [viewingDoc, setViewingDoc] = useState<LibraryItem | null>(null);
  
  // Track if we are uploading a new file or attaching to existing one
  const [uploadingForId, setUploadingForId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    setUploadingForId(null);
    fileInputRef.current?.click();
  };

  const handleAttachClick = (actId: string) => {
    setUploadingForId(actId);
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    let fileUrl = '';
    // Check for Electron 'path' property for persistent local file access
    if ((file as any).path) {
      // Safe path construction for Windows (replace backslashes)
      const safePath = (file as any).path.replace(/\\/g, '/');
      // CRITICAL: Encode URI to handle spaces and special chars in filenames
      fileUrl = `file:///${encodeURI(safePath)}`;
    } else {
      fileUrl = URL.createObjectURL(file);
    }

    if (uploadingForId) {
        // Update existing item
        setLibrary(prev => prev.map(item => 
            item.id === uploadingForId 
            ? { ...item, fileUrl: fileUrl, fileName: file.name }
            : item
        ));
        
        // Also update viewingDoc if it's the one being modified, to show preview immediately
        if (viewingDoc && viewingDoc.id === uploadingForId) {
            setViewingDoc(prev => prev ? { ...prev, fileUrl: fileUrl, fileName: file.name } : null);
        }
        
        setUploadingForId(null);
        alert("Document attached successfully.");
    } else {
        // Add new item
        const newAct: LibraryItem = {
           id: `custom-${Date.now()}`,
           shortName: file.name.length > 15 ? file.name.substring(0, 12) + '...' : file.name,
           fullName: file.name,
           year: new Date().getFullYear().toString(),
           category: 'Civil', // Defaulting for imported
           fileUrl: fileUrl,
           fileName: file.name
        };
        setLibrary(prev => [...prev, newAct]);
        alert("Document imported successfully to Knowledge Base.");
    }

    // Reset input
    event.target.value = '';
  };

  const handleViewDoc = (act: LibraryItem) => {
    setViewingDoc(act);
  };

  const handleAsk = () => {
      if(!question.trim()) return;
      // Simulate an AI response for demonstration
      setAiResponse(`Based on your query regarding "${question}", the relevant provisions under the Bharatiya Nyaya Sanhita (BNS) 2023 appear to be Section 69 which deals with sexual intercourse by employing deceitful means. 
      
      Additionally, relevant case law suggests that standard of proof required is beyond reasonable doubt.
      
      (Note: This is a simulated response. In a production environment, this would query the vector database of indexed acts.)`);
  };

  return (
    <div className="space-y-6 h-full flex flex-col relative">
      
      {/* Hidden File Input */}
      <input 
        type="file" 
        accept=".pdf"
        ref={fileInputRef} 
        onChange={handleFileChange} 
        style={{ display: 'none' }} 
      />

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="text-red-600" /> Lex Indica
          </h2>
          <p className="text-gray-500 text-sm mt-1">Statutory Knowledge Base & Research Assistant</p>
        </div>
        <div className="flex bg-gray-100 p-1 border border-gray-200">
          <button 
            onClick={() => setActiveTab('browse')}
            className={`px-4 py-1.5 text-sm font-medium transition-all ${activeTab === 'browse' ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-800'}`}
          >
            Library
          </button>
          <button 
             onClick={() => setActiveTab('ask')}
             className={`px-4 py-1.5 text-sm font-medium transition-all ${activeTab === 'ask' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
          >
            Ask AI
          </button>
        </div>
      </div>

      {activeTab === 'browse' ? (
        <>
          {/* Search */}
          <div className="bg-white p-6 border border-red-200 flex flex-col gap-4 items-center text-center shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900">Search the Constitution & Bare Acts</h3>
            <div className="relative w-full max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Search for 'Anticipatory Bail' or 'Section 482'..." 
                className="w-full bg-gray-50 border border-gray-300 pl-12 pr-6 py-3 text-gray-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 placeholder-gray-500 shadow-sm"
              />
            </div>
            <div className="flex gap-2 text-xs text-gray-500">
               <span>Try:</span>
               <span className="text-red-600 cursor-pointer hover:underline">BNS Section 69</span>
               <span>•</span>
               <span className="text-red-600 cursor-pointer hover:underline">Writ Jurisdiction</span>
               <span>•</span>
               <span className="text-red-600 cursor-pointer hover:underline">Evidence Admissibility</span>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-900">My Library</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-4">
            {library.map((act) => (
              <div 
                key={act.id} 
                onClick={() => handleViewDoc(act)}
                className="bg-white border border-red-200 p-5 hover:border-red-400 transition-all duration-200 group cursor-pointer shadow-sm hover:shadow-md relative"
              >
                <div className="flex justify-between items-start mb-3">
                   <div className="p-3 bg-red-50 text-red-600 group-hover:bg-red-100 transition-colors">
                     <Book size={24} />
                   </div>
                   <div className="flex gap-2">
                       {!act.fileUrl && (
                         <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">
                            No PDF
                         </span>
                       )}
                       <Star size={16} className="text-gray-400 hover:text-amber-400 transition-colors" />
                   </div>
                </div>
                <div className="mb-4">
                  <h4 className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">{act.shortName}</h4>
                  <p className="text-sm text-gray-500 line-clamp-1">{act.fullName}</p>
                </div>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                   <span className="text-xs px-2 py-1 bg-gray-100 border border-gray-200 text-gray-600">{act.year}</span>
                   <span className="text-xs font-medium text-gray-400 uppercase">{act.category}</span>
                </div>
              </div>
            ))}
            
            {/* Add New Act */}
            <div 
              onClick={handleImportClick}
              className="bg-gray-50 border border-dashed border-gray-300 p-5 flex flex-col items-center justify-center text-gray-500 hover:border-red-300 hover:text-red-600 transition-all cursor-pointer"
            >
               <div className="p-3 bg-white border border-gray-200 mb-3">
                 <Plus />
               </div>
               <p className="font-medium">Import Bare Act PDF</p>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 bg-white border border-red-200 overflow-hidden flex flex-col">
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
               <div className="flex gap-4">
                  <div className="w-8 h-8 bg-red-600 flex items-center justify-center flex-shrink-0">
                    <BookOpen size={16} className="text-white" />
                  </div>
                  <div className="bg-gray-100 p-4 max-w-[80%] border border-gray-200">
                     <p className="text-gray-800 text-sm leading-relaxed">
                       Hello Advocate. I am Lex, your research assistant. I have indexed the latest BNS, BNSS, and BSA along with the Constitution. What legal proposition are you researching today?
                     </p>
                  </div>
               </div>
               
               {aiResponse && (
                   <div className="flex gap-4">
                      <div className="w-8 h-8 bg-red-600 flex items-center justify-center flex-shrink-0">
                        <BookOpen size={16} className="text-white" />
                      </div>
                      <div className="bg-blue-50 p-4 max-w-[80%] border border-blue-200">
                         <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                           {aiResponse}
                         </p>
                      </div>
                   </div>
               )}
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-200">
               <div className="relative">
                  <input 
                    type="text" 
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                    placeholder="Ask a legal question (e.g., 'What is the punishment for mob lynching under BNS?')" 
                    className="w-full bg-white border border-gray-300 pl-4 pr-12 py-3 text-sm text-gray-900 focus:outline-none focus:border-red-500"
                  />
                  <button 
                    onClick={handleAsk}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-red-600 hover:bg-red-700 text-white transition-colors"
                  >
                    <ArrowRight size={16} />
                  </button>
               </div>
            </div>
        </div>
      )}

      {/* --- Viewer Modal --- */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
           <div className="bg-white border border-red-200 w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl">
              <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
                 <div>
                    <h3 className="text-lg font-bold text-gray-900">{viewingDoc.fullName}</h3>
                    <p className="text-xs text-gray-500">{viewingDoc.year} • {viewingDoc.category}</p>
                 </div>
                 <button onClick={() => setViewingDoc(null)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50">
                    <X size={24} />
                 </button>
              </div>
              <div className="flex-1 bg-gray-100 p-4 overflow-hidden relative">
                 {viewingDoc.fileUrl ? (
                    <embed 
                        src={viewingDoc.fileUrl} 
                        type="application/pdf"
                        className="w-full h-full border border-gray-300 bg-white"
                        key={viewingDoc.fileUrl} // Forces re-render when file changes
                    />
                 ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                       <Book size={64} className="mb-4 opacity-20" />
                       <p className="text-lg font-medium text-gray-500 mb-2">No PDF Attached</p>
                       <p className="text-sm max-w-md text-center mb-6">
                          This act exists in your metadata library but has no document file attached. 
                          Please upload the PDF to view it.
                       </p>
                       <button 
                         onClick={() => handleAttachClick(viewingDoc.id)}
                         className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium text-sm flex items-center gap-2"
                       >
                          <UploadCloud size={16} /> Attach PDF Now
                       </button>
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}

    </div>
  );
};