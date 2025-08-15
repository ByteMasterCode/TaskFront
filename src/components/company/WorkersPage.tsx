import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Grid3X3,
  List,
  MoreHorizontal,
  User,
  Phone,
  Mail,
  Calendar,
  Building2,
  Badge,
  Edit,
  Trash2,
  UserX,
  ArrowRightLeft
} from 'lucide-react';
import { Worker, Department, WorkerStatus } from '../../types';
import { hrApiService } from '../../services/hrApi';

const WorkersPage: React.FC = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<WorkerStatus | ''>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [workersData, departmentsData] = await Promise.all([
        hrApiService.getWorkers(),
        hrApiService.getDepartments()
      ]);
      setWorkers(Array.isArray(workersData) ? workersData : []);
      setDepartments(Array.isArray(departmentsData) ? departmentsData : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
      setWorkers([]);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorker = async (workerId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этого сотрудника?')) return;
    
    try {
      await hrApiService.dismissWorker({
        workerId,
        dismissalDate: new Date().toISOString().split('T')[0],
        reason: 'Удален из системы'
      });
      setWorkers(prev => prev.filter(w => w.id !== workerId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления сотрудника');
    }
  };

  const getStatusColor = (status: WorkerStatus) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'vacation': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'sick_leave': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'dismissed': return 'bg-red-100 text-red-800 border-red-200';
      case 'probation': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: WorkerStatus) => {
    switch (status) {
      case 'active': return 'Активный';
      case 'vacation': return 'В отпуске';
      case 'sick_leave': return 'На больничном';
      case 'dismissed': return 'Уволен';
      case 'probation': return 'Испытательный срок';
      default: return status;
    }
  };

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = 
      worker.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.phone.includes(searchQuery);
    
    const matchesDepartment = !filterDepartment || worker.departmentId === filterDepartment;
    const matchesStatus = !filterStatus || worker.status === filterStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка сотрудников...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{workers.length}</p>
              <p className="text-sm text-gray-600">Всего сотрудников</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {workers.filter(w => w.status === 'active').length}
              </p>
              <p className="text-sm text-gray-600">Активных</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {workers.filter(w => w.status === 'vacation').length}
              </p>
              <p className="text-sm text-gray-600">В отпуске</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
              <p className="text-sm text-gray-600">Отделов</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Поиск сотрудников..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Все отделы</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as WorkerStatus | '')}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Все статусы</option>
              <option value="active">Активный</option>
              <option value="vacation">В отпуске</option>
              <option value="sick_leave">На больничном</option>
              <option value="probation">Испытательный срок</option>
              <option value="dismissed">Уволен</option>
            </select>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Grid3X3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200">
              <Plus className="h-5 w-5" />
              <span>Добавить сотрудника</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Workers Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredWorkers.map((worker) => (
            <div
              key={worker.id}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
            >
              {/* Worker Header */}
              <div className="h-24 bg-gradient-to-br from-blue-500 to-purple-600 p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-2 right-2 w-12 h-12 border border-white rounded-full"></div>
                  <div className="absolute bottom-2 left-2 w-8 h-8 border border-white rounded-lg rotate-45"></div>
                </div>
                
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-white">
                      <p className="font-semibold text-sm truncate max-w-24">
                        {worker.firstName} {worker.lastName}
                      </p>
                      <p className="text-xs text-white/80 truncate">
                        {worker.employeeId}
                      </p>
                    </div>
                  </div>
                  <button className="text-white/80 hover:text-white transition-colors duration-200">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Worker Content */}
              <div className="p-4">
                <div className="space-y-3">
                  {/* Position */}
                  <div className="flex items-center space-x-2">
                    <Badge className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 font-medium truncate">{worker.position}</span>
                  </div>

                  {/* Department */}
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 truncate">
                      {departments.find(d => d.id === worker.departmentId)?.name || 'Не указан'}
                    </span>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 font-mono">{worker.phone}</span>
                  </div>

                  {/* Email */}
                  {worker.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 truncate">{worker.email}</span>
                    </div>
                  )}

                  {/* Hire Date */}
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {new Date(worker.hireDate).toLocaleDateString('ru-RU')}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(worker.status)}`}>
                      {getStatusLabel(worker.status)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-100">
                  <button className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-1 text-sm">
                    <Edit className="w-3 h-3" />
                    <span>Редактировать</span>
                  </button>
                  <button className="bg-orange-50 hover:bg-orange-100 text-orange-700 p-2 rounded-lg transition-colors">
                    <ArrowRightLeft className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={() => handleDeleteWorker(worker.id)}
                    className="bg-red-50 hover:bg-red-100 text-red-700 p-2 rounded-lg transition-colors"
                  >
                    <UserX className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Сотрудник</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">ID</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Должность</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Отдел</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Статус</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Дата найма</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-900">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredWorkers.map((worker) => (
                  <tr
                    key={worker.id}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {worker.firstName} {worker.lastName}
                          </h3>
                          <p className="text-sm text-gray-500">{worker.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-mono text-sm text-gray-900">{worker.employeeId}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-900">{worker.position}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-900">
                        {departments.find(d => d.id === worker.departmentId)?.name || '—'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(worker.status)}`}>
                        {getStatusLabel(worker.status)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-900">
                        {new Date(worker.hireDate).toLocaleDateString('ru-RU')}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-orange-600 hover:text-orange-800 p-1 rounded transition-colors">
                          <ArrowRightLeft className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteWorker(worker.id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                        >
                          <UserX className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredWorkers.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Сотрудники не найдены</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery ? 'Попробуйте изменить параметры поиска' : 'Добавьте первого сотрудника'}
          </p>
        </div>
      )}
    </div>
  );
};

export default WorkersPage;