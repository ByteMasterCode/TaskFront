import React, { useState } from 'react';
import { X, User, Phone, Mail, Calendar, Building2, Badge, DollarSign, Hash, Save } from 'lucide-react';
import { Worker, Department, PaymentType } from '../../types';

interface EditWorkerModalProps {
  worker: Worker;
  onClose: () => void;
  onSubmit: (data: Partial<Worker>) => Promise<void>;
  departments: Department[];
}

const EditWorkerModal: React.FC<EditWorkerModalProps> = ({
  worker,
  onClose,
  onSubmit,
  departments
}) => {
  const [formData, setFormData] = useState({
    employeeId: worker.employeeId,
    firstName: worker.firstName,
    lastName: worker.lastName,
    middleName: worker.middleName || '',
    phone: worker.phone,
    email: worker.email || '',
    birthDate: worker.birthDate || '',
    departmentId: worker.departmentId,
    position: worker.position,
    paymentType: worker.paymentType,
    baseSalary: worker.baseSalary?.toString() || '',
    hourlyRate: worker.hourlyRate?.toString() || '',
    pieceRate: worker.pieceRate?.toString() || '',
    notes: worker.notes || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName.trim()) {
      setError('Имя обязательно');
      return;
    }
    
    if (!formData.lastName.trim()) {
      setError('Фамилия обязательна');
      return;
    }

    if (!formData.phone.trim()) {
      setError('Телефон обязателен');
      return;
    }

    if (!formData.departmentId) {
      setError('Выберите отдел');
      return;
    }

    if (!formData.position.trim()) {
      setError('Должность обязательна');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const submitData: Partial<Worker> = {
        employeeId: formData.employeeId,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        middleName: formData.middleName.trim() || undefined,
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        birthDate: formData.birthDate || undefined,
        departmentId: formData.departmentId,
        position: formData.position.trim(),
        paymentType: formData.paymentType,
        baseSalary: formData.baseSalary ? Number(formData.baseSalary) : undefined,
        hourlyRate: formData.hourlyRate ? Number(formData.hourlyRate) : undefined,
        pieceRate: formData.pieceRate ? Number(formData.pieceRate) : undefined,
        notes: formData.notes.trim() || undefined
      };

      await onSubmit(submitData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления сотрудника');
    } finally {
      setLoading(false);
    }
  };

  // Рекурсивная функция для отображения отделов в select
  const renderDepartmentOptions = (depts: Department[], level: number = 0): JSX.Element[] => {
    const result: JSX.Element[] = [];
    
    depts.forEach(dept => {
      if (dept.status === 'active') {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Редактировать сотрудника</h2>
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
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Personal Info */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <h3 className="font-semibold text-orange-900 mb-4 flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Личная информация</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Имя *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Фамилия *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Отчество</label>
                  <input
                    type="text"
                    value={formData.middleName}
                    onChange={(e) => setFormData(prev => ({ ...prev, middleName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h3 className="font-semibold text-green-900 mb-4 flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>Контактная информация</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Телефон *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Дата рождения</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Work Info */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <h3 className="font-semibold text-purple-900 mb-4 flex items-center space-x-2">
                <Building2 className="h-4 w-4" />
                <span>Рабочая информация</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID сотрудника</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.employeeId}
                      onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Отдел *</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      value={formData.departmentId}
                      onChange={(e) => setFormData(prev => ({ ...prev, departmentId: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                      required
                    >
                      <option value="">Выберите отдел</option>
                      {renderDepartmentOptions(departments)}
                    </select>
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Должность *</label>
                  <div className="relative">
                    <Badge className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <h3 className="font-semibold text-emerald-900 mb-4 flex items-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span>Оплата труда</span>
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Тип оплаты</label>
                  <select
                    value={formData.paymentType}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentType: e.target.value as PaymentType }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  >
                    <option value="salary">Оклад</option>
                    <option value="piecework">Сдельная</option>
                    <option value="mixed">Смешанная</option>
                  </select>
                </div>

                {(formData.paymentType === 'salary' || formData.paymentType === 'mixed') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Базовый оклад (₽)</label>
                    <input
                      type="number"
                      value={formData.baseSalary}
                      onChange={(e) => setFormData(prev => ({ ...prev, baseSalary: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                      min="0"
                    />
                  </div>
                )}

                {formData.paymentType === 'mixed' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Почасовая ставка (₽/час)</label>
                    <input
                      type="number"
                      value={formData.hourlyRate}
                      onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                      min="0"
                    />
                  </div>
                )}

                {(formData.paymentType === 'piecework' || formData.paymentType === 'mixed') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Сдельная ставка (₽/единица)</label>
                    <input
                      type="number"
                      value={formData.pieceRate}
                      onChange={(e) => setFormData(prev => ({ ...prev, pieceRate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                      min="0"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Заметки</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 resize-none"
                rows={3}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
          </form>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !formData.firstName.trim() || !formData.lastName.trim() || !formData.departmentId}
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
      </div>
    </div>
  );
};

// Рекурсивная функция для отображения отделов в select
const renderDepartmentOptions = (depts: Department[], level: number = 0): JSX.Element[] => {
  const result: JSX.Element[] = [];
  
  depts.forEach(dept => {
    if (dept.status === 'active') {
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

export default EditWorkerModal;