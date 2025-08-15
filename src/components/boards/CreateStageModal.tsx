// src/components/boards/CreateStageModal.tsx
import React, { useState } from 'react';
import { X, Target, Key, Building, Shield, Zap } from 'lucide-react';
import { AutomationConfig, Project } from '../../types';
import AutomationEditor from '../automation/AutomationEditor';

interface CreateStageModalProps {
  onClose: () => void;
  onSubmit: (stages: { key: string; name: string; order: number; department?: string; requiresApproval?: boolean; automation?: AutomationConfig }[]) => Promise<void>;
  boardName: string;
  existingStages: { key: string; name: string; order: number; department?: string; requiresApproval?: boolean; automation?: AutomationConfig }[];
  /** добавил проект, чтобы AutomationEditor мог загрузить список досок */
  project: Project;
}

const CreateStageModal: React.FC<CreateStageModalProps> = ({
                                                             onClose,
                                                             onSubmit,
                                                             boardName,
                                                             existingStages,
                                                             project
                                                           }) => {
  const [stages, setStages] = useState(existingStages.length > 0 ? existingStages : [
    { key: 'TODO', name: 'К выполнению', order: 1 },
    { key: 'IN_PROGRESS', name: 'В процессе', order: 2 },
    { key: 'REVIEW', name: 'На проверке', order: 3 },
    { key: 'DONE', name: 'Завершено', order: 4 }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingAutomationIndex, setEditingAutomationIndex] = useState<number | null>(null);

  const addStage = () => {
    const newOrder = Math.max(...stages.map(s => s.order), 0) + 1;
    setStages(prev => [...prev, { key: '', name: '', order: newOrder }]);
  };

  const removeStage = (index: number) => {
    setStages(prev => prev.filter((_, i) => i !== index));
  };

  const updateStage = (index: number, field: string, value: any) => {
    setStages(prev => prev.map((stage, i) => (i === index ? { ...stage, [field]: value } : stage)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      if (!stage.key.trim()) {
        setError(`Ключ этапа ${i + 1} обязателен`);
        return;
      }
      if (!stage.name.trim()) {
        setError(`Название этапа ${i + 1} обязательно`);
        return;
      }
    }

    const keys = stages.map(s => s.key.trim().toUpperCase());
    const uniqueKeys = new Set(keys);
    if (keys.length !== uniqueKeys.size) {
      setError('Ключи этапов должны быть уникальными');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const processed = stages.map(s => ({
        key: s.key.trim().toUpperCase(),
        name: s.name.trim(),
        order: s.order,
        department: s.department?.trim() || undefined,
        requiresApproval: !!s.requiresApproval,
        automation: s.automation
      }));
      await onSubmit(processed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания этапов');
    } finally {
      setLoading(false);
    }
  };

  const handleAutomationSave = async (automation: AutomationConfig) => {
    if (editingAutomationIndex !== null) {
      updateStage(editingAutomationIndex, 'automation', automation);
      setEditingAutomationIndex(null);
    }
  };

  if (editingAutomationIndex !== null) {
    const s = stages[editingAutomationIndex];
    // временный объект стадии для заголовка редактора
    const tmpStage: any = {
      id: `temp-${editingAutomationIndex}`,
      projectId: project.id,
      boardId: '', // не важно для редактора
      key: s.key || '(new)',
      name: s.name || '(без названия)',
      order: s.order,
      automation: s.automation || { actions: [] },
    };
    return (
        <AutomationEditor
            stage={tmpStage}
            projectId={project.id}
            onClose={() => setEditingAutomationIndex(null)}
            onSave={handleAutomationSave}
        />
    );
  }

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Target className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Настройка этапов</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-96">
                {/* Board Info */}
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <p className="text-sm text-indigo-700">
                    <span className="font-medium">Доска:</span> {boardName}
                  </p>
                  <p className="text-xs text-indigo-600">Проект: {project.name} ({project.key})</p>
                </div>

                {/* Stages */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-semibold text-gray-800">Этапы рабочего процесса</label>
                    <button
                        type="button"
                        onClick={addStage}
                        className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                    >
                      + Добавить этап
                    </button>
                  </div>

                  <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                    {stages.map((s, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-700">Этап {index + 1}</span>
                            {stages.length > 1 && (
                                <button type="button" onClick={() => removeStage(index)} className="text-red-500 hover:text-red-700 text-sm">
                                  Удалить
                                </button>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Ключ *</label>
                              <div className="relative">
                                <Key className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                                <input
                                    type="text"
                                    value={s.key}
                                    onChange={(e) => updateStage(index, 'key', e.target.value.toUpperCase())}
                                    className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                                    placeholder="TODO"
                                    required
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Название *</label>
                              <input
                                  type="text"
                                  value={s.name}
                                  onChange={(e) => updateStage(index, 'name', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                  placeholder="К выполнению"
                                  required
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Порядок</label>
                              <input
                                  type="number"
                                  value={s.order}
                                  onChange={(e) => updateStage(index, 'order', parseInt(e.target.value || '0', 10))}
                                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                  min={1}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Отдел</label>
                              <div className="relative">
                                <Building className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                                <input
                                    type="text"
                                    value={s.department || ''}
                                    onChange={(e) => updateStage(index, 'department', e.target.value)}
                                    className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Разработка / QA / DevOps"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="mt-3">
                            <label className="flex items-center space-x-2">
                              <input
                                  type="checkbox"
                                  checked={!!s.requiresApproval}
                                  onChange={(e) => updateStage(index, 'requiresApproval', e.target.checked)}
                                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <div className="flex items-center space-x-1">
                                <Shield className="h-3 w-3 text-gray-500" />
                                <span className="text-xs text-gray-600">Требует подтверждения</span>
                              </div>
                            </label>
                          </div>

                          {/* Automation */}
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Zap className="h-3 w-3 text-purple-500" />
                                <span className="text-xs text-gray-600">
                              Автоматизация: {s.automation?.actions?.length || 0} действий
                            </span>
                              </div>
                              <button
                                  type="button"
                                  onClick={() => setEditingAutomationIndex(index)}
                                  className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 px-2 py-1 rounded transition-colors"
                              >
                                Настроить
                              </button>
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3 p-6 border-t border-gray-200 flex-shrink-0">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Отмена
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white rounded-lg transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Сохранение...</span>
                      </>
                  ) : (
                      <span>Сохранить этапы</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
  );
};

export default CreateStageModal;
