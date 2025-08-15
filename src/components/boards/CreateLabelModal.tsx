import React, { useState } from 'react';
import { X, Tag } from 'lucide-react';

interface CreateLabelModalProps {
  onClose: () => void;
  onSubmit: (data: { name: string; color?: string }) => Promise<void>;
  boardName: string;
}

const CreateLabelModal: React.FC<CreateLabelModalProps> = ({ onClose, onSubmit, boardName }) => {
  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const predefinedColors = [
    '#3B82F6', // blue
    '#10B981', // emerald
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // violet
    '#06B6D4', // cyan
    '#84CC16', // lime
    '#F97316', // orange
    '#EC4899', // pink
    '#6B7280'  // gray
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Название метки обязательно');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSubmit({
        name: formData.name.trim(),
        color: formData.color
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания метки');
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
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Tag className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Новая метка</h2>
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
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-700">
              <span className="font-medium">Доска:</span> {boardName}
            </p>
          </div>

          {/* Label Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Название метки *
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Tag className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                placeholder="Введите название метки"
                required
              />
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Цвет метки
            </label>
            <div className="grid grid-cols-5 gap-3">
              {predefinedColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  className={`w-12 h-12 rounded-lg transition-all hover:scale-110 ${
                    formData.color === color ? 'ring-4 ring-offset-2 ring-gray-300' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            
            {/* Custom Color Input */}
            <div className="mt-4">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                className="w-full h-12 rounded-lg border border-gray-200 cursor-pointer"
              />
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Предварительный просмотр
            </label>
            <div className="p-4 bg-gray-50 rounded-lg">
              <span
                className="px-3 py-2 rounded-full text-sm font-medium"
                style={{ 
                  backgroundColor: formData.color + '20', 
                  color: formData.color,
                  border: `1px solid ${formData.color}40`
                }}
              >
                {formData.name || 'Название метки'}
              </span>
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
              disabled={loading || !formData.name.trim()}
              className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-lg transition-colors font-medium flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Создание...</span>
                </>
              ) : (
                <span>Создать метку</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLabelModal;