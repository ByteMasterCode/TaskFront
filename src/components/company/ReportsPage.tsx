import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  Download,
  Filter,
  PieChart,
  Activity,
  Clock,
  DollarSign,
  UserCheck,
  Building2
} from 'lucide-react';

const ReportsPage: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState('attendance');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const reportTypes = [
    { id: 'attendance', label: 'Посещаемость', icon: Calendar, color: 'blue' },
    { id: 'recruitment', label: 'Рекрутинг', icon: UserCheck, color: 'green' },
    { id: 'salary', label: 'Зарплаты', icon: DollarSign, color: 'emerald' },
    { id: 'workforce', label: 'Кадровый состав', icon: Users, color: 'purple' },
    { id: 'departments', label: 'По отделам', icon: Building2, color: 'indigo' },
    { id: 'performance', label: 'Эффективность', icon: TrendingUp, color: 'orange' },
  ];

  const renderAttendanceReport = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">94.2%</p>
              <p className="text-sm text-gray-600">Средняя посещаемость</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">12</p>
              <p className="text-sm text-gray-600">Опозданий</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">8.5ч</p>
              <p className="text-sm text-gray-600">Среднее время работы</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">15,400 ₽</p>
              <p className="text-sm text-gray-600">Штрафы за период</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Динамика посещаемости</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">График посещаемости по дням</p>
          </div>
        </div>
      </div>

      {/* Department Breakdown */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Посещаемость по отделам</h3>
        <div className="space-y-4">
          {[
            { name: 'IT отдел', attendance: 96.5, color: 'bg-green-500' },
            { name: 'Отдел продаж', attendance: 92.8, color: 'bg-blue-500' },
            { name: 'HR отдел', attendance: 94.2, color: 'bg-purple-500' },
            { name: 'Бухгалтерия', attendance: 98.1, color: 'bg-emerald-500' },
          ].map((dept) => (
            <div key={dept.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${dept.color}`}></div>
                <span className="text-sm font-medium text-gray-900">{dept.name}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${dept.color}`}
                    style={{ width: `${dept.attendance}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-12 text-right">
                  {dept.attendance}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRecruitmentReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">24</p>
              <p className="text-sm text-gray-600">Новых кандидатов</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">8</p>
              <p className="text-sm text-gray-600">Нанято</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">15</p>
              <p className="text-sm text-gray-600">Собеседований</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">33%</p>
              <p className="text-sm text-gray-600">Конверсия найма</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Воронка рекрутинга</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Воронка конверсии кандидатов</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDefaultReport = () => (
    <div className="text-center py-12">
      <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Отчет в разработке</h3>
      <p className="text-gray-600">Данный тип отчета будет доступен в ближайшее время</p>
    </div>
  );

  const renderReportContent = () => {
    switch (selectedReport) {
      case 'attendance': return renderAttendanceReport();
      case 'recruitment': return renderRecruitmentReport();
      default: return renderDefaultReport();
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Отчеты и аналитика</h2>
          <p className="text-gray-600">Анализ данных по персоналу и HR-процессам</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Период:</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
            />
            <span className="text-gray-500">—</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
            />
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors">
            <Download className="h-4 w-4" />
            <span>Экспорт</span>
          </button>
        </div>
      </div>

      {/* Report Types */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-6 gap-4">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            const isActive = selectedReport === report.id;
            return (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  isActive
                    ? `border-${report.color}-500 bg-${report.color}-50`
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className={`w-10 h-10 mx-auto mb-2 rounded-lg flex items-center justify-center ${
                  isActive ? `bg-${report.color}-500` : 'bg-gray-100'
                }`}>
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                </div>
                <p className={`text-sm font-medium ${
                  isActive ? `text-${report.color}-700` : 'text-gray-700'
                }`}>
                  {report.label}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Report Content */}
      <div>
        {renderReportContent()}
      </div>
    </div>
  );
};

export default ReportsPage;