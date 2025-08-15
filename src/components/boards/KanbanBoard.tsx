// src/components/boards/KanbanBoard.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import {
  ArrowLeft,
  Plus,
  MoreHorizontal,
  Settings,
  Users,
  Filter,
  Search,
  Grid3X3,
  Zap,
  Link as LinkIcon,
  Clock,
  X,
  Send
} from 'lucide-react';
import { Board, Project, Task, WorkflowStage, Label, AutomationConfig, TaskLink } from '../../types';
import { apiService } from '../../services/api';
import CreateTaskModal from '../tasks/CreateTaskModal';
import TaskCard from '../tasks/TaskCard';
import CreateStageModal from './CreateStageModal';
import AutomationEditor from '../automation/AutomationEditor';
import TaskLinksView from '../tasks/TaskLinksView';
import TaskTimelineView from '../tasks/TaskTimelineView';
import MirrorBackModal from '../tasks/MirrorBackModal';

interface KanbanBoardProps {
  board: Board;
  project: Project;
  onBack: () => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ board, project, onBack }) => {
  const [stages, setStages] = useState<WorkflowStage[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLabels, setFilterLabels] = useState<string[]>([]);
  const [showCreateStageModal, setShowCreateStageModal] = useState(false);
  const [editingStageAutomation, setEditingStageAutomation] = useState<WorkflowStage | null>(null);

  // Детали задачи
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState<Task | null>(null);
  const [selectedTaskLinks, setSelectedTaskLinks] = useState<TaskLink[] | null>(null);
  const [selectedTaskLinksLoading, setSelectedTaskLinksLoading] = useState(false);

  // Mirror-back UI
  const [showMirrorBackModal, setShowMirrorBackModal] = useState(false);
  const [mirrorBackOriginCtx, setMirrorBackOriginCtx] = useState<{
    originTaskId: string;
    originBoardId: string;
  } | null>(null);

  useEffect(() => {
    loadBoardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board.id]);

  const loadBoardData = async () => {
    try {
      setLoading(true);
      const [, tasksResponse, stagesData, labelsData] = await Promise.all([
        apiService.getBoard(board.id),
        apiService.getBoardTasks(board.id, { limit: 1000 }),
        apiService.getBoardStages(board.id),
        apiService.getBoardLabels(board.id)
      ]);
      setStages(stagesData);
      setTasks(tasksResponse.items);
      setLabels(labelsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных доски');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (data: {
    boardId: string;
    title: string;
    description?: string;
    assigneeId?: string;
    dueDate?: Date;
    parentId?: string;
    labelIds?: string[];
  }) => {
    try {
      const newTask = await apiService.createTask(data);
      setTasks(prev => [newTask, ...prev]);
      setShowCreateTaskModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания задачи');
    }
  };

  const handleMoveTask = async (taskId: string, newStageId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const prev = { ...task };
    setTasks(prevTasks => prevTasks.map(t => (t.id === taskId ? { ...t, stageId: newStageId } : t)));

    try {
      await apiService.moveTask(taskId, { toStageId: newStageId, comment: 'Moved via Kanban board' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка перемещения задачи');
      setTasks(prevTasks => prevTasks.map(t => (t.id === taskId ? prev : t)));
    }
  };

// KanbanBoard.tsx
const handleCreateStages = async (stagesData: {
  key: string; name: string; order: number; department?: string; requiresApproval?: boolean; automation?: AutomationConfig;
}[]) => {
  try {
    setLoading(true); // чтобы показать спиннер на время пересоздания пайплайна
    setError('');
    await apiService.setStagesWithAutomation(board.id, project.id, stagesData);

    // 🔥 КРИТИЧНО: тянем заново задачи и стадии, иначе tasks держат старые stageId
    await loadBoardData();

    setShowCreateStageModal(false);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Ошибка сохранения стадий');
  } finally {
    setLoading(false);
  }
};


  const handleApproveTask = async (taskId: string) => {
    try {
      await apiService.approveTask(taskId, { comment: 'Approved via Kanban board' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка подтверждения задачи');
    }
  };

  const handleAutomationSave = async (automation: AutomationConfig) => {
    if (!editingStageAutomation) return;
    try {
      const updatedStage = await apiService.updateStageAutomation(board.id, editingStageAutomation.id, automation);
      setStages(prev => prev.map(s => (s.id === updatedStage.id ? updatedStage : s)));
      setEditingStageAutomation(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения автоматизации');
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;

    // 1) двигаем задачу
    await handleMoveTask(draggableId, destination.droppableId);

    // 2) если это linked-задача и стадия совпала с mirrorBack.onStageKey — откроем модалку выбора
    await triggerMirrorBackIfNeeded(draggableId, destination.droppableId);
  };

  // Фильтрация задач по поиску/лейблам
  const filteredTasks = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return tasks.filter((task) => {
      const matchesSearch =
          (task.title || '').toLowerCase().includes(q) ||
          (task.description || '').toLowerCase().includes(q);
      const matchesLabels =
          filterLabels.length === 0 ||
          (task.labels || []).some(l => filterLabels.includes(l.id));
      return matchesSearch && matchesLabels;
    });
  }, [tasks, searchQuery, filterLabels]);

  const getTasksByStage = (stageId: string) => filteredTasks.filter(t => t.stageId === stageId);

  // «Осиротевшие» задачи — их stageId не найден среди текущих стадий
  const orphanTasks = useMemo(() => {
    const stageIds = new Set(stages.map(s => s.id));
    return filteredTasks.filter(t => !stageIds.has(t.stageId));
  }, [filteredTasks, stages]);

  const openTaskDetails = async (task: Task) => {
    setSelectedTaskForDetails(task);
    setSelectedTaskLinks(null);
    setSelectedTaskLinksLoading(true);
    try {
      const links = await apiService.getTaskLinks(task.id);
      setSelectedTaskLinks(links || []);
    } catch {
      setSelectedTaskLinks([]);
    } finally {
      setSelectedTaskLinksLoading(false);
    }
  };

  // выясняем: нужно ли открыть mirror-back после переноса задачи
  const triggerMirrorBackIfNeeded = async (movedTaskId: string, toStageId: string) => {
    try {
      const task = tasks.find(t => t.id === movedTaskId);
      if (!task) return;

      // 1) Линки текущей задачи
      const links = await apiService.getTaskLinks(movedTaskId);
      if (!links?.length) return;

      // 2) Ключ стадии назначения
      const toStage = stages.find(s => s.id === toStageId);
      if (!toStage) return;
      const toStageKey = toStage.key;

      // 3) Ищем линк, где movedTask — это получатель
      const link = links.find(l => l.toTaskId === movedTaskId) || links[0];
      const mirrorBack = (link?.meta as any)?.mirrorBack;
      if (!mirrorBack) return;

      // 4) Совпадает ли стадия с onStageKey?
      if (mirrorBack.onStageKey && mirrorBack.onStageKey === toStageKey) {
        const origin = await apiService.getTask(link.fromTaskId);
        setSelectedTaskForDetails(task); // можно параллельно открыть/обновить детали
        setMirrorBackOriginCtx({ originTaskId: origin.id, originBoardId: origin.boardId });
        setShowMirrorBackModal(true);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось инициировать возврат задачи');
    }
  };

  // Кнопка "Отправить обратно": находим линк, тянем origin-задачу, готовим контекст для модалки
  const tryOpenMirrorBack = async () => {
    if (!selectedTaskForDetails || !selectedTaskLinks || selectedTaskLinks.length === 0) return;
    const link = selectedTaskLinks.find(l => l.toTaskId === selectedTaskForDetails.id) || selectedTaskLinks[0];
    if (!link) return;

    try {
      const origin = await apiService.getTask(link.fromTaskId);
      setMirrorBackOriginCtx({ originTaskId: origin.id, originBoardId: origin.boardId });
      setShowMirrorBackModal(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось загрузить исходную задачу');
    }
  };

  if (loading) {
    return (
        <div className="p-6 flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Загрузка доски...</p>
          </div>
        </div>
    );
  }

  return (
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="p-6 bg-white border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <div className="flex items-center space-x-3 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{board.name}</h1>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">{board.key}</span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>{project.name}</span>
                  <span>•</span>
                  <span>{project.key}</span>
                  {board.description && (<><span>•</span><span>{board.description}</span></>)}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Участники">
                <Users className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Настройки">
                <Settings className="h-5 w-5" />
              </button>
              <button
                  onClick={() => setShowCreateStageModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Добавить этап</span>
              </button>
              <button
                  onClick={() => { setSelectedStageId(''); setShowCreateTaskModal(true); }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Задача</span>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                  type="text"
                  placeholder="Поиск задач..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm w-64"
              />
            </div>

            {labels.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <div className="flex flex-wrap gap-2">
                    {labels.map((label) => (
                        <button
                            key={label.id}
                            onClick={() =>
                                setFilterLabels(prev => prev.includes(label.id) ? prev.filter(id => id !== label.id) : [...prev, label.id])
                            }
                            className={`px-2 py-1 rounded-full text-xs font-medium transition-all ${
                                filterLabels.includes(label.id) ? 'ring-2 ring-offset-1' : 'hover:scale-105'
                            }`}
                            style={{
                              backgroundColor: label.color + '20',
                              color: label.color,
                              border: `1px solid ${label.color}40`,
                            }}
                        >
                          {label.name}
                        </button>
                    ))}
                  </div>
                </div>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
            <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex-shrink-0">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
        )}

        {/* Board */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-x-auto overflow-y-hidden">
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="flex space-x-4 h-full min-w-max px-6 py-4">
                {stages.map((s) => (
                    <div key={s.id} className="flex-shrink-0 w-96">
                      <div className="bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl h-full flex flex-col shadow-sm border border-gray-200/50 backdrop-blur-sm overflow-hidden">
                        {/* Stage Header */}
                        <div className="p-4 border-b border-gray-200/70 flex-shrink-0 bg-white/60 rounded-t-xl backdrop-blur-sm overflow-hidden">
                          <div className="flex items-center justify-between mb-2 min-w-0">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                              <h3 className="font-bold text-gray-900 text-base truncate">{s.name}</h3>
                            </div>
                            <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                          <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-2 py-1 rounded-full text-xs font-bold shadow-sm">
                            {s.key}
                          </span>
                              <span className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs font-bold shadow-sm min-w-[24px] text-center">
                            {getTasksByStage(s.id).length}
                          </span>
                              <button
                                  onClick={() => { setSelectedStageId(s.id); setShowCreateTaskModal(true); }}
                                  className="p-1.5 text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 rounded-lg transition-all duration-200 hover:shadow-md"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                              <button
                                  onClick={() => setEditingStageAutomation(s)}
                                  className="p-1.5 text-white bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex-shrink-0"
                                  title="Настроить автоматизацию"
                              >
                                <Zap className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          {s.department && (
                              <div className="flex items-center space-x-1 mt-2">
                                <div className="w-2 h-2 rounded-full bg-orange-400" />
                                <span className="text-xs text-gray-600 font-medium truncate">{s.department}</span>
                              </div>
                          )}
                        </div>

                        {/* Tasks */}
                        <Droppable droppableId={s.id}>
                          {(provided, snapshot) => (
                              <div
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                  className={`flex-1 p-3 space-y-3 overflow-y-auto min-h-0 transition-all duration-200 ${
                                      snapshot.isDraggingOver ? 'bg-gradient-to-b from-blue-50 to-indigo-50' : ''
                                  }`}
                                  style={{ minHeight: '200px', maxHeight: 'calc(100vh - 300px)', transition: 'background-color 0.2s ease' }}
                              >
                                {getTasksByStage(s.id).map((task, index) => (
                                    <Draggable key={task.id} draggableId={task.id} index={index}>
                                      {(dProvided, dSnapshot) => (
                                          <div
                                              ref={dProvided.innerRef}
                                              {...dProvided.draggableProps}
                                              {...dProvided.dragHandleProps}
                                              style={dProvided.draggableProps.style}
                                              className={dSnapshot.isDragging ? 'opacity-90' : ''}
                                              onClick={() => openTaskDetails(task)}
                                          >
                                            <TaskCard
                                                task={task}
                                                labels={labels}
                                                onMove={handleMoveTask}
                                                stages={stages}
                                                onApprove={handleApproveTask}
                                            />
                                          </div>
                                      )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}

                                {getTasksByStage(s.id).length === 0 && (
                                    <div className={`text-center py-6 text-gray-400 transition-all duration-200 ${
                                        snapshot.isDraggingOver ? 'text-blue-500 scale-105' : ''
                                    }`}>
                                      <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                                        <Grid3X3 className="h-6 w-6 opacity-50" />
                                      </div>
                                      <p className="text-sm font-medium">Нет задач</p>
                                      <p className="text-xs text-gray-400 mt-1">Перетащите задачу сюда</p>
                                    </div>
                                )}
                              </div>
                          )}
                        </Droppable>
                      </div>
                    </div>
                ))}

                {/* Нераспределённые задачи (stageId больше не существует) */}
                {orphanTasks.length > 0 && (
                    <div className="flex-shrink-0 w-96">
                      <div className="bg-gradient-to-b from-yellow-50 to-yellow-100 rounded-xl h-full flex flex-col shadow-sm border border-yellow-200/50 overflow-hidden">
                        <div className="p-4 border-b border-yellow-200/70 bg-white/60 rounded-t-xl overflow-hidden">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 truncate flex-1 min-w-0">Нераспределено</h3>
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold shadow-sm">
                          {orphanTasks.length}
                        </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">Перетащите в нужную стадию</p>
                        </div>

                        {/* Источник DnD (приём отключён, но таски можно тащить наружу) */}
                        <Droppable droppableId="__UNMAPPED__" isDropDisabled>
                          {(provided) => (
                              <div
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                  className="flex-1 p-3 space-y-3 overflow-y-auto min-h-0"
                                  style={{ maxHeight: 'calc(100vh - 300px)' }}
                              >
                                {orphanTasks.map((task, index) => (
                                    <Draggable key={task.id} draggableId={task.id} index={index}>
                                      {(dProvided, dSnapshot) => (
                                          <div
                                              ref={dProvided.innerRef}
                                              {...dProvided.draggableProps}
                                              {...dProvided.dragHandleProps}
                                              style={dProvided.draggableProps.style}
                                              className={dSnapshot.isDragging ? 'opacity-90' : ''}
                                              onClick={() => openTaskDetails(task)}
                                          >
                                            <TaskCard
                                                task={task}
                                                labels={labels}
                                                onMove={handleMoveTask}
                                                stages={stages}
                                                onApprove={handleApproveTask}
                                            />
                                          </div>
                                      )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                          )}
                        </Droppable>
                      </div>
                    </div>
                )}
              </div>
            </DragDropContext>
          </div>
        </div>

        {/* Create Task Modal */}
        {showCreateTaskModal && (
            <CreateTaskModal
                onClose={() => setShowCreateTaskModal(false)}
                onSubmit={handleCreateTask}
                labels={labels}
                boardKey={board.key}
                boardId={board.id}
                defaultStageId={selectedStageId || undefined}
            />
        )}

        {/* Create Stage Modal */}
        {showCreateStageModal && (
            <CreateStageModal
                onClose={() => setShowCreateStageModal(false)}
                onSubmit={handleCreateStages}
                boardName={board.name}
                existingStages={stages.map(s => ({
                  key: s.key,
                  name: s.name,
                  order: s.order,
                  department: s.department || undefined,
                  requiresApproval: s.requiresApproval || false,
                  automation: s.automation || undefined
                }))}
                project={project}
            />
        )}

        {/* Automation Editor for existing stage */}
        {editingStageAutomation && (
            <AutomationEditor
                stage={editingStageAutomation}
                projectId={project.id}
                onClose={() => setEditingStageAutomation(null)}
                onSave={handleAutomationSave}
            />
        )}

        {/* Task Details Modal */}
        {selectedTaskForDetails && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex">
                {/* Task Info */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">{selectedTaskForDetails.title}</h2>
                    <div className="flex items-center gap-2">
                      {/* Кнопка mirror-back, если есть хотя бы один линк */}
                      {selectedTaskLinksLoading ? null : (selectedTaskLinks && selectedTaskLinks.length > 0) && (
                          <button
                              onClick={tryOpenMirrorBack}
                              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
                              title="Отправить в исходную доску"
                          >
                            <Send className="w-4 h-4" />
                            Отправить обратно
                          </button>
                      )}
                      <button onClick={() => setSelectedTaskForDetails(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                  </div>

                  {selectedTaskForDetails.description && (
                      <div className="mb-6">
                        <h3 className="font-semibold text-gray-900 mb-2">Описание</h3>
                        <p className="text-gray-700 whitespace-pre-wrap">{selectedTaskForDetails.description}</p>
                      </div>
                  )}

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                        <LinkIcon className="h-4 w-4" />
                        <span>Связанные задачи</span>
                      </h3>
                      <TaskLinksView task={selectedTaskForDetails} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>История изменений</span>
                      </h3>
                      <TaskTimelineView task={selectedTaskForDetails} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
        )}

        {/* MirrorBack Modal */}
        {showMirrorBackModal && selectedTaskForDetails && mirrorBackOriginCtx && (
            <MirrorBackModal
                linkedTask={selectedTaskForDetails}
                originTaskId={mirrorBackOriginCtx.originTaskId}
                originBoardId={mirrorBackOriginCtx.originBoardId}
                onClose={() => setShowMirrorBackModal(false)}
                onDone={() => {
                  // после возврата можно обновить список задач/таймлайн
                  loadBoardData();
                }}
            />
        )}
      </div>
  );
};

export default KanbanBoard;
