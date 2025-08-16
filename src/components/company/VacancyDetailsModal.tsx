import React, { useState } from 'react';
import { X, Briefcase, Users, Plus, Eye, Edit, Trash2, UserPlus, Calendar, DollarSign, Building2 } from 'lucide-react';
import { Vacancy, Candidate, CandidateStatus } from '../../types';
import CreateCandidateModal from './CreateCandidateModal';
import CandidateDetailsModal from './CandidateDetailsModal';

interface VacancyDetailsModalProps {
  vacancy: Vacancy;
  onClose: () => void;
  onCreateCandidate: (data: any) => Promise<void>;
  onUpdateCandidateStatus: (candidateId: string, status: CandidateStatus, notes?: string) => Promise<void>;
  onRateCandidate: (candidateId: string, rating: number, notes?: string) => Promise<void>;
}

const VacancyDetailsModal: React.FC<VacancyDetailsModalProps> = ({
  vacancy,
  onClose,
  onCreateCandidate,
  onUpdateCandidateStatus,
  onRateCandidate
}) => {
  const [showCreateCandidateModal, setShowCreateCandidateModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Не указано';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: CandidateStatus) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'contacted': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'interview_scheduled': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'interviewed': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'hired': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'withdrawn': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: CandidateStatus) => {
    switch (status) {
      case 'new': return 'Новый';
      case 'contacted': return 'Связались';
      case 'interview_scheduled': return 'Собеседование назначено';
      case 'interviewed': return 'Прошел собеседование';
      case 'hired': return 'Нанят';
      case 'rejected': return 'Отклонен';
      case 'withdrawn': return 'Отозвал заявку';
      default: return status;
    }
  };

  const getVacancyStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getVacancyStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Открыта';
      case 'in_progress': return 'В процессе';
      case 'closed': return 'Закрыта';
      case 'cancelled': return 'Отменена';
      default: return status;
    }
  };

  const candidates = vacancy.candidates || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{vacancy.title}</h2>
              <p className="text-sm text-gray-600">{vacancy.position}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowCreateCandidateModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Добавить кандидата</span>
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
          {/* Vacancy Info */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Briefcase className="h-5 w-5 text-emerald-600" />
              <span>Информация о вакансии</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Отдел</label>
                  <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                    {vacancy.department?.name || 'Не указан'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Количество мест</label>
                  <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                    {vacancy.quantity}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
                  <span className={`inline-flex px-3 py-2 rounded-full text-sm font-medium border ${getVacancyStatusColor(vacancy.status)}`}>
                    {getVacancyStatusLabel(vacancy.status)}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Дата открытия</label>
                  <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                    {formatDate(vacancy.openDate)}
                  </p>
                </div>
                {vacancy.closeDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Дата закрытия</label>
                    <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                      {formatDate(vacancy.closeDate)}
                    </p>
                  </div>
                )}
                {(vacancy.salaryFrom || vacancy.salaryTo) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Зарплата</label>
                    <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                      {vacancy.salaryFrom && vacancy.salaryTo 
                        ? `${vacancy.salaryFrom.toLocaleString()} - ${vacancy.salaryTo.toLocaleString()} ₽`
                        : vacancy.salaryFrom 
                          ? `от ${vacancy.salaryFrom.toLocaleString()} ₽`
                          : `до ${vacancy.salaryTo?.toLocaleString()} ₽`
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
              <div className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                {vacancy.description}
              </div>
            </div>
          </div>

          {/* Candidates */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span>Кандидаты ({candidates.length})</span>
              </h3>
              <button
                onClick={() => setShowCreateCandidateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors text-sm"
              >
                <UserPlus className="h-4 w-4" />
                <span>Добавить</span>
              </button>
            </div>

            {candidates.length > 0 ? (
              <div className="space-y-3">
                {candidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {candidate.firstName} {candidate.lastName}
                          </h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span>{candidate.phone}</span>
                            {candidate.email && (
                              <>
                                <span>•</span>
                                <span>{candidate.email}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {candidate.rating && (
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-medium text-gray-900">{candidate.rating}/10</span>
                          </div>
                        )}
                        
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(candidate.status)}`}>
                          {getStatusLabel(candidate.status)}
                        </span>
                        
                        <button
                          onClick={() => setSelectedCandidate(candidate)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {candidate.expectedSalary && (
                      <div className="mt-2 flex items-center space-x-2 text-sm text-gray-600">
                        <DollarSign className="h-4 w-4" />
                        <span>Ожидаемая зарплата: {candidate.expectedSalary.toLocaleString()} ₽</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h4 className="font-medium text-gray-900 mb-1">Нет кандидатов</h4>
                <p className="text-sm text-gray-600 mb-4">Добавьте первого кандидата на эту вакансию</p>
                <button
                  onClick={() => setShowCreateCandidateModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Добавить кандидата
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Create Candidate Modal */}
        {showCreateCandidateModal && (
          <CreateCandidateModal
            vacancy={vacancy}
            onClose={() => setShowCreateCandidateModal(false)}
            onSubmit={async (data) => {
              await onCreateCandidate(data);
              setShowCreateCandidateModal(false);
            }}
          />
        )}

        {/* Candidate Details Modal */}
        {selectedCandidate && (
          <CandidateDetailsModal
            candidate={selectedCandidate}
            vacancy={vacancy}
            onClose={() => setSelectedCandidate(null)}
            onUpdateStatus={async (candidateId, status, notes) => {
              await onUpdateCandidateStatus(candidateId, status, notes);
              setSelectedCandidate(null);
            }}
            onRate={async (candidateId, rating, notes) => {
              await onRateCandidate(candidateId, rating, notes);
              setSelectedCandidate(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default VacancyDetailsModal;