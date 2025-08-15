import React, { useState } from 'react';
import { X, Briefcase, FileText, Building2, DollarSign, Hash, Calendar, Users } from 'lucide-react';
import { Department, PaymentType } from '../../types';

interface CreateVacancyModalProps {
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    departmentId: string;
    position: string;
    quantity: number;
    salaryFrom?: number;
    salaryTo?: number;
    paymentType: PaymentType;
    requirements?: string;
    responsibilities?: string;
    openDate: string;
  }) => Promise<void>;
  departments: Department[];
}

const CreateVacancyModal: React.FC<CreateVacancyModalProps> = ({
  onClose,
  onSubmit,
  departments
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    departmentId: '',
    position: '',
    quantity: 1,
    salaryFrom: '',
    salaryTo: '',
    paymentType: 'salary' as PaymentType,
    requirements: '',
    responsibilities: '',
    openDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Название вакансии обязательно');
      return;
    }
    
    if (!formData.description.trim()) {
      setError('Описание вакансии обязательно');
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

    if (formData.quantity < 1) {
      setError('Количество мест должно быть больше 0');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const submitData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        departmentId: formData.departmentId,
        position: formData.position.trim(),
        quantity: formData.quantity,
        salaryFrom: formData.salaryFrom ? Number(formData.salaryFrom) : undefined,
        salaryTo: formData.salaryTo ? Number(formData.salaryTo) : undefined,
        paymentType: formData.paymentType,
        requirements: formData.requirements.trim() || undefined,
        responsibilities: formData.responsibilities.trim() || undefined,
        openDate: formData.openDate
      };

      await onSubmit(submitData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания вакансии');
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
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Новая вакансия</h2>
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
            {/* Basic Info */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <h3 className="font-semibold text-emerald-900 mb-4 flex items-center space-x-2">
                <Briefcase className="h-4 w-4" />
                <span>Основная информация</span>
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Название вакансии *</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                      placeholder="Frontend разработчик"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Отдел *</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <select
                        value={formData.departmentId}
                        onChange={(e) => setFormData(prev => ({ ...prev, departmentId: e.target.value }))}
                        className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                        required
                      >
                        <option value="">Выберите отдел</option>
                        {renderDepartmentOptions(departments)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Должность *</label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                      className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                      placeholder="Senior Frontend Developer"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Количество мест *</label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                        className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                        min="1"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Дата открытия *</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="date"
                        value={formData.openDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, openDate: e.target.value }))}
                        className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Описание *</label>
                  <div className="relative">
                    <div className="absolute left-3 top-3">
                      <FileText className="h-4 w-4 text-gray-400" />
                    </div>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 resize-none"
                      placeholder="Краткое описание вакансии"
                      rows={3}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Salary Info */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h3 className="font-semibold text-green-900 mb-4 flex items-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span>Оплата труда</span>
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Тип оплаты</label>
                  <select
                    value={formData.paymentType}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentType: e.target.value as PaymentType }))}
                    className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                  >
                    <option value="salary">Оклад</option>
                    <option value="piecework">Сдельная</option>
                    <option value="mixed">Смешанная</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Зарплата от (₽)</label>
                    <input
                      type="number"
                      value={formData.salaryFrom}
                      onChange={(e) => setFormData(prev => ({ ...prev, salaryFrom: e.target.value }))}
                      className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                      placeholder="50000"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Зарплата до (₽)</label>
                    <input
                      type="number"
                      value={formData.salaryTo}
                      onChange={(e) => setFormData(prev => ({ ...prev, salaryTo: e.target.value }))}
                      className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                      placeholder="100000"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Requirements & Responsibilities */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="font-semibold text-blue-900 mb-4 flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Требования и обязанности</span>
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Требования</label>
                  <textarea
                    value={formData.requirements}
                    onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                    className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 resize-none"
                    placeholder="• Опыт работы от 3 лет&#10;• Знание React, TypeScript&#10;• Английский язык B2+"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Обязанности</label>
                  <textarea
                    value={formData.responsibilities}
                    onChange={(e) => setFormData(prev => ({ ...prev, responsibilities: e.target.value }))}
                    className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 resize-none"
                    placeholder="• Разработка веб-приложений&#10;• Участие в code review&#10;• Менторинг junior разработчиков"
                    rows={4}
                  />
                </div>
              </div>
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
            disabled={loading || !formData.title.trim() || !formData.description.trim() || !formData.departmentId}
            className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white rounded-lg transition-colors font-medium flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Создание...</span>
              </>
            ) : (
              <span>Создать вакансию</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateVacancyModal;