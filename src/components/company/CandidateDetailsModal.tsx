import React, { useState } from 'react';
import { X, User, Phone, Mail, Calendar, Star, DollarSign, FileText, MessageSquare, CheckCircle, XCircle, Clock, UserCheck } from 'lucide-react';
import { Candidate, Vacancy, CandidateStatus } from '../../types';

interface CandidateDetailsModalProps {
  candidate: Candidate;
  vacancy: Vacancy;
  onClose: () => void;
  onUpdateStatus: (candidateId: string, status: CandidateStatus, notes?: string) => Promise<void>;
  onRate: (candidateId: string, rating: number, notes?: string) => Promise<void>;
}

const CandidateDetailsModal: React.FC<CandidateDetailsModalProps> = ({
  candidate,
  vacancy,
  onClose,
  onUpdateStatus,
  onRate
}) => {
  const [rating, setRating] = useState(candidate.rating || 0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleStatusUpdate = async (newStatus: CandidateStatus) => {
    try {
      setLoading(true);
      await onUpdateStatus(candidate.id, newStatus, notes || undefined);
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRating = async () => {
    if (rating === 0) return;
    
    try {
      setLoading(true);
      await onRate(candidate.id, rating, notes || undefined);
    } catch (err) {
      console.error('Error rating candidate:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {candidate.firstName} {candidate.lastName}
              </h2>
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status & Rating */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span>Статус кандидата</span>
              </h3>
              
              <div className="space-y-3">
                <span className={`inline-flex px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(candidate.status)}`}>
                  {getStatusLabel(candidate.status)}
                </span>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Изменить статус:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleStatusUpdate('contacted')}
                      disabled={loading}
                      className="px-3 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg text-sm font-medium transition-colors"
                    >
                      Связались
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('interview_scheduled')}
                      disabled={loading}
                      className="px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg text-sm font-medium transition-colors"
                    >
                      Назначить собеседование
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('interviewed')}
                      disabled={loading}
                      className="px-3 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded-lg text-sm font-medium transition-colors"
                    >
                      Прошел собеседование
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('hired')}
                      disabled={loading}
                      className="px-3 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg text-sm font-medium transition-colors"
                    >
                      Нанять
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-600" />
                <span>Оценка кандидата</span>
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Рейтинг (1-10):</label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <button
                        key={num}
                        onClick={() => setRating(num)}
                        className={`w-8 h-8 rounded-full text-sm font-bold transition-all ${
                          rating >= num 
                            ? 'bg-yellow-500 text-white shadow-md' 
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Текущий рейтинг: {candidate.rating || 'Не оценен'}</p>
                </div>
                
                <button
                  onClick={handleRating}
                  disabled={loading || rating === 0}
                  className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-300 text-white rounded-lg transition-colors font-medium"
                >
                  Сохранить оценку
                </button>
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <span>Личная информация</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Полное имя</label>
                <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                  {candidate.lastName} {candidate.firstName} {candidate.middleName || ''}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Дата рождения</label>
                <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                  {formatDate(candidate.birthDate)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                <p className="text-sm text-gray-900 font-mono bg-white px-3 py-2 rounded border">
                  {candidate.phone}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                  {candidate.email || '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Professional Info */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Star className="h-5 w-5 text-purple-600" />
              <span>Профессиональная информация</span>
            </h3>
            
            <div className="space-y-4">
              {candidate.expectedSalary && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ожидаемая зарплата</label>
                  <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                    {candidate.expectedSalary.toLocaleString()} ₽
                  </p>
                </div>
              )}

              {candidate.experience && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Опыт работы</label>
                  <div className="text-sm text-gray-900 bg-white px-3 py-2 rounded border whitespace-pre-wrap">
                    {candidate.experience}
                  </div>
                </div>
              )}

              {candidate.education && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Образование</label>
                  <div className="text-sm text-gray-900 bg-white px-3 py-2 rounded border whitespace-pre-wrap">
                    {candidate.education}
                  </div>
                </div>
              )}

              {candidate.resume && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Резюме / Портфолио</label>
                  <div className="text-sm text-gray-900 bg-white px-3 py-2 rounded border whitespace-pre-wrap">
                    {candidate.resume}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes & Comments */}
          <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-gray-600" />
              <span>Заметки и комментарии</span>
            </h3>
            
            <div className="space-y-4">
              {candidate.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Существующие заметки</label>
                  <div className="text-sm text-gray-900 bg-white px-3 py-2 rounded border whitespace-pre-wrap">
                    {candidate.notes}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Добавить комментарий</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 resize-none"
                  placeholder="Комментарий к изменению статуса или оценке"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <UserCheck className="h-5 w-5 text-emerald-600" />
              <span>Быстрые действия</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleStatusUpdate('rejected')}
                disabled={loading}
                className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <XCircle className="h-4 w-4" />
                <span>Отклонить</span>
              </button>
              <button
                onClick={() => handleStatusUpdate('hired')}
                disabled={loading}
                className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Нанять</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailsModal;