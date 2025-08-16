import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Eye, Edit, Trash2, Users, Calendar, DollarSign } from 'lucide-react';
import { hrApiService } from '../../services/hrApi';
import { Vacancy, VacancyStatus, Department } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import LoadingSpinner from '../ui/LoadingSpinner';
import CreateVacancyModal from './CreateVacancyModal';
import VacancyDetailsModal from './VacancyDetailsModal';

const VacanciesPage: React.FC = () => {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<VacancyStatus | 'all'>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [vacanciesData, departmentsData] = await Promise.all([
        hrApiService.getVacancies(),
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

  const handleCreateVacancy = async (vacancyData: any) => {
    try {
      const newVacancy = await hrApiService.createVacancy(vacancyData);
      setVacancies(prev => [newVacancy, ...prev]);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating vacancy:', error);
    }
  };

  const handleDeleteVacancy = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту вакансию?')) return;
    
    try {
      await hrApiService.deleteVacancy(id);
      setVacancies(prev => prev.filter(v => v.id !== id));
    } catch (error) {
      console.error('Error deleting vacancy:', error);
    }
  };

  const getStatusColor = (status: VacancyStatus) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'on_hold': return 'bg-blue-100 text-blue-800';
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

  const getDepartmentName = (departmentId: string): string => {
    const findDepartment = (depts: Department[]): Department | undefined => {
      for (const dept of depts) {
        if (dept.id === departmentId) return dept;
        if (dept.children) {
          const found = findDepartment(dept.children);
          if (found) return found;
        }
      }
      return undefined;
    };
    
    const department = findDepartment(departments);
    return department?.name || 'Неизвестный отдел';
  };

  const filteredVacancies = vacancies.filter(vacancy => {
    const matchesSearch = vacancy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vacancy.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || vacancy.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || vacancy.departmentId === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

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
          <p className="text-gray-600">Управление открытыми позициями</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Создать вакансию
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Поиск по названию или позиции..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as VacancyStatus | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Все статусы</option>
            <option value="open">Открыта</option>
            <option value="in_progress">В процессе</option>
            <option value="closed">Закрыта</option>
            <option value="on_hold">Приостановлена</option>
          </select>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Все отделы</option>
            {departments.map(dept => (
              <React.Fragment key={dept.id}>
                <option value={dept.id}>{dept.name}</option>
                {dept.children?.map(child => (
                  <option key={child.id} value={child.id}>
                    — {child.name}
                  </option>
                ))}
              </React.Fragment>
            ))}
          </select>

          <div className="flex items-center text-sm text-gray-600">
            <Filter className="w-4 h-4 mr-2" />
            Найдено: {filteredVacancies.length}
          </div>
        </div>
      </div>

      {/* Vacancies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVacancies.map(vacancy => (
          <div key={vacancy.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {vacancy.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{vacancy.position}</p>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vacancy.status)}`}>
                    {getStatusText(vacancy.status)}
                  </span>
                </div>
                <div className="flex space-x-1 ml-4">
                  <button
                    onClick={() => {
                      setSelectedVacancy(vacancy);
                      setShowDetailsModal(true);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteVacancy(vacancy.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  {getDepartmentName(vacancy.departmentId)}
                </div>
                
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Открыта: {new Date(vacancy.openDate).toLocaleDateString('ru-RU')}
                </div>

                {(vacancy.salaryFrom || vacancy.salaryTo) && (
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    {vacancy.salaryFrom && vacancy.salaryTo 
                      ? `${vacancy.salaryFrom.toLocaleString()} - ${vacancy.salaryTo.toLocaleString()} сум`
                      : vacancy.salaryFrom 
                        ? `от ${vacancy.salaryFrom.toLocaleString()} сум`
                        : `до ${vacancy.salaryTo?.toLocaleString()} сум`
                    }
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">
                    Позиций: {vacancy.quantity}
                  </span>
                  <span className="text-gray-600">
                    Кандидатов: {vacancy.candidates?.length || 0}
                  </span>
                </div>
              </div>

              {vacancy.description && (
                <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                  {vacancy.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredVacancies.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Вакансии не найдены</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== 'all' || departmentFilter !== 'all'
              ? 'Попробуйте изменить параметры поиска'
              : 'Создайте первую вакансию для начала работы'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && departmentFilter === 'all' && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Создать вакансию
            </Button>
          )}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateVacancyModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateVacancy}
          departments={departments}
        />
      )}

      {showDetailsModal && selectedVacancy && (
        <VacancyDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedVacancy(null);
          }}
          vacancy={selectedVacancy}
          onUpdate={loadData}
        />
      )}
    </div>
  );
};

export default VacanciesPage;