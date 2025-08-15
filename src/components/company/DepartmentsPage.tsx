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
  FolderOpen
} from 'lucide-react';
import { Department } from '../../types';
import { hrApiService } from '../../services/hrApi';
import CreateDepartmentModal from './CreateDepartmentModal';

const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);

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
    parentId?: string;
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
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>{dept.workers?.length || 0}</span>
            </div>
            
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              dept.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {dept.status === 'active' ? 'Активный' : 'Неактивный'}
            </span>

            <div className="flex items-center space-x-1">
              <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <Edit className="h-4 w-4" />
              </button>
              <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
    </div>
  );
};

export default DepartmentsPage;