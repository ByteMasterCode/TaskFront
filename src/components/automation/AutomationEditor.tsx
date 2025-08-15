// src/components/automation/AutomationEditor.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { X, Plus, Zap, ArrowRight, Settings, Link as LinkIcon, GitBranch } from 'lucide-react';
import { AutomationConfig, AutomationAction, WorkflowStage, Board } from '../../types';
import { apiService } from '../../services/api';

interface AutomationEditorProps {
  /** текущая стадия (для заголовка; id/key/name) */
  stage: WorkflowStage;
  /** проект, чтобы загрузить список досок */
  projectId: string;
  onClose: () => void;
  onSave: (automation: AutomationConfig) => Promise<void>;
}

const AutomationEditor: React.FC<AutomationEditorProps> = ({ stage, projectId, onClose, onSave }) => {
  const [automation, setAutomation] = useState<AutomationConfig>(stage.automation || { actions: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [boards, setBoards] = useState<Board[]>([]);
  const [stagesByBoard, setStagesByBoard] = useState<Record<string, WorkflowStage[]>>({});
  const [stagesLoading, setStagesLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      try {
        const bs = await apiService.getProjectBoards(projectId);
        setBoards(bs);
      } catch (e: any) {
        setError(e?.message || 'Не удалось загрузить доски проекта');
      }
    })();
  }, [projectId]);

  const addAction = (type: AutomationAction['type']) => {
    const base: AutomationAction =
        type === 'createLinkedTask'
            ? {
              type: 'createLinkedTask',
              targetBoardKey: '',             // выберем из списка
              targetStageKey: 'todo',         // потом подменим из списка стадий
              linkType: 'DEPENDS_ON',
              titleTpl: 'Linked: ${title}',
              descriptionTpl: 'Origin: ${id}\n\n${description}',
              inheritAssignee: false,
              autoCreateBoardIfMissing: true,
              seedStages: [
                { key: 'todo', name: 'To Do', order: 1 },
                { key: 'doing', name: 'In Progress', order: 2 },
                { key: 'done', name: 'Done', order: 3 },
              ],
              mirrorBack: {
                onStageKey: 'done',
                moveOriginToStageKey: '',
                postCommentTpl: 'Linked task done: ${title}\n\n${description}',
                copyFields: [],
                autoDeploy: false,
              },
            }
            : {
              type: 'moveParentWhenAllChildrenDone',
              childBoardKey: '',
              parentMoveToStageKey: '',
              autoDeploy: false,
            };

    setAutomation((prev) => ({ ...prev, actions: [...prev.actions, base] }));
  };

  const updateAction = (index: number, updates: Partial<AutomationAction>) => {
    setAutomation((prev) => ({
      ...prev,
      actions: prev.actions.map((action, i) => (i === index ? { ...action, ...updates } as AutomationAction : action)),
    }));
  };

  const updateActionDeep = (index: number, producer: (a: AutomationAction) => AutomationAction) => {
    setAutomation((prev) => ({
      ...prev,
      actions: prev.actions.map((action, i) => (i === index ? producer(action) : action)),
    }));
  };

  const removeAction = (index: number) => {
    setAutomation((prev) => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index),
    }));
  };

  const ensureBoardStagesLoaded = async (boardKey: string) => {
    const b = boards.find((bb) => bb.key === boardKey);
    if (!b) return;
    if (stagesByBoard[b.id]?.length) return;
    setStagesLoading((s) => ({ ...s, [b.id]: true }));
    try {
      const ss = await apiService.getBoardStages(b.id);
      setStagesByBoard((m) => ({ ...m, [b.id]: ss }));
    } catch (e: any) {
      setError(e?.message || `Не удалось загрузить стадии доски ${b.name}`);
    } finally {
      setStagesLoading((s) => ({ ...s, [b.id]: false }));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      await onSave(automation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения автоматизации');
    } finally {
      setLoading(false);
    }
  };

  const boardOptions = useMemo(
      () => boards.map((b) => ({ value: b.key, label: `${b.name} (${b.key})`, id: b.id })),
      [boards]
  );

  const getBoardStages = (boardKey?: string) => {
    if (!boardKey) return [];
    const b = boards.find((bb) => bb.key === boardKey);
    if (!b) return [];
    return stagesByBoard[b.id] || [];
  };

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Автоматизация стадии</h2>
                <p className="text-sm text-gray-600">
                  {stage.name} ({stage.key})
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Add Action */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Plus className="h-5 w-5 text-purple-600" />
                  <span>Добавить действие</span>
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                      onClick={() => addAction('createLinkedTask')}
                      className="p-4 bg-white rounded-lg border border-purple-200 hover:border-purple-300 transition-colors text-left group"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <LinkIcon className="h-5 w-5 text-purple-600" />
                      <span className="font-medium text-gray-900">Создать связанную задачу</span>
                    </div>
                    <p className="text-sm text-gray-600">Автоматически создаёт задачу на другой доске</p>
                  </button>
                  <button
                      onClick={() => addAction('moveParentWhenAllChildrenDone')}
                      className="p-4 bg-white rounded-lg border border-purple-200 hover:border-purple-300 transition-colors text-left group"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <GitBranch className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-gray-900">Переместить родителя</span>
                    </div>
                    <p className="text-sm text-gray-600">Когда все дочерние задачи завершены</p>
                  </button>
                </div>
              </div>

              {/* Actions List */}
              {automation.actions.map((action, index) => (
                  <div key={index} className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {action.type === 'createLinkedTask' ? (
                              <LinkIcon className="h-5 w-5 text-blue-600" />
                          ) : (
                              <GitBranch className="h-5 w-5 text-green-600" />
                          )}
                          <h4 className="font-semibold text-gray-900">
                            {action.type === 'createLinkedTask' ? 'Создать связанную задачу' : 'Переместить родителя'}
                          </h4>
                        </div>
                        <button onClick={() => removeAction(index)} className="text-red-500 hover:text-red-700 p-1">
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {/* createLinkedTask */}
                      {action.type === 'createLinkedTask' && (
                          <div className="space-y-4">
                            {/* target board + stage */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Целевая доска (внутри проекта)
                                </label>
                                <select
                                    value={action.targetBoardKey || ''}
                                    onChange={async (e) => {
                                      const newKey = e.target.value;
                                      updateAction(index, { targetBoardKey: newKey });
                                      if (newKey) await ensureBoardStagesLoaded(newKey);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  <option value="">— Выберите доску —</option>
                                  {boardOptions.map((op) => (
                                      <option key={op.value} value={op.value}>
                                        {op.label}
                                      </option>
                                  ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                  Можно выбрать существующую доску (например, <b>TES</b>).
                                </p>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Целевая стадия</label>
                                {(() => {
                                  const ss = getBoardStages(action.targetBoardKey);
                                  const b = boards.find((bb) => bb.key === action.targetBoardKey);
                                  const isLoading = b ? stagesLoading[b.id] : false;

                                  if (action.targetBoardKey && !ss.length && isLoading) {
                                    return <div className="text-sm text-gray-500">Загрузка стадий...</div>;
                                  }

                                  if (action.targetBoardKey && ss.length > 0) {
                                    return (
                                        <select
                                            value={action.targetStageKey || ''}
                                            onChange={(e) => updateAction(index, { targetStageKey: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                          <option value="">— Выберите стадию —</option>
                                          {ss.map((s) => (
                                              <option key={s.id} value={s.key}>
                                                {s.name} ({s.key})
                                              </option>
                                          ))}
                                        </select>
                                    );
                                  }

                                  return (
                                      <input
                                          type="text"
                                          value={action.targetStageKey || ''}
                                          onChange={(e) => updateAction(index, { targetStageKey: e.target.value })}
                                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                          placeholder="todo, doing, done..."
                                      />
                                  );
                                })()}
                                <p className="text-xs text-gray-500 mt-1">
                                  Если доска выбрана, можно выбрать стадию из списка. Иначе — ввести ключ вручную.
                                </p>
                              </div>
                            </div>

                            {/* link type & inherit */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Тип связи</label>
                                <select
                                    value={action.linkType || 'DEPENDS_ON'}
                                    onChange={(e) => updateAction(index, { linkType: e.target.value as any })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  <option value="DEPENDS_ON">Зависит от</option>
                                  <option value="CHILD">Дочерняя</option>
                                  <option value="RELATED">Связанная</option>
                                  <option value="BLOCKS">Блокирует</option>
                                </select>
                              </div>

                              <div className="flex items-center space-x-4 pt-6">
                                <label className="flex items-center space-x-2">
                                  <input
                                      type="checkbox"
                                      checked={!!action.inheritAssignee}
                                      onChange={(e) => updateAction(index, { inheritAssignee: e.target.checked })}
                                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-sm text-gray-700">Наследовать исполнителя</span>
                                </label>
                              </div>
                            </div>

                            {/* templates */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Шаблон заголовка</label>
                              <input
                                  type="text"
                                  value={action.titleTpl || ''}
                                  onChange={(e) => updateAction(index, { titleTpl: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                                  placeholder="QA: ${title}"
                              />
                              <p className="text-xs text-gray-500 mt-1">Переменные: ${`{id}`}, ${`{title}`}, ${`{description}`}</p>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Шаблон описания</label>
                              <textarea
                                  value={action.descriptionTpl || ''}
                                  onChange={(e) => updateAction(index, { descriptionTpl: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                                  rows={3}
                                  placeholder={'Origin: ${id}\nТребования: ...\n${description}'}
                              />
                            </div>

                            {/* mirrorBack */}
                            <div className="bg-gray-50 rounded-lg p-4">
                              <h5 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                                <ArrowRight className="h-4 w-4 text-gray-600" />
                                <span>Зеркалирование обратно</span>
                              </h5>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Когда linked-задача на стадии</label>
                                  <input
                                      type="text"
                                      value={action.mirrorBack?.onStageKey || ''}
                                      onChange={(e) =>
                                          updateActionDeep(index, (a) => ({
                                            ...a,
                                            mirrorBack: { ...(a.mirrorBack || {}), onStageKey: e.target.value },
                                          }))
                                      }
                                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      placeholder="done"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Переместить исходную в</label>
                                  <input
                                      type="text"
                                      value={action.mirrorBack?.moveOriginToStageKey || ''}
                                      onChange={(e) =>
                                          updateActionDeep(index, (a) => ({
                                            ...a,
                                            mirrorBack: { ...(a.mirrorBack || {}), moveOriginToStageKey: e.target.value },
                                          }))
                                      }
                                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      placeholder="READY_FOR_RELEASE"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4 mt-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Копировать поля</label>
                                  <div className="flex items-center gap-4 text-sm text-gray-700">
                                    {['description', 'assigneeId', 'dueDate'].map((f) => {
                                      const checked = action.mirrorBack?.copyFields?.includes(f as any) || false;
                                      return (
                                          <label key={f} className="flex items-center gap-1">
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={(e) =>
                                                    updateActionDeep(index, (a) => {
                                                      const current = a.mirrorBack?.copyFields || [];
                                                      const next = e.target.checked
                                                          ? Array.from(new Set([...current, f as any]))
                                                          : current.filter((x) => x !== (f as any));
                                                      return { ...a, mirrorBack: { ...(a.mirrorBack || {}), copyFields: next } };
                                                    })
                                                }
                                            />
                                            {f}
                                          </label>
                                      );
                                    })}
                                  </div>
                                </div>
                                <div className="flex items-end">
                                  <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={!!action.mirrorBack?.autoDeploy}
                                        onChange={(e) =>
                                            updateActionDeep(index, (a) => ({
                                              ...a,
                                              mirrorBack: { ...(a.mirrorBack || {}), autoDeploy: e.target.checked },
                                            }))
                                        }
                                    />
                                    <span className="text-sm text-gray-700">Триггерить деплой</span>
                                  </label>
                                </div>
                              </div>

                              <div className="mt-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Шаблон комментария</label>
                                <textarea
                                    value={action.mirrorBack?.postCommentTpl || ''}
                                    onChange={(e) =>
                                        updateActionDeep(index, (a) => ({
                                          ...a,
                                          mirrorBack: { ...(a.mirrorBack || {}), postCommentTpl: e.target.value },
                                        }))
                                    }
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                                    rows={2}
                                    placeholder={'QA done:\n${description}'}
                                />
                              </div>
                            </div>
                          </div>
                      )}

                      {/* moveParentWhenAllChildrenDone */}
                      {action.type === 'moveParentWhenAllChildrenDone' && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Доска с дочерними задачами (optional)
                                </label>
                                <input
                                    type="text"
                                    value={action.childBoardKey || ''}
                                    onChange={(e) => updateAction(index, { childBoardKey: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="TES, QA..."
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Переместить родителя в</label>
                                <input
                                    type="text"
                                    value={action.parentMoveToStageKey || ''}
                                    onChange={(e) => updateAction(index, { parentMoveToStageKey: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="READY, DONE..."
                                />
                              </div>
                            </div>
                            <div>
                              <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={!!action.autoDeploy}
                                    onChange={(e) => updateAction(index, { autoDeploy: e.target.checked })}
                                />
                                <span className="text-sm text-gray-700">Триггерить деплой</span>
                              </label>
                            </div>
                          </div>
                      )}
                    </div>
                  </div>
              ))}

              {automation.actions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Zap className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Нет настроенных автоматизаций</p>
                    <p className="text-sm">Добавьте действие выше</p>
                  </div>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
              <div className="mx-6 mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <div className="text-sm text-gray-500">{automation.actions.length} действий настроено</div>
            <div className="flex items-center space-x-3">
              <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Отмена
              </button>
              <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-lg transition-colors font-medium flex items-center space-x-2"
              >
                {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Сохранение...</span>
                    </>
                ) : (
                    <>
                      <Settings className="h-4 w-4" />
                      <span>Сохранить автоматизацию</span>
                    </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
  );
};

export default AutomationEditor;
