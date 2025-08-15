import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Users,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Eye,
  ToggleLeft,
  AlertTriangle
} from 'lucide-react';
import { Department } from '../../types';
import { hrApiService } from '../../services/hrApi';
import CreateDepartmentModal from './CreateDepartmentModal';
import EditDepartmentModal from './EditDepartmentModal';
import DepartmentDetailsModal from './DepartmentDetailsModal';

const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [viewingDepartment, setViewingDepartment] = useState<Department | null>(null);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      console.log('Loading departments...');
      const data = await hrApiService.getDepartmentHierarchy();
      console.log('Departments API response:', data);
      setDepartments(Array.isArray(data) ? data : []);
      console.log('Departments state set to:', Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading departments:', err);
      setError(err instanceof Error ? err.message : 'Ошибка загрузки отделов');
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDepartment = async (data: {
    name: string;
    description?: string;
    parentId?: string | null;
    status?: string;
  }) => {
    try {
      console.log('Creating department with data:', data);
      await hrApiService.createDepartment(data);
      console.log('Department created successfully');
      await loadDepartments(); // Перезагружаем список
      setShowCreateModal(false);
    } catch (err) {
      console.error('Error creating department:', err);
      throw err;
    }
  };

  const handleEditDepartment = async (id: string, data: {
    name: string;
    description?: string;
    parentId?: string | null;
    status: string;
  }) => {
    try {
      console.log('Updating department:', id, data);
      await hrApiService.updateDepartment(id, data);
      console.log('Department updated successfully');
      await loadDepartments();
      setEditingDepartment(null);
    } catch (err) {
      console.error('Error updating department:', err);
      throw err;
    }
  };

  const handleDeleteDepartment = async (department: Department) => {
    // Проверяем, есть ли сотрудники или подотделы
    const hasWorkers = department.workers && department.workers.length > 0;
    const hasChildren = department.children && department.children.length > 0;
    
    if (hasWorkers || hasChildren) {
      alert('Нельзя удалить отдел, в котором есть сотрудники или подотделы. Сначала переместите их в другие отделы.');
      return;
    }

    if (!confirm(`Вы уверены, что хотите удалить отдел "${department.name}"?`)) return;
    
    try {
      console.log('Deleting department:', department.id);
      await hrApiService.deleteDepartment(department.id);
      console.log('Department deleted successfully');
      await loadDepartments();
    } catch (err) {
      console.error('Error deleting department:', err);
      setError(err instanceof Error ? err.message : 'Ошибка удаления отдела');
    }
  };

  const handleToggleStatus = async (department: Department) => {
    const newStatus = department.status === 'active' ? 'inactive' : 'active';
    
    try {
      await hrApiService.updateDepartment(department.id, { status: newStatus });
      await loadDepartments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка изменения статуса отдела');
    }
  };

  const toggleExpanded = (deptId: string) => {
    const newExpanded = new Set(expandedDepts);
    if (newExpanded.has(deptId)) {
      newExpanded.delete(deptId);
    } else {
      newExpanded.add(deptId);
    }
    setExpandedDepts(newExpanded);
  };

  const renderDepartment = (dept: Department, level: number = 0) => {
    const hasChildren = dept.children && dept.children.length > 0;
    const isExpanded = expandedDepts.has(dept.id);
    const paddingLeft = level * 24;
    const totalWorkers = getTotalWorkers(dept);

    return (
      <div key={dept.id}>
        <div 
          className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
          style={{ paddingLeft: paddingLeft + 16 }}
        >
          <div className="flex items-center space-x-3 flex-1">
            {hasChildren ? (
              <button
                onClick={() => toggleExpanded(dept.id)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-600" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                )}
              </button>
            ) : (
              <div className="w-6 h-6" />
            )}
            
            <div className="flex items-center space-x-2">
              {hasChildren ? (
                isExpanded ? (
                  <FolderOpen className="h-5 w-5 text-blue-600" />
                ) : (
                  <Folder className="h-5 w-5 text-blue-600" />
                )
              ) : (
                <Building2 className="h-5 w-5 text-gray-600" />
              )}
              <div>
                <h3 className="font-semibold text-gray-900">{dept.name}</h3>
                {dept.description && (
                  <p className="text-sm text-gray-600">{dept.description}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
              <Users className="h-4 w-4" />
              <span>{dept.workers?.length || 0}</span>
              {totalWorkers !== (dept.workers?.length || 0) && (
                <span className="text-xs text-gray-500">({totalWorkers} всего)</span>
              )}
            </div>
            
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              dept.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {dept.status === 'active' ? 'Активный' : 'Неактивный'}
            </span>

            <div className="flex items-center space-x-1 flex-shrink-0">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setViewingDepartment(dept);
                }}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Просмотр деталей"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingDepartment(dept);
                }}
                className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                title="Редактировать"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleStatus(dept);
                }}
                className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                title={dept.status === 'active' ? 'Деактивировать' : 'Активировать'}
              >
                <ToggleLeft className="h-4 w-4" />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteDepartment(dept);
                }}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Удалить отдел"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {hasChildren && isExpanded && dept.children?.map(child => 
          renderDepartment(child, level + 1)
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка отделов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Структура отделов</h2>
          <p className="text-gray-600">Управление организационной структурой компании</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="h-5 w-5" />
          <span>Создать отдел</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
              <p className="text-sm text-gray-600">Всего отделов</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <FolderOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {departments.filter(d => d.status === 'active').length}
              </p>
              <p className="text-sm text-gray-600">Активных</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {departments.reduce((sum, d) => sum + (d.workers?.length || 0), 0)}
              </p>
              <p className="text-sm text-gray-600">Сотрудников</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Folder className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {departments.filter(d => d.children && d.children.length > 0).length}
              </p>
              <p className="text-sm text-gray-600">С подотделами</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Departments Tree */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Иерархия отделов</h3>
          <p className="text-sm text-gray-600 mt-1">Нажмите на стрелку для раскрытия подотделов</p>
        </div>
        
        {departments.length > 0 ? (
          <div>
            {console.log('Rendering departments:', departments)}
            {departments.map(dept => renderDepartment(dept))}
          </div>
        ) : (
          <div className="text-center py-12">
            {console.log('No departments to render, departments:', departments)}
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Отделы не найдены</h3>
            <p className="text-gray-600 mb-4">Создайте первый отдел для начала работы</p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium"
            >
              Создать отдел
            </button>
          </div>
        )}
      </div>

      {/* Create Department Modal */}
      {showCreateModal && (
        <CreateDepartmentModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateDepartment}
          departments={departments}
        />
      )}

      {/* Edit Department Modal */}
      {editingDepartment && (
        <EditDepartmentModal
          department={editingDepartment}
          onClose={() => setEditingDepartment(null)}
          onSubmit={(data) => handleEditDepartment(editingDepartment.id, data)}
          departments={departments}
        />
      )}

      {/* Department Details Modal */}
      {viewingDepartment && (
        <DepartmentDetailsModal
          department={viewingDepartment}
          onClose={() => setViewingDepartment(null)}
          onEdit={() => {
            setEditingDepartment(viewingDepartment);
            setViewingDepartment(null);
          }}
        />
      )}
    </div>
  );
};

const getTotalWorkers = (dept: Department): number => {
  let total = dept.workers?.length || 0;
  if (dept.children) {
    dept.children.forEach(child => {
      total += getTotalWorkers(child);
    });
  }
  return total;
};

export default DepartmentsPage;