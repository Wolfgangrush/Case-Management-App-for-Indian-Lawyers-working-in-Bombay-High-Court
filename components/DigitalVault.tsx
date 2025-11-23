import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Folder, FileText, Image, Search, UploadCloud, 
  ChevronRight, Trash2, FolderPlus, X, File, CornerUpLeft, Download, AlertCircle, Check
} from 'lucide-react';
import { FileSystemItem } from '../types';

interface DigitalVaultProps {
  items: FileSystemItem[];
  onItemsChange?: React.Dispatch<React.SetStateAction<FileSystemItem[]>>;
  initialFolderId?: string | null;
  onFolderOpened?: () => void;
  onDeleteRequest?: (id: string) => void;
  // New props for Picker Mode
  onFileSelect?: (file: FileSystemItem) => void;
}

// Helper to parse size string (e.g., "1.2 MB") into bytes
const parseSize = (sizeStr?: string) => {
  if (!sizeStr) return 0;
  const parts = sizeStr.split(' ');
  if (parts.length !== 2) return 0;
  
  const val = parseFloat(parts[0]);
  const unit = parts[1].toUpperCase();
  
  const multipliers: {[key: string]: number} = {
    'B': 1,
    'KB': 1024,
    'MB': 1024 * 1024,
    'GB': 1024 * 1024 * 1024,
    'TB': 1024 * 1024 * 1024 * 1024
  };
  
  return val * (multipliers[unit] || 0);
};

// Helper to format bytes back to string
const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const DigitalVault: React.FC<DigitalVaultProps> = ({ 
  items, 
  onItemsChange,
  initialFolderId,
  onFolderOpened,
  onDeleteRequest,
  onFileSelect
}) => {
  // --- Local State for UI (Navigation, Selection) ---
  const [currentPath, setCurrentPath] = useState<FileSystemItem[]>([]); 
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [previewFile, setPreviewFile] = useState<FileSystemItem | null>(null);
  
  // File Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPickerMode = !!onFileSelect;

  // --- Effect: Handle Deep Linking (Opening specific folder from external action) ---
  useEffect(() => {
    if (initialFolderId) {
      const targetFolder = items.find(i => i.id === initialFolderId);
      if (targetFolder) {
        const path = [];
        if (targetFolder.parentId) {
           const parent = items.find(i => i.id === targetFolder.parentId);
           if (parent) path.push(parent);
        }
        path.push(targetFolder);
        setCurrentPath(path);
      }
      if (onFolderOpened) onFolderOpened();
    }
  }, [initialFolderId, items, onFolderOpened]);

  // --- Derived State ---
  const currentFolderId = currentPath.length > 0 ? currentPath[currentPath.length - 1].id : null;

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // If searching, search everything. If not, only show current folder contents
      if (searchQuery) {
        return item.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return item.parentId === currentFolderId;
    });
  }, [items, currentFolderId, searchQuery]);

  // --- Storage Calculation ---
  const { formattedUsed, percentage, formattedTotal } = useMemo(() => {
    const totalBytes = items.reduce((acc, item) => {
       if (item.type === 'file' && item.size) {
         return acc + parseSize(item.size);
       }
       return acc;
    }, 0);

    const LIMIT = 2 * 1024 * 1024 * 1024; // 2 GB limit for local app
    const pct = Math.min((totalBytes / LIMIT) * 100, 100).toFixed(1);
    
    return {
      formattedUsed: formatBytes(totalBytes),
      percentage: pct,
      formattedTotal: '2 GB'
    };
  }, [items]);

  // --- Actions ---
  const handleNavigate = (folder: FileSystemItem) => {
    setCurrentPath([...currentPath, folder]);
    setSearchQuery(''); // Clear search on nav
  };

  const handleNavigateUp = () => {
    if (currentPath.length === 0) return;
    setCurrentPath(currentPath.slice(0, -1));
  };

  const handleBreadcrumbClick = (index: number) => {
    setCurrentPath(currentPath.slice(0, index + 1));
  };

  const handleNavigateRoot = () => {
    setCurrentPath([]);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (onDeleteRequest) {
      onDeleteRequest(id);
    } else if (onItemsChange && window.confirm('Are you sure you want to delete this item?')) {
      onItemsChange(prev => prev.filter(item => item.id !== id && item.parentId !== id));
    }
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim() || !onItemsChange) return;
    const newFolder: FileSystemItem = {
      id: `folder-${Date.now()}`,
      parentId: currentFolderId,
      name: newFolderName,
      type: 'folder',
      date: 'Just now'
    };
    onItemsChange(prev => [...prev, newFolder]);
    setNewFolderName('');
    setIsNewFolderOpen(false);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!onItemsChange || !event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    let fileType: 'pdf' | 'doc' | 'xls' | 'image' | 'unknown' = 'unknown';
    if (extension === 'pdf') fileType = 'pdf';
    else if (['doc', 'docx'].includes(extension || '')) fileType = 'doc';
    else if (['xls', 'xlsx'].includes(extension || '')) fileType = 'xls';
    else if (['jpg', 'jpeg', 'png'].includes(extension || '')) fileType = 'image';

    const fileSize = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${(file.size / 1024).toFixed(0)} KB`;
    
    // Check for Electron 'path' property for persistent local file access
    // otherwise fallback to Blob URL (session only)
    let fileUrl = '';
    // Detect Electron environment via window.process
    const isElectron = window.process && (window.process as any).type;
    
    if (isElectron && (file as any).path) {
      // Safe path construction for Windows (replace backslashes)
      const rawPath = (file as any).path.replace(/\\/g, '/');
      // Encode URI components to handle spaces and special chars in path
      const encodedPath = encodeURI(rawPath);
      fileUrl = `file:///${encodedPath}`;
    } else {
      fileUrl = URL.createObjectURL(file);
    }

    const newFile: FileSystemItem = {
       id: `file-${Date.now()}`,
       parentId: currentFolderId,
       name: file.name,
       type: 'file',
       fileType: fileType,
       size: fileSize,
       date: 'Just now',
       fileUrl: fileUrl 
    };
    onItemsChange(prev => [...prev, newFile]);
    
    // Reset input
    event.target.value = '';
  };

  const handleFileClick = (item: FileSystemItem) => {
    if (item.type === 'folder') {
      handleNavigate(item);
    } else {
      if (isPickerMode && onFileSelect) {
        onFileSelect(item);
      } else {
        setPreviewFile(item);
      }
    }
  };

  // --- Icons helper ---
  const getFileIcon = (item: FileSystemItem) => {
    if (item.type === 'folder') return <Folder size={32} className="text-red-500 fill-red-50" />;
    switch (item.fileType) {
      case 'pdf': return <FileText size={32} className="text-red-600" />;
      case 'doc': return <FileText size={32} className="text-blue-600" />;
      case 'image': return <Image size={32} className="text-purple-600" />;
      case 'xls': return <FileText size={32} className="text-green-600" />;
      default: return <File size={32} className="text-gray-400" />;
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 relative">
      
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelected} 
        style={{ display: 'none' }} 
      />

      {/* --- Header & Toolbar --- */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div>
            {!isPickerMode && <h2 className="text-2xl font-bold text-gray-900">Digital Vault</h2>}
            {/* Breadcrumbs */}
            <div className="flex items-center text-sm text-gray-500 mt-1 overflow-x-auto">
              <button 
                onClick={handleNavigateRoot}
                className={`hover:text-gray-900 transition-colors ${currentPath.length === 0 ? 'text-gray-900 font-bold' : ''}`}
              >
                Root
              </button>
              {currentPath.map((folder, index) => (
                <div key={folder.id} className="flex items-center">
                  <ChevronRight size={14} className="mx-1 text-gray-400" />
                  <button 
                    onClick={() => handleBreadcrumbClick(index)}
                    className={`hover:text-gray-900 transition-colors whitespace-nowrap ${index === currentPath.length - 1 ? 'text-gray-900 font-bold' : ''}`}
                  >
                    {folder.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Action Buttons - Visible in Picker Mode to allow adding files */}
          <div className="flex gap-2">
            <button 
              onClick={() => setIsNewFolderOpen(true)}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors text-sm font-medium"
            >
              <FolderPlus size={16} /> New Folder
            </button>
            <button 
              onClick={handleUploadClick}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 transition-colors text-sm font-medium"
            >
              <UploadCloud size={16} /> Upload
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 overflow-hidden">
        
        {/* --- Sidebar (Quick Access) - Hidden in Picker Mode --- */}
        {!isPickerMode && (
          <div className="hidden lg:block bg-white border border-red-200 p-4 overflow-y-auto">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Quick Access</h3>
            <ul className="space-y-1">
              <li onClick={handleNavigateRoot} className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 border-l-2 border-red-600 cursor-pointer text-sm font-medium">
                  <Folder size={16} /> All Files
              </li>
              <li className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors text-sm">
                  <AlertCircle size={16} /> Recent
              </li>
              <li className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors text-sm">
                  <Trash2 size={16} /> Trash
              </li>
            </ul>

            {/* Dynamic Storage Indicator */}
            <div className="mt-6 p-4 bg-gray-50 border border-gray-200">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>Storage</span>
                <span>{percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 h-1.5 overflow-hidden">
                <div 
                   className="bg-red-600 h-full transition-all duration-500"
                   style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 mt-2">{formattedUsed} of {formattedTotal} used</p>
            </div>
          </div>
        )}

        {/* --- Main Content Area --- */}
        <div className={`${isPickerMode ? 'col-span-4' : 'lg:col-span-3'} flex flex-col bg-white border border-red-200 overflow-hidden`}>
            {/* Search Bar & Up Button */}
            <div className="p-4 border-b border-gray-200 flex items-center gap-4 bg-gray-50">
                {currentPath.length > 0 && (
                  <button onClick={handleNavigateUp} className="p-2 hover:bg-gray-200 text-gray-500 transition-colors">
                    <CornerUpLeft size={18} />
                  </button>
                )}
                <div className="relative flex-1">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                   <input 
                     type="text" 
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     placeholder={`Search in ${currentFolderId ? currentPath[currentPath.length - 1].name : 'Root'}...`} 
                     className="w-full bg-white border border-gray-300 pl-9 pr-4 py-1.5 text-sm text-gray-900 focus:outline-none focus:border-red-500 transition-colors"
                   />
                </div>
            </div>

            {/* Grid View */}
            <div className="p-6 overflow-y-auto flex-1 bg-white">
               {filteredItems.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                   <Folder size={48} className="mb-4 opacity-20 text-gray-300" />
                   <p>Folder is empty</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredItems.map(item => (
                      <div 
                        key={item.id} 
                        onClick={() => handleFileClick(item)}
                        className={`group relative p-4 bg-white border border-gray-200 hover:border-red-300 hover:shadow-sm cursor-pointer transition-all ${isPickerMode && item.type === 'file' ? 'hover:bg-red-50' : ''}`}
                      >
                          <div className="flex justify-between items-start mb-3">
                             {getFileIcon(item)}
                             {!isPickerMode && (
                               <button 
                                onClick={(e) => handleDelete(e, item.id)}
                                className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50"
                               >
                                  <Trash2 size={16} />
                               </button>
                             )}
                             {isPickerMode && item.type === 'file' && (
                               <div className="opacity-0 group-hover:opacity-100 text-red-600">
                                 <Check size={16} />
                               </div>
                             )}
                          </div>
                          <p className="text-sm font-medium text-gray-900 line-clamp-1 mb-1 break-all" title={item.name}>{item.name}</p>
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>{item.type === 'folder' ? 'Folder' : item.size}</span>
                            <span>{item.date}</span>
                          </div>
                      </div>
                    ))}
                 </div>
               )}
            </div>
        </div>
      </div>

      {/* --- New Folder Modal --- */}
      {isNewFolderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-red-200 p-6 w-96 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create New Folder</h3>
            <input 
              autoFocus
              type="text" 
              placeholder="Folder Name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              className="w-full bg-gray-50 border border-gray-300 px-4 py-2 text-gray-900 focus:border-red-500 focus:outline-none mb-4"
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setIsNewFolderOpen(false)}
                className="px-4 py-2 text-gray-500 hover:text-gray-900 text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateFolder}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- File Preview Modal (Only when NOT in Picker Mode) --- */}
      {previewFile && !isPickerMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in p-8">
          <div className="bg-white border border-red-200 w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                 {getFileIcon(previewFile)}
                 <div>
                   <h3 className="text-lg font-bold text-gray-900">{previewFile.name}</h3>
                   <p className="text-xs text-gray-500">{previewFile.size} • Last edited {previewFile.date}</p>
                 </div>
              </div>
              <div className="flex items-center gap-2">
                 {previewFile.fileUrl && (
                    <a href={previewFile.fileUrl} download={previewFile.name} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200 transition-colors">
                      <Download size={20} />
                    </a>
                 )}
                 <button 
                   onClick={() => setPreviewFile(null)}
                   className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200 transition-colors"
                 >
                   <X size={20} />
                 </button>
              </div>
            </div>

            {/* Modal Content Preview */}
            <div className="flex-1 bg-gray-100 p-8 overflow-y-auto flex flex-col items-center">
               <div className="w-full h-full bg-white shadow-xl border border-gray-200 min-h-[500px]">
                  {previewFile.fileUrl && previewFile.fileType === 'pdf' ? (
                     <embed 
                        src={previewFile.fileUrl}
                        type="application/pdf"
                        className="w-full h-full"
                     />
                  ) : previewFile.fileUrl && previewFile.fileType === 'image' ? (
                     <img src={previewFile.fileUrl} alt={previewFile.name} className="max-w-full max-h-full object-contain mx-auto" />
                  ) : (
                     <div className="p-12 text-gray-900">
                        <h1 className="text-2xl font-serif font-bold mb-6 text-center">{previewFile.name.replace(/\.[^/.]+$/, "")}</h1>
                        <div className="space-y-4 font-serif text-justify leading-relaxed opacity-90">
                           <p>IN THE HIGH COURT OF JUDICATURE AT BOMBAY</p>
                           <p className="text-center font-bold">NAGPUR BENCH, NAGPUR</p>
                           <div className="border-t border-b border-gray-200 py-4 my-8 text-center italic text-gray-500">
                              [Preview not available for this file type. Please download to view.]
                           </div>
                        </div>
                     </div>
                  )}
               </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};