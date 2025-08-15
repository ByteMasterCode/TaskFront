import React from 'react';
import { X, User, Phone, Mail, Calendar, Building2, Badge, DollarSign, FileText, Clock, Edit } from 'lucide-react';
import { Worker, Department } from '../../types';

interface WorkerDetailsModalProps {
  worker: Worker;
  onClose: () => void;
  onEdit: () => void;
  departments: Department[];
}

const WorkerDetailsModal: React.FC<WorkerDetailsModalProps> = ({
  worker,
  onClose,
  onEdit,
  departments
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Не указано';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'Не указано';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case 'salary': return 'Оклад';
      case 'piecework': return 'Сдельная';
      case 'mixed': return 'Смешанная';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'vacation': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'sick_leave': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'dismissed': return 'bg-red-100 text-red-800 border-red-200';
      case 'probation': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Активный';
      case 'vacation': return 'В отпуске';
      case 'sick_leave': return 'На больничном';
      case 'dismissed': return 'Уволен';
      case 'probation': return 'Испытательный срок';
      default: return status;
    }
  };

  const department = departments.find(d => d.id === worker.departmentId);
  const workExperience = Math.floor((Date.now() - new Date(worker.hireDate).getTime()) / (1000 * 60 * 60 * 24 * 365));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {worker.firstName} {worker.lastName}
              </h2>
              <p className="text-sm text-gray-600">{worker.position}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onEdit}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
            >
              <Edit className="h-4 w-4" />
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
              <User className="h-5 w-5 text-blue-600" />
              <span>Основная информация</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID сотрудника</label>
                <p className="text-sm text-gray-900 font-mono bg-white px-3 py-2 rounded border">
                  {worker.employeeId}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
                <span className={`inline-flex px-3 py-2 rounded-full text-sm font-medium border ${getStatusColor(worker.status)}`}>
                  {getStatusLabel(worker.status)}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Полное имя</label>
                <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                  {worker.lastName} {worker.firstName} {worker.middleName || ''}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Стаж работы</label>
                <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                  {workExperience} {workExperience === 1 ? 'год' : workExperience < 5 ? 'года' : 'лет'}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Phone className="h-5 w-5 text-green-600" />
              <span>Контактная информация</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                <p className="text-sm text-gray-900 font-mono bg-white px-3 py-2 rounded border">
                  {worker.phone}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                  {worker.email || '—'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Дата рождения</label>
                <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                  {formatDate(worker.birthDate)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Дата найма</label>
                <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                  {formatDate(worker.hireDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Work Info */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-purple-600" />
              <span>Рабочая информация</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Отдел</label>
                <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                  {department?.name || 'Неизвестно'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Должность</label>
                <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                  {worker.position}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              <span>Оплата труда</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Тип оплаты</label>
                <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                  {getPaymentTypeLabel(worker.paymentType)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Базовый оклад</label>
                <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                  {worker.baseSalary ? `${worker.baseSalary.toLocaleString()} ₽` : '—'}
                </p>
              </div>
              {worker.hourlyRate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Почасовая ставка</label>
                  <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                    {worker.hourlyRate} ₽/час
                  </p>
                </div>
              )}
              {worker.pieceRate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Сдельная ставка</label>
                  <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                    {worker.pieceRate} ₽/единица
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {worker.notes && (
            <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <FileText className="h-5 w-5 text-gray-600" />
                <span>Заметки</span>
              </h3>
              <p className="text-sm text-gray-700 bg-white px-3 py-2 rounded border whitespace-pre-wrap">
                {worker.notes}
              </p>
            </div>
          )}

          {/* Timestamps */}
          <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Clock className="h-5 w-5 text-gray-600" />
              <span>История</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Создан</label>
                <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                  {formatDateTime(worker.createdAt)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Обновлен</label>
                <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                  {formatDateTime(worker.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerDetailsModal;