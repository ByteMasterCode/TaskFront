import React from 'react';
import { X, Building2, Users, Calendar, FileText, Activity, Folder, FolderOpen } from 'lucide-react';
import { Department } from '../../types';

interface DepartmentDetailsModalProps {
  department: Department;
  onClose: () => void;
  onEdit: () => void;
}

const DepartmentDetailsModal: React.FC<DepartmentDetailsModalProps> = ({
  department,
  onClose,
  onEdit
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Не указано';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const renderChildDepartments = (children: Department[]) => {
    if (!children || children.length === 0) return null;

    return (
      <div className="space-y-2">
        {children.map((child) => (
          <div key={child.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                  {child.children && child.children.length > 0 ? (
                    <FolderOpen className="h-3 w-3 text-blue-600" />
                  ) : (
                    <Building2 className="h-3 w-3 text-blue-600" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">{child.name}</h4>
                  {child.description && (
                    <p className="text-xs text-gray-600">{child.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded">
                  {child.workers?.length || 0} сотр.
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  child.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {child.status === 'active' ? 'Активный' : 'Неактивный'}
                </span>
              </div>
            </div>
            {child.children && child.children.length > 0 && (
              <div className="mt-2 ml-4">
                {renderChildDepartments(child.children)}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{department.name}</h2>
              <p className="text-sm text-gray-600">Детали отдела</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onEdit}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span>Редактировать</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Info */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <span>Основная информация</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID отдела</label>
                <p className="text-sm text-gray-900 font-mono bg-white px-3 py-2 rounded border">
                  {department.id}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
                <span className={`inline-flex px-3 py-2 rounded-full text-sm font-medium ${
                  department.status === 'active' 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                }`}>
                  {department.status === 'active' ? 'Активный' : 'Неактивный'}
                </span>
              </div>
            </div>

            {department.description && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                  {department.description}
                </p>
              </div>
            )}
          </div>

          {/* Statistics */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-600" />
              <span>Статистика</span>
            </h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-green-200 text-center">
                <div className="text-2xl font-bold text-green-600">{department.workers?.length || 0}</div>
                <div className="text-xs text-green-600 font-medium">Прямых сотрудников</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-200 text-center">
                <div className="text-2xl font-bold text-green-600">{getTotalWorkers(department)}</div>
                <div className="text-xs text-green-600 font-medium">Всего сотрудников</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-200 text-center">
                <div className="text-2xl font-bold text-green-600">{department.children?.length || 0}</div>
                <div className="text-xs text-green-600 font-medium">Подотделов</div>
              </div>
            </div>
          </div>

          {/* Child Departments */}
          {department.children && department.children.length > 0 && (
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Folder className="h-5 w-5 text-purple-600" />
                <span>Подотделы ({department.children.length})</span>
              </h3>
              {renderChildDepartments(department.children)}
            </div>
          )}

          {/* Timestamps */}
          <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-600" />
              <span>История</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Создан</label>
                <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                  {formatDate(department.createdAt)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Обновлен</label>
                <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                  {formatDate(department.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentDetailsModal;