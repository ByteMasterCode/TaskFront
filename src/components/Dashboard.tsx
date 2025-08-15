import React, { useState } from 'react';
import Sidebar from './dashboard/Sidebar';
import TasksPage from "./tasks/TasksPage";
import ProjectsPage from "./projects/ProjectsPage";
import UsersPage from "./users/UsersPage";
import { User } from '../types';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [currentPage, setCurrentPage] = useState('projects');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'tasks':
        return <TasksPage />;
      case 'projects':
        return <ProjectsPage />;
      case 'users':
        return <UsersPage />;
      default:
        return <ProjectsPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        user={user}
        onLogout={onLogout}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;