import React from 'react';
import { X, MapPin, Calendar, DollarSign, Users, Clock, Star } from 'lucide-react';
import { Vacancy, Candidate } from '../../types';

interface VacancyDetailsModalProps {
  vacancy: Vacancy;
  isOpen: boolean;
  onClose: () => void;
}

export const VacancyDetailsModal: React.FC<VacancyDetailsModalProps> = ({
  vacancy,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'paused': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCandidateStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'reviewed': return 'bg-purple-100 text-purple-800';
      case 'interviewed': return 'bg-yellow-100 text-yellow-800';
      case 'hired': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatSalary = (from?: number, to?: number) => {
    if (!from && !to) return 'Не указано';
    if (from && to) return `${from.toLocaleString()} - ${to.toLocaleString()} сум`;
    if (from) return `от ${from.toLocaleString()} сум`;
    if (to) return `до ${to.toLocaleString()} сум`;
    return 'Не указано';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{vacancy.title}</h2>
            <p className="text-gray-600 mt-1">{vacancy.position}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Status and Basic Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(vacancy.status)}`}>
                    {vacancy.status === 'open' ? 'Открыта' :
                     vacancy.status === 'in_progress' ? 'В процессе' :
                     vacancy.status === 'closed' ? 'Закрыта' :
                     vacancy.status === 'paused' ? 'Приостановлена' : vacancy.status}
                  </span>
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{vacancy.quantity} позиций</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Открыта: {new Date(vacancy.openDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2" />
                    <span>{formatSalary(vacancy.salaryFrom, vacancy.salaryTo)}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Описание</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{vacancy.description}</p>
              </div>

              {/* Requirements */}
              {vacancy.requirements && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Требования</h3>
                  <div className="text-gray-700 whitespace-pre-wrap">{vacancy.requirements}</div>
                </div>
              )}

              {/* Responsibilities */}
              {vacancy.responsibilities && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Обязанности</h3>
                  <div className="text-gray-700 whitespace-pre-wrap">{vacancy.responsibilities}</div>
                </div>
              )}
            </div>

            {/* Candidates */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Кандидаты ({vacancy.candidates?.length || 0})
              </h3>
              
              {vacancy.candidates && vacancy.candidates.length > 0 ? (
                <div className="space-y-3">
                  {vacancy.candidates.map((candidate) => (
                    <div key={candidate.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {candidate.firstName} {candidate.lastName}
                          </h4>
                          <p className="text-sm text-gray-600">{candidate.phone}</p>
                          {candidate.email && (
                            <p className="text-sm text-gray-600">{candidate.email}</p>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCandidateStatusColor(candidate.status)}`}>
                          {candidate.status === 'new' ? 'Новый' :
                           candidate.status === 'reviewed' ? 'Рассмотрен' :
                           candidate.status === 'interviewed' ? 'Собеседование' :
                           candidate.status === 'hired' ? 'Принят' :
                           candidate.status === 'rejected' ? 'Отклонен' : candidate.status}
                        </span>
                      </div>

                      {candidate.rating && (
                        <div className="flex items-center mb-2">
                          <Star className="w-4 h-4 text-yellow-400 mr-1" />
                          <span className="text-sm text-gray-600">{candidate.rating}/10</span>
                        </div>
                      )}

                      {candidate.expectedSalary && (
                        <div className="flex items-center mb-2">
                          <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-600">
                            {candidate.expectedSalary.toLocaleString()} сум
                          </span>
                        </div>
                      )}

                      {candidate.experience && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-1">Опыт:</p>
                          <p className="text-sm text-gray-700 line-clamp-3">{candidate.experience}</p>
                        </div>
                      )}

                      {candidate.notes && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-1">Заметки:</p>
                          <p className="text-sm text-gray-700">{candidate.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Пока нет кандидатов</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};