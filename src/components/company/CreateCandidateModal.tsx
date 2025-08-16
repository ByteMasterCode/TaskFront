import React, { useState } from 'react';
import { X, User, Phone, Mail, Calendar, Briefcase, FileText, DollarSign, Star } from 'lucide-react';
import { Vacancy, CandidateStatus } from '../../types';

interface CreateCandidateModalProps {
  vacancy: Vacancy;
  onClose: () => void;
  onSubmit: (data: {
    firstName: string;
    lastName: string;
    middleName?: string;
    phone: string;
    email?: string;
    birthDate?: string;
    vacancyId: string;
    status?: CandidateStatus;
    resume?: string;
    experience?: string;
    education?: string;
    expectedSalary?: number;
    notes?: string;
  }) => Promise<void>;
}

const CreateCandidateModal: React.FC<CreateCandidateModalProps> = ({
  vacancy,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    phone: '',
    email: '',
    birthDate: '',
    resume: '',
    experience: '',
    education: '',
    expectedSalary: '',
    notes: ''
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

    try {
      setLoading(true);
      setError('');
      
      const submitData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        middleName: formData.middleName.trim() || undefined,
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        birthDate: formData.birthDate || undefined,
        vacancyId: vacancy.id,
        status: 'new' as CandidateStatus,
        resume: formData.resume.trim() || undefined,
        experience: formData.experience.trim() || undefined,
        education: formData.education.trim() || undefined,
        expectedSalary: formData.expectedSalary ? Number(formData.expectedSalary) : undefined,
        notes: formData.notes.trim() || undefined
      };

      await onSubmit(submitData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка добавления кандидата');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Новый кандидат</h2>
              <p className="text-sm text-gray-600">{vacancy.title}</p>
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
            {/* Vacancy Info */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <h3 className="font-semibold text-emerald-900 mb-2 flex items-center space-x-2">
                <Briefcase className="h-4 w-4" />
                <span>Вакансия</span>
              </h3>
              <div className="text-sm text-emerald-700">
                <p><span className="font-medium">Должность:</span> {vacancy.position}</p>
                <p><span className="font-medium">Отдел:</span> {vacancy.department?.name || 'Не указан'}</p>
                {(vacancy.salaryFrom || vacancy.salaryTo) && (
                  <p>
                    <span className="font-medium">Зарплата:</span> {' '}
                    {vacancy.salaryFrom && vacancy.salaryTo 
                      ? `${vacancy.salaryFrom.toLocaleString()} - ${vacancy.salaryTo.toLocaleString()} ₽`
                      : vacancy.salaryFrom 
                        ? `от ${vacancy.salaryFrom.toLocaleString()} ₽`
                        : `до ${vacancy.salaryTo?.toLocaleString()} ₽`
                    }
                  </p>
                )}
              </div>
            </div>

            {/* Personal Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="font-semibold text-blue-900 mb-4 flex items-center space-x-2">
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
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                    placeholder="Иван"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Фамилия *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                    placeholder="Иванов"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Отчество</label>
                  <input
                    type="text"
                    value={formData.middleName}
                    onChange={(e) => setFormData(prev => ({ ...prev, middleName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                    placeholder="Иванович"
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
                      className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                      placeholder="+998 90 123 45 67"
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
                      className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                      placeholder="ivan@example.com"
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Дата рождения</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Info */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <h3 className="font-semibold text-purple-900 mb-4 flex items-center space-x-2">
                <Star className="h-4 w-4" />
                <span>Профессиональная информация</span>
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ожидаемая зарплата (₽)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      value={formData.expectedSalary}
                      onChange={(e) => setFormData(prev => ({ ...prev, expectedSalary: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                      placeholder="80000"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Опыт работы</label>
                  <textarea
                    value={formData.experience}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 resize-none"
                    placeholder="• 3 года в компании ABC&#10;• Разработка веб-приложений&#10;• Работа с React, TypeScript"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Образование</label>
                  <textarea
                    value={formData.education}
                    onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 resize-none"
                    placeholder="• Высшее техническое образование&#10;• ТГТУ, Информатика и ВТ&#10;• Дополнительные курсы"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Резюме / Портфолио</label>
                  <textarea
                    value={formData.resume}
                    onChange={(e) => setFormData(prev => ({ ...prev, resume: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 resize-none"
                    placeholder="Ссылка на резюме, портфолио или краткое описание навыков"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Дополнительные заметки</label>
              <div className="relative">
                <div className="absolute left-3 top-3">
                  <FileText className="h-4 w-4 text-gray-400" />
                </div>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 resize-none"
                  placeholder="Дополнительная информация о кандидате"
                  rows={3}
                />
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
            disabled={loading || !formData.firstName.trim() || !formData.lastName.trim() || !formData.phone.trim()}
            className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white rounded-lg transition-colors font-medium flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Добавление...</span>
              </>
            ) : (
              <span>Добавить кандидата</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCandidateModal;