import React, { useState, useMemo } from 'react';
import { PenTool, FileText, Paperclip, Sparkles, Send, BookTemplate, Upload, CheckCircle, X, Search, FolderOpen, Folder, Trash2, FolderPlus, ChevronRight, CornerUpLeft, Loader2, Download, Copy, RefreshCw, FolderSearch, Plus } from 'lucide-react';
import { MOCK_CASES, CASE_TYPES } from '../constants';
import { GoogleGenAI } from "@google/genai";
import { FileSystemItem } from '../types';
import { DigitalVault } from './DigitalVault';

// --- Types for Reference Library ---
type RefItemType = 'file' | 'folder';

interface ReferenceItem {
  id: string;
  parentId: string | null;
  name: string;
  type: RefItemType;
  date: string;
}

interface DrafterAIProps {
  vaultItems: FileSystemItem[];
  onVaultChange?: React.Dispatch<React.SetStateAction<FileSystemItem[]>>;
}

// Generate initial empty folders for all types + some mock data with folders
const generateInitialLibrary = () => {
  const lib: Record<string, ReferenceItem[]> = {};
  
  // Initialize empty arrays for all types
  CASE_TYPES.forEach(type => {
    lib[type.code] = [];
  });

  // Populate some demo data with folders
  if (lib['ABA']) {
    lib['ABA'] = [
      { id: 'aba-f1', parentId: null, name: 'High Court Formats', type: 'folder', date: '2024-01-01' },
      { id: 'aba-f2', parentId: null, name: 'Sessions Court Formats', type: 'folder', date: '2024-01-01' },
      { id: 'aba-1', parentId: 'aba-f1', name: 'ABA_498A_HC_Format.docx', type: 'file', date: '2024-01-15' },
      { id: 'aba-2', parentId: null, name: 'General_ABA_Draft.pdf', type: 'file', date: '2023-11-20' }
    ];
  }
  if (lib['BA']) {
    lib['BA'] = [
      { id: 'ba-1', parentId: null, name: 'Regular_Bail_NDPS.docx', type: 'file', date: '2023-10-05' }
    ];
  }
  if (lib['WP']) {
    lib['WP'] = [
      { id: 'wp-1', parentId: null, name: 'WP_Quashing_FIR_Standard.docx', type: 'file', date: '2024-02-01' },
      { id: 'wp-2', parentId: null, name: 'WP_Service_Matter_Pension.pdf', type: 'file', date: '2023-12-12' }
    ];
  }

  return lib;
};

export const DrafterAI: React.FC<DrafterAIProps> = ({ vaultItems, onVaultChange }) => {
  // --- Global State ---
  const [selectedCaseId, setSelectedCaseId] = useState('');
  
  // --- Document Type Selection State ---
  const [selectedDocCode, setSelectedDocCode] = useState('');
  const [docTypeSearch, setDocTypeSearch] = useState('');
  
  // --- Reference Library State ---
  const [referenceLibrary, setReferenceLibrary] = useState(generateInitialLibrary());
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [uploadedContextFiles, setUploadedContextFiles] = useState<string[]>([]);

  // --- File System State for Library ---
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<{id: string, name: string}[]>([]);
  
  // --- Modals State ---
  const [isNewFolderInputVisible, setIsNewFolderInputVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isVaultPickerOpen, setIsVaultPickerOpen] = useState(false);

  // --- AI State ---
  const [generatedDraft, setGeneratedDraft] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [promptInput, setPromptInput] = useState('');

  // Filtered List of Document Types based on Search
  const filteredDocTypes = useMemo(() => {
    if (!docTypeSearch) return CASE_TYPES;
    const lowerSearch = docTypeSearch.toLowerCase();
    return CASE_TYPES.filter(t => 
      t.code.toLowerCase().includes(lowerSearch) || 
      t.name.toLowerCase().includes(lowerSearch)
    );
  }, [docTypeSearch]);

  const selectedDocTypeObj = CASE_TYPES.find(t => t.code === selectedDocCode);

  // --- Handlers ---

  const handleDocTypeChange = (code: string) => {
    setSelectedDocCode(code);
    setSelectedTemplates([]); // Reset template selection
    setCurrentFolderId(null); // Reset folder path
    setFolderPath([]);
    setIsNewFolderInputVisible(false);
    setGeneratedDraft(''); // Reset draft on type change
  };

  const handleNavigateFolder = (folder: ReferenceItem) => {
    setCurrentFolderId(folder.id);
    setFolderPath(prev => [...prev, { id: folder.id, name: folder.name }]);
  };

  const handleNavigateUp = () => {
    if (folderPath.length === 0) return;
    const newPath = folderPath.slice(0, -1);
    setFolderPath(newPath);
    setCurrentFolderId(newPath.length > 0 ? newPath[newPath.length - 1].id : null);
  };

  const handleNavigateRoot = () => {
    setFolderPath([]);
    setCurrentFolderId(null);
  };

  const toggleTemplateSelection = (id: string) => {
    if (selectedTemplates.includes(id)) {
      setSelectedTemplates(prev => prev.filter(tid => tid !== id));
    } else {
      setSelectedTemplates(prev => [...prev, id]);
    }
  };

  const handleUploadTemplate = () => {
    if (!selectedDocCode) return;
    const newTemplate: ReferenceItem = {
      id: `tmp-new-${Date.now()}`,
      parentId: currentFolderId,
      name: `Uploaded_Draft_${selectedDocCode}_${Date.now().toString().slice(-4)}.docx`,
      type: 'file',
      date: 'Just now'
    };
    
    setReferenceLibrary(prev => ({
      ...prev,
      [selectedDocCode]: [newTemplate, ...(prev[selectedDocCode] || [])]
    }));
    
    // Auto select if it's a file
    setSelectedTemplates(prev => [...prev, newTemplate.id]);
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim() || !selectedDocCode) return;
    
    const newFolder: ReferenceItem = {
      id: `folder-${Date.now()}`,
      parentId: currentFolderId,
      name: newFolderName,
      type: 'folder',
      date: 'Just now'
    };

    setReferenceLibrary(prev => ({
      ...prev,
      [selectedDocCode]: [newFolder, ...(prev[selectedDocCode] || [])]
    }));

    setNewFolderName('');
    setIsNewFolderInputVisible(false);
  };

  const handleDeleteItem = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    if (!selectedDocCode) return;
    if (window.confirm('Delete this item?')) {
       setReferenceLibrary(prev => ({
         ...prev,
         [selectedDocCode]: prev[selectedDocCode].filter(item => item.id !== itemId)
       }));
       // If it was selected, unselect it
       if (selectedTemplates.includes(itemId)) {
         setSelectedTemplates(prev => prev.filter(id => id !== itemId));
       }
    }
  };

  const handleVaultFileSelect = (file: FileSystemItem) => {
    if (!uploadedContextFiles.includes(file.name)) {
      setUploadedContextFiles(prev => [...prev, file.name]);
      // Simulate scanning feedback for language support
      alert(`Added "${file.name}" to context.\n\nSystem is scanning for Marathi/Hindi content...`);
    }
    setIsVaultPickerOpen(false);
  };

  const handleGenerateDraft = async () => {
    if (!selectedCaseId || !selectedDocCode) return;
    
    setIsGenerating(true);
    setGeneratedDraft(''); // Clear previous draft
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const selectedCase = MOCK_CASES.find(c => c.id === selectedCaseId);
      
      const prompt = `You are a senior advocate practicing at the High Court of Bombay.
      
      TASK: Draft a legal document with the following specifications.
      
      CASE DETAILS:
      - Document Type: ${selectedDocTypeObj?.name} (${selectedDocCode})
      - Registration No: ${selectedCase?.registrationNumber}
      - Petitioner: ${selectedCase?.petitioner}
      - Respondent: ${selectedCase?.respondent}
      - Court: ${selectedCase?.court}
      - Judge/Coram: ${selectedCase?.judge}
      
      ATTACHED CONTEXT FILES:
      The user has attached ${uploadedContextFiles.length} context documents (names: ${uploadedContextFiles.join(', ')}).
      
      CRITICAL INSTRUCTION - MARATHI/HINDI LANGUAGE PROCESSING:
      The attached context files include SCANNED LEGAL DOCUMENTS (FIRs, Panchnamas, Witness Statements) written in MARATHI or HINDI.
      
      YOUR TASK IS TO ACT AS A TRANSLATOR AND LEGAL DRAFTER:
      1.  **OCR & Translate**: Simulate reading the vernacular text from these files.
      2.  **Extract Facts**: Identify Dates, Times, Locations (Spot Panchnama details), and Accused/Witness names from the Marathi/Hindi text.
      3.  **Transliterate**: Ensure proper English spelling of Marathi names/places.
      4.  **Draft**: Use these extracted facts to construct the English legal draft.
      
      USER INSTRUCTIONS:
      ${promptInput}
      
      Please ensure the draft follows proper Indian legal format, with appropriate cause title, jurisdiction clause, and prayer clause.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
      });
      
      setGeneratedDraft(response.text || '');
    } catch (error) {
      console.error("Draft generation failed:", error);
      alert("Failed to generate draft. Please ensure API key is configured.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadDraft = () => {
    if (!generatedDraft) return;
    const blob = new Blob([generatedDraft], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedDocCode || 'Draft'}_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyDraft = () => {
    if (!generatedDraft) return;
    navigator.clipboard.writeText(generatedDraft);
    alert("Draft copied to clipboard!");
  };

  // Get current view items
  const currentItems = useMemo(() => {
    if (!selectedDocCode || !referenceLibrary[selectedDocCode]) return [];
    return referenceLibrary[selectedDocCode].filter(item => item.parentId === currentFolderId);
  }, [selectedDocCode, referenceLibrary, currentFolderId]);

  return (
    <div className="h-full flex gap-6 relative">
      {/* Left Panel: Configuration & Reference Library */}
      <div className="w-1/3 bg-white border border-red-200 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-red-100 bg-gray-50">
           <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
             <PenTool className="text-red-600" /> Drafter AI
           </h2>
           <p className="text-xs text-gray-500 mt-1">Select context and reference drafts</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* 1. Select Case */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">1. Select Matter</label>
            <select 
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-red-500"
            >
              <option value="">Select a case...</option>
              {MOCK_CASES.map(c => (
                <option key={c.id} value={c.id}>{c.registrationNumber} - {c.petitioner}</option>
              ))}
            </select>
          </div>

          {/* 2. Document Type (Searchable List) */}
          <div className="flex flex-col h-56">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">2. Case / Document Type</label>
            
            <div className="relative mb-2">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
               <input 
                 type="text" 
                 value={docTypeSearch}
                 onChange={(e) => setDocTypeSearch(e.target.value)}
                 placeholder="Search types (e.g., Bail, WP)..."
                 className="w-full bg-gray-50 border border-gray-300 pl-9 pr-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-red-500"
               />
            </div>

            <div className="flex-1 bg-gray-50 border border-gray-300 overflow-y-auto">
               {filteredDocTypes.length > 0 ? (
                 <div className="divide-y divide-gray-200">
                    {filteredDocTypes.map(type => (
                      <button 
                        key={type.code}
                        onClick={() => handleDocTypeChange(type.code)}
                        className={`w-full text-left px-3 py-2.5 text-xs transition-colors flex items-center gap-2 ${
                          selectedDocCode === type.code 
                            ? 'bg-red-50 text-red-700 border-l-4 border-red-600' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                         <FolderOpen size={14} className={selectedDocCode === type.code ? 'text-red-600' : 'text-gray-400'} />
                         <span className="font-bold w-12 shrink-0">{type.code}</span>
                         <span className="truncate opacity-80">{type.name}</span>
                      </button>
                    ))}
                 </div>
               ) : (
                 <div className="p-4 text-center text-xs text-gray-500">No types found.</div>
               )}
            </div>
          </div>

          {/* 3. Reference Library (Dynamic with Folders) */}
          <div className={`transition-all duration-300 flex flex-col ${selectedDocCode ? 'opacity-100' : 'opacity-50 grayscale pointer-events-none'}`}>
             <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  3. Reference Drafts ({selectedDocCode || 'None'})
                </label>
                <div className="flex gap-1">
                  <button 
                    onClick={() => setIsNewFolderInputVisible(!isNewFolderInputVisible)}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50"
                    title="New Folder"
                  >
                    <FolderPlus size={14} />
                  </button>
                  <button 
                    onClick={handleUploadTemplate}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 flex items-center gap-1 text-[10px]"
                  >
                    <Upload size={12} /> Upload
                  </button>
                </div>
             </div>
             
             <div className="bg-gray-50 border border-gray-300 min-h-[150px] max-h-[250px] flex flex-col overflow-hidden">
                
                {/* Breadcrumbs / Navigation Bar */}
                <div className="px-3 py-2 bg-gray-100 border-b border-gray-200 flex items-center text-xs text-gray-500 overflow-x-auto">
                   <button 
                     onClick={handleNavigateRoot} 
                     className={`hover:text-gray-900 ${folderPath.length === 0 ? 'text-gray-900 font-bold' : ''}`}
                   >
                     Root
                   </button>
                   {folderPath.map((folder, idx) => (
                     <React.Fragment key={folder.id}>
                       <ChevronRight size={10} className="mx-1 text-gray-400" />
                       <span className={idx === folderPath.length - 1 ? 'text-gray-900 font-bold' : ''}>{folder.name}</span>
                     </React.Fragment>
                   ))}
                   {folderPath.length > 0 && (
                     <button onClick={handleNavigateUp} className="ml-auto p-1 hover:text-gray-900" title="Up">
                       <CornerUpLeft size={12} />
                     </button>
                   )}
                </div>

                {/* New Folder Input */}
                {isNewFolderInputVisible && (
                   <div className="p-2 bg-gray-100 border-b border-gray-200 flex gap-2">
                      <input 
                        autoFocus
                        type="text" 
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        placeholder="Folder Name..."
                        className="flex-1 bg-white border border-gray-300 px-2 py-1 text-xs text-gray-900 focus:border-red-500 outline-none"
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                      />
                      <button onClick={handleCreateFolder} className="text-[10px] bg-blue-600 px-2 text-white">Add</button>
                      <button onClick={() => setIsNewFolderInputVisible(false)} className="text-[10px] text-gray-500 px-1">Cancel</button>
                   </div>
                )}

                {/* File/Folder List */}
                <div className="overflow-y-auto flex-1 p-1">
                  {selectedDocCode && currentItems.length > 0 ? (
                    <div className="space-y-0.5">
                      {currentItems.map(item => {
                        const isSelected = item.type === 'file' && selectedTemplates.includes(item.id);
                        return (
                          <div 
                            key={item.id} 
                            onClick={() => item.type === 'folder' ? handleNavigateFolder(item) : toggleTemplateSelection(item.id)}
                            className={`group p-2 flex items-center gap-3 cursor-pointer hover:bg-red-50 transition-colors ${isSelected ? 'bg-red-50 border border-red-100' : ''}`}
                          >
                             {/* Icon Area */}
                             <div className="w-5 flex justify-center">
                               {item.type === 'folder' ? (
                                 <Folder size={16} className="text-red-500 fill-red-50" />
                               ) : (
                                 <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${isSelected ? 'bg-red-600 border-red-600' : 'border-gray-400'}`}>
                                    {isSelected && <CheckCircle size={10} className="text-white" />}
                                 </div>
                               )}
                             </div>

                             {/* Name Area */}
                             <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                   {item.type === 'file' && <BookTemplate size={14} className="text-gray-400" />}
                                   <p className={`text-xs font-medium truncate ${isSelected ? 'text-red-700' : 'text-gray-700'}`}>{item.name}</p>
                                </div>
                             </div>

                             {/* Delete Action */}
                             <button 
                               onClick={(e) => handleDeleteItem(e, item.id)}
                               className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                             >
                                <Trash2 size={12} />
                             </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 text-xs p-4 text-center opacity-60">
                      <FolderOpen size={24} className="mb-2" />
                      <p>Folder is empty.</p>
                    </div>
                  )}
                </div>
             </div>
          </div>

          {/* 4. Case Context Files */}
          <div>
             <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">4. Case Context (FIR / Orders)</label>
             {uploadedContextFiles.length > 0 ? (
               <div className="space-y-2">
                 {uploadedContextFiles.map((file, idx) => (
                   <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-300 text-sm text-gray-700">
                     <FileText size={14} className="text-blue-600" />
                     <span className="truncate flex-1">{file}</span>
                     <button onClick={() => setUploadedContextFiles(prev => prev.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-600">
                       <X size={14} />
                     </button>
                   </div>
                 ))}
                 <button 
                    onClick={() => setIsVaultPickerOpen(true)} 
                    className="w-full py-2 border border-dashed border-gray-300 text-red-600 hover:text-red-700 hover:bg-red-50 text-xs flex items-center justify-center gap-2 font-medium"
                 >
                    <Plus size={12} /> Add More Files
                 </button>
               </div>
             ) : (
               <div 
                 onClick={() => setIsVaultPickerOpen(true)}
                 className="border border-dashed border-gray-300 p-4 bg-gray-50 flex flex-col items-center justify-center text-gray-500 text-sm cursor-pointer hover:bg-gray-100 hover:border-gray-400 transition-all group"
               >
                  <FolderSearch size={20} className="mb-2 group-hover:text-red-600" />
                  <p className="group-hover:text-gray-700">Add Files from Digital Vault</p>
               </div>
             )}
          </div>
        </div>

        <div className="p-5 border-t border-red-100 bg-white">
          <button 
            onClick={handleGenerateDraft}
            disabled={!selectedCaseId || !selectedDocCode || isGenerating}
            className={`w-full py-3 font-medium flex items-center justify-center gap-2 shadow-lg transition-all ${
              !selectedCaseId || !selectedDocCode || isGenerating
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
             {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
             {isGenerating ? 'Generating Draft...' : 'Generate Draft'}
          </button>
        </div>
      </div>

      {/* Right Panel: Editor / Chat */}
      <div className="flex-1 bg-white border border-red-200 flex flex-col overflow-hidden relative">
         {/* Editor Toolbar */}
         <div className="h-12 bg-gray-50 border-b border-gray-200 flex items-center px-4 justify-between shrink-0">
            <span className="text-xs text-gray-500 font-mono flex items-center gap-2">
              {selectedDocCode && <span className="px-1.5 py-0.5 bg-red-50 text-red-600 border border-red-100 text-[10px]">{selectedDocCode}</span>}
              {selectedDocCode ? `${selectedDocTypeObj?.name || 'Document'}.docx` : 'Untitled'}
            </span>
            <div className="flex gap-2">
               <span className="text-xs text-gray-500">
                 {selectedTemplates.length > 0 ? `${selectedTemplates.length} reference(s) active` : 'No references selected'}
               </span>
            </div>
         </div>

         {/* Editor Area (Page View) */}
         <div className="flex-1 bg-gray-100 overflow-hidden relative flex flex-col items-center p-8">
            {isGenerating && (
               <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
                  <Sparkles size={48} className="text-red-600 animate-pulse mb-4" />
                  <p className="text-lg font-serif text-gray-900">Consulting Legal Knowledge Base...</p>
                  <p className="text-sm text-gray-500 mt-2">Drafting {selectedDocCode} based on case details.</p>
                  <p className="text-xs text-red-500 mt-4 animate-pulse">Reading multilingual documents (Marathi/Hindi)...</p>
               </div>
            )}
            
            {/* Draft Actions */}
            {generatedDraft && !isGenerating && (
              <div className="absolute top-4 right-8 flex gap-2 z-20 animate-fade-in">
                  <button 
                    onClick={handleCopyDraft} 
                    className="p-2 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 text-gray-700 transition-colors" 
                    title="Copy Text"
                  >
                      <Copy size={16} />
                  </button>
                  <button 
                    onClick={handleDownloadDraft} 
                    className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded shadow-sm hover:bg-red-700 font-medium text-sm transition-colors"
                  >
                      <Download size={16} /> Download
                  </button>
              </div>
            )}

            {!selectedCaseId || !selectedDocCode ? (
               <div className="w-full max-w-3xl h-full bg-white shadow-sm border border-gray-200 flex flex-col items-center justify-center text-gray-400 p-12">
                  <FileText size={48} className="mb-4 opacity-20" />
                  <p>Select a matter and case type to begin.</p>
                  <p className="text-xs mt-2 max-w-xs text-center">
                    Use folders to organize your drafts (e.g., "High Court Formats" vs "Sessions Court").
                  </p>
               </div>
            ) : (
               <div className="w-full max-w-[816px] h-full bg-white shadow-lg border border-gray-200 relative overflow-hidden flex flex-col">
                  {generatedDraft ? (
                    <textarea 
                      className="w-full h-full p-12 font-serif text-base text-gray-900 leading-relaxed outline-none resize-none"
                      value={generatedDraft}
                      onChange={(e) => setGeneratedDraft(e.target.value)}
                      placeholder="Draft text will appear here..."
                      spellCheck={false}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-300 p-12 select-none">
                       <p className="text-center font-bold text-gray-900 opacity-20 mb-2">IN THE HIGH COURT OF JUDICATURE AT BOMBAY</p>
                       <p className="text-center font-bold text-gray-900 opacity-20">NAGPUR BENCH, NAGPUR</p>
                       <div className="h-4 bg-gray-100 w-1/3 mx-auto mt-8 rounded"></div>
                       <div className="h-4 bg-gray-100 w-1/2 mx-auto mt-2 rounded"></div>
                       <div className="h-4 bg-gray-100 w-2/3 mx-auto mt-2 rounded"></div>
                       <div className="mt-auto mb-12 flex flex-col items-center">
                         <Sparkles size={24} className="text-red-200 mb-2" />
                         <p className="text-sm text-gray-400">Ready to Generate Draft</p>
                       </div>
                    </div>
                  )}
               </div>
            )}
         </div>

         {/* Prompt Input */}
         <div className="p-4 bg-gray-50 border-t border-gray-200 shrink-0 z-20 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
            <div className="relative">
               <textarea 
                 value={promptInput}
                 onChange={(e) => setPromptInput(e.target.value)}
                 placeholder={`Provide specific instructions (e.g., 'Draft a ${selectedDocCode} emphasizing the delay in filing')...`} 
                 className="w-full bg-white border border-gray-300 pl-4 pr-12 py-3 text-sm text-gray-900 focus:outline-none focus:border-red-500 min-h-[50px] resize-none"
               />
               <button 
                 onClick={handleGenerateDraft}
                 disabled={isGenerating || !selectedCaseId}
                 className="absolute right-3 top-3 p-1.5 bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
               >
                 <Send size={16} />
               </button>
            </div>
         </div>
      </div>

      {/* --- Vault Picker Modal --- */}
      {isVaultPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-8">
           <div className="bg-white border border-red-200 w-full max-w-5xl h-[80vh] flex flex-col shadow-2xl relative">
              <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900">Select Context File from Vault</h3>
                <button onClick={() => setIsVaultPickerOpen(false)} className="text-gray-400 hover:text-red-600"><X size={24}/></button>
              </div>
              <div className="flex-1 overflow-hidden p-4">
                 <DigitalVault 
                   items={vaultItems} 
                   onItemsChange={onVaultChange}
                   onFileSelect={handleVaultFileSelect}
                 />
              </div>
           </div>
        </div>
      )}

    </div>
  );
};