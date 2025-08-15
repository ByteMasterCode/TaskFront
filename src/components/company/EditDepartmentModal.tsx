import React, { useState } from 'react';
import { X, Building2, FileText, Users, Save } from 'lucide-react';
import { Department } from '../../types';

interface EditDepartmentModalProps {
  department: Department;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description?: string;
    parentId?: string | null;
    status: string;
  }) => Promise<void>;
  departments: Department[];
}

const EditDepartmentModal: React.FC<EditDepartmentModalProps> = ({
  department,
  onClose,
  onSubmit,
  departments
}) => {
  const [formData, setFormData] = useState({
    name: department.name,
    description: department.description || '',
    parentId: department.parentId || '',
    status: department.status
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Название отдела обязательно');
      return;
    }

    // Проверяем, что отдел не назначается сам себе в качестве родителя
    if (formData.parentId === department.id) {
      setError('Отдел не может быть родителем самого себя');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        parentId: formData.parentId || null,
        status: formData.status
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления отдела');
    } finally {
      setLoading(false);
    }
  };

  // Рекурсивная функция для отображения отделов в select (исключая текущий отдел и его потомков)
  const renderDepartmentOptions = (depts: Department[], level: number = 0): JSX.Element[] => {
    const result: JSX.Element[] = [];
    
    depts.forEach(dept => {
      // Исключаем текущий отдел и его потомков
      if (dept.id === department.id) return;
      
      const indent = '—'.repeat(level);
      result.push(
        <option key={dept.id} value={dept.id}>
          {indent} {dept.name}
        </option>
      );
      
      if (dept.children && dept.children.length > 0) {
        result.push(...renderDepartmentOptions(dept.children, level + 1));
      }
    });
    
    return result;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Редактировать отдел</h2>
              <p className="text-sm text-gray-600">ID: {department.id.slice(0, 8)}...</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Department Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Название отдела *
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Building2 className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                placeholder="Введите название отдела"
                required
              />
            </div>
          </div>

          {/* Parent Department */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Родительский отдел
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Users className="h-4 w-4 text-gray-400" />
              </div>
              <select
                value={formData.parentId}
                onChange={(e) => setFormData(prev => ({ ...prev, parentId: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
              >
                <option value="">Корневой отдел</option>
                {Array.isArray(departments) && renderDepartmentOptions(departments)}
              </select>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Оставьте пустым для создания корневого отдела
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Описание
            </label>
            <div className="relative">
              <div className="absolute left-3 top-3">
                <FileText className="h-4 w-4 text-gray-400" />
              </div>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 resize-none"
                placeholder="Краткое описание отдела"
                rows={3}
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Статус
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
            >
              <option value="active">Активный</option>
              <option value="inactive">Неактивный</option>
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white rounded-lg transition-colors font-medium flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Сохранение...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Сохранить изменения</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDepartmentModal;