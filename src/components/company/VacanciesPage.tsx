import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Users,
  DollarSign,
  Calendar,
  Building2,
  Eye,
  Edit,
  Trash2,
  UserPlus
} from 'lucide-react';
import { Vacancy, Department, VacancyStatus } from '../../types';
import { hrApiService } from '../../services/hrApi';
import CreateVacancyModal from './CreateVacancyModal';
import VacancyDetailsModal from './VacancyDetailsModal';

const VacanciesPage: React.FC = () => {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<VacancyStatus | ''>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [vacanciesData, departmentsData] = await Promise.all([
        hrApiService.getVacancies(),
        hrApiService.getDepartments()
      ]);
      setVacancies(Array.isArray(vacanciesData) ? vacanciesData : []);
      setDepartments(Array.isArray(departmentsData) ? departmentsData : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
      setVacancies([]);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVacancy = async (data: {
    title: string;
    description: string;
    departmentId: string;
    position: string;
    quantity: number;
    salaryFrom?: number;
    salaryTo?: number;
    paymentType: any;
    requirements?: string;
    responsibilities?: string;
    openDate: string;
  }) => {
    try {
      const newVacancy = await hrApiService.createVacancy(data);
      setVacancies(prev => [newVacancy, ...prev]);
      setShowCreateModal(false);
    } catch (err) {
      throw err;
    }
  };

  const handleCreateCandidate = async (data: any) => {
    try {
      await hrApiService.createCandidate(data);
      await loadData(); // Перезагружаем данные для обновления списка кандидатов
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateCandidateStatus = async (candidateId: string, status: any, notes?: string) => {
    try {
      await hrApiService.updateCandidateStatus(candidateId, status, notes);
      await loadData(); // Перезагружаем данные
    } catch (err) {
      throw err;
    }
  };

  const handleRateCandidate = async (candidateId: string, rating: number, notes?: string) => {
    try {
      await hrApiService.rateCandidate(candidateId, rating, notes);
      await loadData(); // Перезагружаем данные
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteVacancy = async (vacancyId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту вакансию?')) return;
    
    try {
      await hrApiService.deleteVacancy(vacancyId);
      setVacancies(prev => prev.filter(v => v.id !== vacancyId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления вакансии');
    }
  };
  const getStatusColor = (status: VacancyStatus) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: VacancyStatus) => {
    switch (status) {
      case 'open': return 'Открыта';
      case 'in_progress': return 'В процессе';
      case 'closed': return 'Закрыта';
      case 'cancelled': return 'Отменена';
      default: return status;
    }
  };

  const filteredVacancies = vacancies.filter(vacancy => {
    const matchesSearch = 
      vacancy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vacancy.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vacancy.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = !filterDepartment || vacancy.departmentId === filterDepartment;
    const matchesStatus = !filterStatus || vacancy.status === filterStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка вакансий...</p>
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
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{vacancies.length}</p>
              <p className="text-sm text-gray-600">Всего вакансий</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {vacancies.filter(v => v.status === 'open').length}
              </p>
              <p className="text-sm text-gray-600">Открытых</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {vacancies.reduce((sum, v) => sum + (v.candidates?.length || 0), 0)}
              </p>
              <p className="text-sm text-gray-600">Кандидатов</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {vacancies.filter(v => v.status === 'in_progress').length}
              </p>
              <p className="text-sm text-gray-600">В процессе</p>
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
                placeholder="Поиск вакансий..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            >
              <option value="">Все отделы</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as VacancyStatus | '')}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            >
              <option value="">Все статусы</option>
              <option value="open">Открыта</option>
              <option value="in_progress">В процессе</option>
              <option value="closed">Закрыта</option>
              <option value="cancelled">Отменена</option>
            </select>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-5 w-5" />
              <span>Создать вакансию</span>
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

      {/* Vacancies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVacancies.map((vacancy) => (
          <div
            key={vacancy.id}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
          >
            {/* Vacancy Header */}
            <div className="h-32 bg-gradient-to-br from-emerald-500 to-green-600 p-6 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 w-16 h-16 border-2 border-white rounded-lg rotate-12"></div>
                <div className="absolute bottom-4 left-4 w-12 h-12 border border-white rounded-full"></div>
              </div>
              
              <div className="flex items-start justify-between relative z-10">
                <div className="text-white flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <Briefcase className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-white/80 text-sm font-medium">
                      {departments.find(d => d.id === vacancy.departmentId)?.name || 'Отдел'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-1 leading-tight line-clamp-2">
                    {vacancy.title}
                  </h3>
                  <p className="text-white/90 text-sm">{vacancy.position}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(vacancy.status)} bg-white`}>
                  {getStatusLabel(vacancy.status)}
                </span>
              </div>
            </div>

            {/* Vacancy Content */}
            <div className="p-6">
              <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                {vacancy.description}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-blue-600">{vacancy.quantity}</div>
                  <div className="text-xs text-blue-600 font-medium">Мест</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-green-600">{vacancy.candidates?.length || 0}</div>
                  <div className="text-xs text-green-600 font-medium">Кандидатов</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-purple-600">
                    {Math.floor((Date.now() - new Date(vacancy.openDate).getTime()) / (1000 * 60 * 60 * 24))}
                  </div>
                  <div className="text-xs text-purple-600 font-medium">Дней</div>
                </div>
              </div>

              {/* Salary */}
              {(vacancy.salaryFrom || vacancy.salaryTo) && (
                <div className="flex items-center space-x-2 mb-4 p-3 bg-gray-50 rounded-lg">
                  <DollarSign className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">
                    {vacancy.salaryFrom && vacancy.salaryTo 
                      ? `${vacancy.salaryFrom.toLocaleString()} - ${vacancy.salaryTo.toLocaleString()} ₽`
                      : vacancy.salaryFrom 
                        ? `от ${vacancy.salaryFrom.toLocaleString()} ₽`
                        : `до ${vacancy.salaryTo?.toLocaleString()} ₽`
                    }
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setSelectedVacancy(vacancy)}
                  className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>Просмотр</span>
                </button>
                <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-2 rounded-lg transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteVacancy(vacancy.id)}
                  className="bg-red-50 hover:bg-red-100 text-red-700 p-2 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredVacancies.length === 0 && !loading && (
        <div className="text-center py-12">
          <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Вакансии не найдены</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery ? 'Попробуйте изменить параметры поиска' : 'Создайте первую вакансию'}
          </p>
          {!searchQuery && (
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium"
            >
              Создать вакансию
            </button>
          )}
        </div>
      )}

      {/* Create Vacancy Modal */}
      {showCreateModal && (
        <CreateVacancyModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateVacancy}
          departments={departments}
        />
      )}

      {/* Vacancy Details Modal */}
      {selectedVacancy && (
        <VacancyDetailsModal
          vacancy={selectedVacancy}
          onClose={() => setSelectedVacancy(null)}
          onCreateCandidate={handleCreateCandidate}
          onUpdateCandidateStatus={handleUpdateCandidateStatus}
          onRateCandidate={handleRateCandidate}
        />
      )}
    </div>
  );
};

export default VacanciesPage;