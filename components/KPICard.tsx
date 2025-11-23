import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
  onClick?: () => void;
}

export const KPICard: React.FC<KPICardProps> = ({ label, value, icon: Icon, trend, trendPositive, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-white border border-red-200 p-5 shadow-sm hover:shadow-md transition-all duration-200 ${onClick ? 'cursor-pointer hover:border-red-400' : ''}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">{label}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
        </div>
        <div className="p-2 bg-red-50 text-red-600">
          <Icon size={20} />
        </div>
      </div>
      {trend && (
        <div className="flex items-center text-xs">
          <span className={`${trendPositive ? 'text-green-600' : 'text-red-600'} font-medium`}>
            {trend}
          </span>
          <span className="text-gray-400 ml-1">from last month</span>
        </div>
      )}
    </div>
  );
};