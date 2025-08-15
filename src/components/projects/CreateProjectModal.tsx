import React, { useState } from 'react';
import { X, FolderOpen, Key, FileText } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';

interface CreateProjectModalProps {
  onClose: () => void;
  onSubmit: (data: { name: string; description?: string; key: string }) => Promise<void>;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ onClose, onSubmit }) => {
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
      setError('Название проекта обязательно');
      return;
    }
    
    if (!formData.key.trim()) {
      setError('Ключ проекта обязателен');
      return;
    }

    if (formData.key.length > 64) {
      setError('Ключ проекта не может быть длиннее 64 символов');
      return;
    }

    if (formData.name.length > 200) {
      setError('Название проекта не может быть длиннее 200 символов');
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
      setError(err instanceof Error ? err.message : 'Ошибка создания проекта');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Новый проект">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <Input
          label="Название проекта *"
          value={formData.name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Введите название проекта"
          maxLength={200}
          icon={FolderOpen}
          required
        />
        <p className="text-xs text-gray-500 -mt-4">
          {formData.name.length}/200 символов
        </p>

        <Input
          label="Ключ проекта *"
          value={formData.key}
          onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value.toUpperCase() }))}
          placeholder="PROJ"
          maxLength={64}
          className="font-mono"
          icon={Key}
          required
        />
        <p className="text-xs text-gray-500 -mt-4">
          Уникальный код проекта (макс. 64 символа). {formData.key.length}/64
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Описание
          </label>
          <div className="relative">
            <div className="absolute left-3 top-3">
              <FileText className="h-4 w-4 text-gray-400" />
            </div>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
              placeholder="Краткое описание проекта"
              rows={3}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="flex items-center space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Отмена
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={!formData.name.trim() || !formData.key.trim()}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
          >
            Создать проект
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateProjectModal;