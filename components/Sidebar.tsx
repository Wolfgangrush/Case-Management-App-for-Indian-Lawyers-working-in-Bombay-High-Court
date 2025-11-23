import React from 'react';
import { NAV_ITEMS } from '../constants';
import { Scale, Settings, LogOut } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (id: string) => void;
  onOpenSettings: () => void;
  onSignOut: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onOpenSettings, onSignOut }) => {
  return (
    <div className="w-64 bg-white border-r border-red-100 flex flex-col h-screen fixed left-0 top-0 z-20">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-red-100">
        <div className="flex items-center gap-2 text-red-600">
          <Scale size={24} />
          <span className="text-gray-900 font-bold text-lg tracking-tight">Nyaya-Logic</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <div className="mb-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Practice Management
        </div>
        {NAV_ITEMS.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-red-50 text-red-600 border-r-2 border-red-600'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}

        <div className="mt-6 mb-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Legal Intelligence
        </div>
        {NAV_ITEMS.slice(4).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-red-50 text-red-600 border-r-2 border-red-600'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-red-100 space-y-1">
        <button 
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
        >
          <Settings size={18} />
          Settings
        </button>
        <button 
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
};