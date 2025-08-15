// src/components/tasks/TaskLinksView.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Link as LinkIcon, Plus, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { Task, TaskLink, TaskLinkType, Board } from '../../types';
import { apiService } from '../../services/api';
import AddTaskLinkModal from '../modals/AddTaskLinkModal';

interface Props {
  task: Task;
}

const typeLabel: Record<TaskLinkType, string> = {
  DEPENDS_ON: 'Зависит от',
  CHILD: 'Дочерняя',
  RELATED: 'Связанная',
  BLOCKS: 'Блокирует',
};

const TaskLinksView: React.FC<Props> = ({ task }) => {
  const [links, setLinks] = useState<TaskLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [boards, setBoards] = useState<Board[]>([]);
  const [boardsLoading, setBoardsLoading] = useState(false);

  useEffect(() => {
    loadLinks();
    // грузим доски проекта — чтобы искать по другим доскам
    loadBoardsOfProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.id, task.projectId]);

  const loadLinks = async () => {
    try {
      setLoading(true);
      const rows = await apiService.getTaskLinks(task.id);
      // подтянем сразу названия задач, если не пришли
      const enriched = await Promise.all(
          rows.map(async (l) => {
            if (!l.toTask) {
              try {
                const t = await apiService.getTask(l.toTaskId);
                return { ...l, toTask: t };
              } catch {
                return l;
              }
            }
            return l;
          }),
      );
      setLinks(enriched);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки связей');
    } finally {
      setLoading(false);
    }
  };

  const loadBoardsOfProject = async () => {
    try {
      setBoardsLoading(true);
      const list = await apiService.getProjectBoards(task.projectId);
      setBoards(list);
    } catch {
      // не критично для работы
    } finally {
      setBoardsLoading(false);
    }
  };

  const handleCreateLink = async (data: { toTaskId: string; type: TaskLinkType; meta?: any }) => {
    await apiService.createTaskLink(task.id, data);
    await loadLinks();
  };

  const handleDelete = async (link: TaskLink) => {
    if (!confirm('Удалить связь?')) return;
    await apiService.deleteTaskLink(task.id, link.id);
    setLinks((prev) => prev.filter((l) => l.id !== link.id));
  };

  const linksSorted = useMemo(
      () => links.slice().sort((a, b) => a.type.localeCompare(b.type)),
      [links],
  );

  return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <LinkIcon className="h-4 w-4 text-gray-600" />
            <h4 className="font-semibold text-gray-900">Связанные задачи</h4>
          </div>
          <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium flex items-center space-x-1"
          >
            <Plus className="h-4 w-4" />
            <span>Добавить</span>
          </button>
        </div>

        {loading ? (
            <div className="py-6 text-gray-500 flex items-center justify-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Загрузка...</span>
            </div>
        ) : linksSorted.length === 0 ? (
            <div className="text-sm text-gray-500 py-4">Связей пока нет</div>
        ) : (
            <div className="space-y-2">
              {linksSorted.map((l) => (
                  <div
                      key={l.id}
                      className="flex items-center justify-between border border-gray-200 rounded-md px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="text-xs text-gray-500">{typeLabel[l.type]}</div>
                      <div className="text-sm text-gray-900 truncate">
                        {l.toTask?.title || l.toTaskId}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a
                          className="p-2 text-gray-500 hover:text-gray-700"
                          title="Открыть задачу"
                          // Подставь свою навигацию, если есть роутер для тасков
                          href={`#task-${l.toTaskId}`}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <button
                          onClick={() => handleDelete(l)}
                          className="p-2 text-red-500 hover:text-red-700"
                          title="Удалить связь"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
              ))}
            </div>
        )}

        {showAddModal && (
            <AddTaskLinkModal
                fromTask={task}
                boards={boards}
                boardsLoading={boardsLoading}
                onClose={() => setShowAddModal(false)}
                onSubmit={async (payload) => {
                  await handleCreateLink(payload);
                  setShowAddModal(false);
                }}
            />
        )}
      </div>
  );
};

export default TaskLinksView;
