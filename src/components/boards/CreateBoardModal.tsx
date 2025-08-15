import React, { useState } from 'react';
import { X, Target, Key, FileText } from 'lucide-react';

interface CreateBoardModalProps {
  onClose: () => void;
  onSubmit: (data: { name: string; description?: string; key: string }) => Promise<void>;
  projectKey: string;
}

const CreateBoardModal: React.FC<CreateBoardModalProps> = ({ onClose, onSubmit, projectKey }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    key: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateKey = (name: string) => {
    return name
      .toUpperCase()
      .replace(/[^A-ZА-Я0-9\s]/g, '')
      .replace(/\s+/g, '')
      .slice(0, 10);
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      key: prev.key || generateKey(name)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Название доски обязательно');
      return;
    }
    
    if (!formData.key.trim()) {
      setError('Ключ доски обязателен');
      return;
    }

    if (formData.key.length > 64) {
      setError('Ключ доски не может быть длиннее 64 символов');
      return;
    }

    if (formData.name.length > 200) {
      setError('Название доски не может быть длиннее 200 символов');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        key: formData.key.trim()
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания доски');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Target className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Новая доска</h2>
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
          {/* Project Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Проект:</span> {projectKey}
            </p>
          </div>

          {/* Board Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Название доски *
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Target className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Введите название доски"
                maxLength={200}
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formData.name.length}/200 символов
            </p>
          </div>

          {/* Board Key */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Ключ доски *
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Key className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={formData.key}
                onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value.toUpperCase() }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-mono"
                placeholder="BOARD"
                maxLength={64}
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Уникальный код доски внутри проекта (макс. 64 символа). {formData.key.length}/64
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
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                placeholder="Краткое описание доски"
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
              disabled={loading || !formData.name.trim() || !formData.key.trim()}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition-colors font-medium flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Создание...</span>
                </>
              ) : (
                <span>Создать доску</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBoardModal;