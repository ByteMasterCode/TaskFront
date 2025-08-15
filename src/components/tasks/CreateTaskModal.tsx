import React, { useState } from 'react';
import { X, CheckSquare, FileText, User, Calendar, Tag } from 'lucide-react';
import { WorkflowStage, Label } from '../../types';

interface CreateTaskModalProps {
  onClose: () => void;
  onSubmit: (data: {
    boardId: string;
    title: string;
    description?: string;
    assigneeId?: string;
    dueDate?: Date;
    parentId?: string;
    labelIds?: string[];
  }) => Promise<void>;
  labels: Label[];
  boardKey: string;
  boardId: string;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ 
  onClose, 
  onSubmit, 
  labels, 
  boardKey,
  boardId
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigneeId: '',
    dueDate: '',
    parentId: '',
    labelIds: [] as string[]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Название задачи обязательно');
      return;
    }

    if (formData.title.length > 200) {
      setError('Название задачи не может быть длиннее 200 символов');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSubmit({
        boardId,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        assigneeId: formData.assigneeId || undefined,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
        parentId: formData.parentId || undefined,
        labelIds: formData.labelIds.length > 0 ? formData.labelIds : undefined
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания задачи');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <CheckSquare className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Новая задача</h2>
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
          {/* Board Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Доска:</span> {boardKey}
            </p>
          </div>

          {/* Task Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Название задачи *
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <CheckSquare className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                placeholder="Введите название задачи"
                maxLength={200}
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formData.title.length}/200 символов
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
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 resize-none"
                placeholder="Подробное описание задачи"
                rows={4}
              />
            </div>
          </div>

          {/* Parent Task */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Родительская задача (ID)
            </label>
            <input
              type="text"
              value={formData.parentId}
              onChange={(e) => setFormData(prev => ({ ...prev, parentId: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
              placeholder="Оставьте пустым для основной задачи"
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Срок выполнения
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Labels */}
          {labels.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Метки
              </label>
              <div className="flex flex-wrap gap-2">
                {labels.map((label) => (
                  <button
                    key={label.id}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        labelIds: prev.labelIds.includes(label.id)
                          ? prev.labelIds.filter(id => id !== label.id)
                          : [...prev.labelIds, label.id]
                      }));
                    }}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                      formData.labelIds.includes(label.id)
                        ? 'ring-2 ring-offset-1'
                        : 'hover:scale-105'
                    }`}
                    style={{ 
                      backgroundColor: label.color + '20', 
                      color: label.color,
                      border: `1px solid ${label.color}40`,
                      ...(formData.labelIds.includes(label.id) && {
                        ringColor: label.color + '60'
                      })
                    }}
                  >
                    {label.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Assignee */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Исполнитель
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <User className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={formData.assigneeId}
                onChange={(e) => setFormData(prev => ({ ...prev, assigneeId: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                placeholder="ID пользователя (временно)"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Пока что введите ID пользователя вручную
            </p>
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
              disabled={loading || !formData.title.trim()}
              className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg transition-colors font-medium flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Создание...</span>
                </>
              ) : (
                <span>Создать задачу</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;