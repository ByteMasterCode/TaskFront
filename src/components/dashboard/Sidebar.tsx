import React from 'react';
import { CheckSquare, Target, Users, User, LogOut, Menu, X } from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  currentPage: string;
  onPageChange: (page: string) => void;
  user: any;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggle,
  currentPage,
  onPageChange,
  user,
  onLogout
}) => {
  const menuItems = [
    { id: 'tasks', label: 'Задачи', icon: CheckSquare },
    { id: 'projects', label: 'Проекты', icon: Target },
    { id: 'users', label: 'Команда', icon: Users },
  ];

  return (
    <div className={`${collapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <CheckSquare className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">TaskMaster</h1>
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {collapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center ${collapsed ? 'justify-center px-3' : 'space-x-3 px-3'} py-2.5 rounded-lg text-left transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`${collapsed ? 'w-6 h-6' : 'w-5 h-5'} ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                {!collapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-gray-100">
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || 'Пользователь'}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.phone}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Выйти"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Выйти"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;