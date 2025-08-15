import React, { useState } from 'react';
import { X, ArrowRightLeft, Building2, Badge, Calendar, FileText } from 'lucide-react';
import { Worker, Department } from '../../types';

interface TransferWorkerModalProps {
  worker: Worker;
  onClose: () => void;
  onSubmit: (data: {
    workerId: string;
    newDepartmentId: string;
    newPosition: string;
    effectiveDate: string;
    reason: string;
  }) => Promise<void>;
  departments: Department[];
}

const TransferWorkerModal: React.FC<TransferWorkerModalProps> = ({
  worker,
  onClose,
  onSubmit,
  departments
}) => {
  const [formData, setFormData] = useState({
    newDepartmentId: '',
    newPosition: worker.position,
    effectiveDate: new Date().toISOString().split('T')[0],
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.newDepartmentId) {
      setError('Выберите новый отдел');
      return;
    }

    if (formData.newDepartmentId === worker.departmentId) {
      setError('Выберите другой отдел');
      return;
    }

    if (!formData.newPosition.trim()) {
      setError('Укажите новую должность');
      return;
    }

    if (!formData.reason.trim()) {
      setError('Укажите причину перевода');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await onSubmit({
        workerId: worker.id,
        newDepartmentId: formData.newDepartmentId,
        newPosition: formData.newPosition.trim(),
        effectiveDate: formData.effectiveDate,
        reason: formData.reason.trim()
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка перевода сотрудника');
    } finally {
      setLoading(false);
    }
  };

  // Рекурсивная функция для отображения отделов в select
  const renderDepartmentOptions = (depts: Department[], level: number = 0): JSX.Element[] => {
    const result: JSX.Element[] = [];
    
    depts.forEach(dept => {
      if (dept.status === 'active' && dept.id !== worker.departmentId) {
        const indent = '—'.repeat(level);
        result.push(
          <option key={dept.id} value={dept.id}>
            {indent} {dept.name}
          </option>
        );
        
        if (dept.children && dept.children.length > 0) {
          result.push(...renderDepartmentOptions(dept.children, level + 1));
        }
      }
    });
    
    return result;
  };

  const currentDepartment = departments.find(d => d.id === worker.departmentId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <ArrowRightLeft className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Перевод сотрудника</h2>
              <p className="text-sm text-gray-600">{worker.firstName} {worker.lastName}</p>
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
          {/* Current Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Текущая информация</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Отдел:</span>
                <span className="font-medium">{currentDepartment?.name || 'Неизвестно'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Должность:</span>
                <span className="font-medium">{worker.position}</span>
              </div>
            </div>
          </div>

          {/* New Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Новый отдел *</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={formData.newDepartmentId}
                onChange={(e) => setFormData(prev => ({ ...prev, newDepartmentId: e.target.value }))}
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                required
              >
                <option value="">Выберите новый отдел</option>
                {renderDepartmentOptions(departments)}
              </select>
            </div>
          </div>

          {/* New Position */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Новая должность *</label>
            <div className="relative">
              <Badge className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={formData.newPosition}
                onChange={(e) => setFormData(prev => ({ ...prev, newPosition: e.target.value }))}
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                placeholder="Новая должность"
                required
              />
            </div>
          </div>

          {/* Effective Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Дата вступления в силу *</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={formData.effectiveDate}
                onChange={(e) => setFormData(prev => ({ ...prev, effectiveDate: e.target.value }))}
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Причина перевода *</label>
            <div className="relative">
              <div className="absolute left-3 top-3">
                <FileText className="h-4 w-4 text-gray-400" />
              </div>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 resize-none"
                placeholder="Укажите причину перевода"
                rows={3}
                required
              />
            </div>
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
              disabled={loading || !formData.newDepartmentId || !formData.newPosition.trim() || !formData.reason.trim()}
              className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-lg transition-colors font-medium flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Перевод...</span>
                </>
              ) : (
                <>
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>Перевести сотрудника</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferWorkerModal;