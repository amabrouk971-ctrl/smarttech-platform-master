import React from 'react';
import { 
  LayoutDashboard, Users, GraduationCap, UserCheck, 
  Image as ImageIcon, Store, UsersRound, MessageSquare, 
  BarChart, Shield, Settings, Menu, X
} from 'lucide-react';

export type AdminCategory = 
  'DASHBOARD' | 'PEOPLE' | 'ACADEMIC' | 'STUDENT_MANAGEMENT' | 
  'CONTENT' | 'STORE' | 'CRM' | 'COMMUNICATION' | 
  'ANALYTICS' | 'SECURITY' | 'SETTINGS';

interface SidebarProps {
  activeCategory: AdminCategory;
  onSelectCategory: (cat: AdminCategory) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const NAV_ITEMS = [
  { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'PEOPLE', label: 'People', icon: Users },
  { id: 'ACADEMIC', label: 'Academic', icon: GraduationCap },
  { id: 'STUDENT_MANAGEMENT', label: 'Student Management', icon: UserCheck },
  { id: 'CONTENT', label: 'Content', icon: ImageIcon },
  { id: 'STORE', label: 'Store', icon: Store },
  { id: 'CRM', label: 'CRM', icon: UsersRound },
  { id: 'COMMUNICATION', label: 'Communication', icon: MessageSquare },
  { id: 'ANALYTICS', label: 'Analytics', icon: BarChart },
  { id: 'SECURITY', label: 'Security', icon: Shield },
  { id: 'SETTINGS', label: 'Settings', icon: Settings },
] as const;

export const Sidebar: React.FC<SidebarProps> = ({ activeCategory, onSelectCategory, isOpen, onToggle }) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-800 
        transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 shrink-0">
          <span className="text-xl font-black text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg leading-none">S</span>
            </div>
            SmartTech
          </span>
          <button onClick={onToggle} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeCategory === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectCategory(item.id as AdminCategory)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-red-500/10 text-red-500' 
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-red-500' : 'text-slate-500'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
