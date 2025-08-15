import React, { useState } from 'react';
import { Building2, Users, Briefcase, UserCheck, Calendar, DollarSign, BarChart3 } from 'lucide-react';
import WorkersPage from './WorkersPage';
import DepartmentsPage from './DepartmentsPage';
import VacanciesPage from './VacanciesPage';
import AttendancePage from './AttendancePage';
import SalaryPage from './SalaryPage';
import ReportsPage from './ReportsPage';

type CompanyTab = 'workers' | 'departments' | 'vacancies' | 'attendance' | 'salary' | 'reports';

const CompanyPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CompanyTab>('workers');

  const tabs = [
    { id: 'workers' as CompanyTab, label: 'Сотрудники', icon: Users, color: 'blue' },
    { id: 'departments' as CompanyTab, label: 'Отделы', icon: Building2, color: 'indigo' },
    { id: 'vacancies' as CompanyTab, label: 'Вакансии', icon: Briefcase, color: 'emerald' },
    { id: 'attendance' as CompanyTab, label: 'Посещаемость', icon: Calendar, color: 'orange' },
    { id: 'salary' as CompanyTab, label: 'Зарплата', icon: DollarSign, color: 'green' },
    { id: 'reports' as CompanyTab, label: 'Отчеты', icon: BarChart3, color: 'purple' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'workers': return <WorkersPage />;
      case 'departments': return <DepartmentsPage />;
      case 'vacancies': return <VacanciesPage />;
      case 'attendance': return <AttendancePage />;
      case 'salary': return <SalaryPage />;
      case 'reports': return <ReportsPage />;
      default: return <WorkersPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Управление компанией</h1>
              <p className="text-gray-600">HR-система и управление персоналом</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? `bg-white text-${tab.color}-600 shadow-sm`
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {renderContent()}
      </div>
    </div>
  );
};

export default CompanyPage;