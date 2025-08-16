import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Users, Calendar, DollarSign, Eye } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { CreateVacancyModal } from './CreateVacancyModal';
import { VacancyDetailsModal } from './VacancyDetailsModal';
import { hrApiService } from '../../services/hrApi';
import { Vacancy, Department, VacancyStatus } from '../../types';

export const VacanciesPage: React.FC = () => {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<VacancyStatus | ''>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedDepartment, selectedStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [vacanciesData, departmentsData] = await Promise.all([
        hrApiService.getVacancies(selectedDepartment || undefined, selectedStatus || undefined),
        hrApiService.getDepartmentHierarchy()
      ]);
      setVacancies(vacanciesData);
      setDepartments(departmentsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVacancy = async (data: any) => {
    try {
      await hrApiService.createVacancy(data);
      await loadData();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating vacancy:', error);
    }
  };

  const filteredVacancies = vacancies.filter(vacancy =>
    vacancy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vacancy.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: VacancyStatus) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'on_hold': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: VacancyStatus) => {
    switch (status) {
      case 'open': return 'Открыта';
      case 'in_progress': return 'В процессе';
      case 'closed': return 'Закрыта';
      case 'on_hold': return 'Приостановлена';
      default: return status;
    }
  };

  const formatSalary = (from?: number, to?: number) => {
    if (!from && !to) return 'Не указана';
    if (from && to) return `${from.toLocaleString()} - ${to.toLocaleString()} сум`;
    if (from) return `от ${from.toLocaleString()} сум`;
    if (to) return `до ${to.toLocaleString()} сум`;
    return 'Не указана';
  };

  const getDepartmentName = (departmentId: string): string => {
    const findDepartment = (deps: Department[]): Department | undefined => {
      for (const dep of deps) {
        if (dep.id === departmentId) return dep;
        if (dep.children) {
          const found = findDepartment(dep.children);
          if (found) return found;
        }
      }
      return undefined;
    };
    
    const department = findDepartment(departments);
    return department?.name || 'Неизвестный отдел';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Вакансии</h1>
          <p className="text-gray-600">Управление открытыми позициями и подбор персонала</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Создать вакансию
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Поиск по названию или должности..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Все отделы</option>
            {departments.map(dept => (
              <React.Fragment key={dept.id}>
                <option value={dept.id}>{dept.name}</option>
                {dept.children?.map(child => (
                  <option key={child.id} value={child.id}>
                    └ {child.name}
                  </option>
                ))}
              </React.Fragment>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as VacancyStatus | '')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Все статусы</option>
            <option value="open">Открыта</option>
            <option value="in_progress">В процессе</option>
            <option value="on_hold">Приостановлена</option>
            <option value="closed">Закрыта</option>
          </select>
        </div>
      </div>

      {/* Vacancies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVacancies.map((vacancy) => (
          <div key={vacancy.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {vacancy.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{vacancy.position}</p>
                  <p className="text-sm text-gray-500">{getDepartmentName(vacancy.departmentId)}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vacancy.status)}`}>
                  {getStatusText(vacancy.status)}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>Требуется: {vacancy.quantity} чел.</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="w-4 h-4" />
                  <span>{formatSalary(vacancy.salaryFrom, vacancy.salaryTo)}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Открыта: {new Date(vacancy.openDate).toLocaleDateString('ru-RU')}</span>
                </div>

                {vacancy.candidates && vacancy.candidates.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Users className="w-4 h-4" />
                    <span>Кандидатов: {vacancy.candidates.length}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedVacancy(vacancy)}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Подробнее
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredVacancies.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Вакансии не найдены</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedDepartment || selectedStatus
              ? 'Попробуйте изменить параметры поиска'
              : 'Создайте первую вакансию для начала работы'
            }
          </p>
          {!searchTerm && !selectedDepartment && !selectedStatus && (
            <Button onClick={() => setShowCreateModal(true)}>
              Создать вакансию
            </Button>
          )}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateVacancyModal
          departments={departments}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateVacancy}
        />
      )}

      {selectedVacancy && (
        <VacancyDetailsModal
          vacancy={selectedVacancy}
          departments={departments}
          onClose={() => setSelectedVacancy(null)}
          onUpdate={loadData}
        />
      )}
    </div>
  );
};