import React, { useState } from 'react';
import {
  DollarSign,
  Calculator,
  CheckCircle,
  Clock,
  CreditCard,
  TrendingUp,
  Users,
  Calendar,
  Download,
  Filter
} from 'lucide-react';

const SalaryPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  return (
    <div className="p-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">2,450,000 ₽</p>
              <p className="text-sm text-gray-600">Общий фонд зарплат</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Calculator className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">45</p>
              <p className="text-sm text-gray-600">Рассчитано</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">12</p>
              <p className="text-sm text-gray-600">Ожидают утверждения</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">33</p>
              <p className="text-sm text-gray-600">Выплачено</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-600" />
              <label className="text-sm font-medium text-gray-700">Период:</label>
              <input
                type="month"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
            </div>
            <select className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors">
              <option value="">Все отделы</option>
              <option value="it">IT отдел</option>
              <option value="sales">Отдел продаж</option>
              <option value="hr">HR отдел</option>
            </select>
            <select className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors">
              <option value="">Все статусы</option>
              <option value="calculated">Рассчитано</option>
              <option value="approved">Утверждено</option>
              <option value="paid">Выплачено</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors">
              <Calculator className="h-4 w-4" />
              <span>Рассчитать все</span>
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors">
              <Download className="h-4 w-4" />
              <span>Экспорт</span>
            </button>
          </div>
        </div>
      </div>

      {/* Salary Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Зарплаты за {new Date(selectedPeriod + '-01').toLocaleDateString('ru-RU', { year: 'numeric', month: 'long' })}
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Сотрудник</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Отдел</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Оклад</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Переработки</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Премии</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Штрафы</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">К выплате</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Статус</th>
                <th className="text-right py-4 px-6 font-semibold text-gray-900">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* Mock data - replace with real data */}
              {[
                {
                  id: '1',
                  name: 'Иван Иванов',
                  department: 'IT отдел',
                  baseSalary: 80000,
                  overtime: 5000,
                  bonuses: 10000,
                  penalties: 0,
                  total: 95000,
                  status: 'paid'
                },
                {
                  id: '2',
                  name: 'Мария Петрова',
                  department: 'Отдел продаж',
                  baseSalary: 60000,
                  overtime: 2000,
                  bonuses: 15000,
                  penalties: 1000,
                  total: 76000,
                  status: 'approved'
                },
                {
                  id: '3',
                  name: 'Алексей Сидоров',
                  department: 'HR отдел',
                  baseSalary: 70000,
                  overtime: 0,
                  bonuses: 5000,
                  penalties: 0,
                  total: 75000,
                  status: 'calculated'
                }
              ].map((salary) => (
                <tr key={salary.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{salary.name}</h3>
                        <p className="text-sm text-gray-500">EMP{salary.id.padStart(3, '0')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-900">{salary.department}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm font-medium text-gray-900">
                      {salary.baseSalary.toLocaleString()} ₽
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-900">
                      {salary.overtime > 0 ? `+${salary.overtime.toLocaleString()} ₽` : '—'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-green-600 font-medium">
                      {salary.bonuses > 0 ? `+${salary.bonuses.toLocaleString()} ₽` : '—'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-red-600 font-medium">
                      {salary.penalties > 0 ? `-${salary.penalties.toLocaleString()} ₽` : '—'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-lg font-bold text-gray-900">
                      {salary.total.toLocaleString()} ₽
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      salary.status === 'paid' ? 'bg-green-100 text-green-800 border-green-200' :
                      salary.status === 'approved' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                      'bg-yellow-100 text-yellow-800 border-yellow-200'
                    }`}>
                      {salary.status === 'paid' ? 'Выплачено' :
                       salary.status === 'approved' ? 'Утверждено' :
                       'Рассчитано'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {salary.status === 'calculated' && (
                        <button className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors" title="Утвердить">
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      {salary.status === 'approved' && (
                        <button className="text-green-600 hover:text-green-800 p-1 rounded transition-colors" title="Выплатить">
                          <CreditCard className="h-4 w-4" />
                        </button>
                      )}
                      <button className="text-gray-600 hover:text-gray-800 p-1 rounded transition-colors" title="Детали">
                        <TrendingUp className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalaryPage;