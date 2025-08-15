// src/components/tasks/modals/AddTaskLinkModal.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { X, Search, Link as LinkIcon, Hash } from 'lucide-react';
import { Board, Task, TaskLinkType } from '../../types';
import { apiService } from '../../services/api';

interface Props {
    fromTask: Task;
    boards: Board[];
    boardsLoading?: boolean;
    onClose: () => void;
    onSubmit: (data: { toTaskId: string; type: TaskLinkType; meta?: any }) => Promise<void>;
}

const typeOptions: { value: TaskLinkType; label: string }[] = [
    { value: 'DEPENDS_ON', label: 'Зависит от' },
    { value: 'BLOCKS', label: 'Блокирует' },
    { value: 'RELATED', label: 'Связанная' },
    { value: 'CHILD', label: 'Дочерняя' },
];

const AddTaskLinkModal: React.FC<Props> = ({
                                               fromTask,
                                               boards,
                                               boardsLoading,
                                               onClose,
                                               onSubmit,
                                           }) => {
    const [type, setType] = useState<TaskLinkType>('DEPENDS_ON');
    const [boardId, setBoardId] = useState<string>(fromTask.boardId); // по умолчанию текущая доска
    const [search, setSearch] = useState('');
    const [results, setResults] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<string>('');
    const [manualToTaskId, setManualToTaskId] = useState<string>('');
    const [error, setError] = useState('');

    const currentBoard = useMemo(
        () => boards.find((b) => b.id === boardId),
        [boards, boardId],
    );

    useEffect(() => {
        if (!boardId || !search.trim()) {
            setResults([]);
            return;
        }
        const t = setTimeout(() => {
            findTasks();
        }, 300);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [boardId, search]);

    const findTasks = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await apiService.getBoardTasks(boardId, { search, limit: 20, sortBy: 'updatedAt', sortDir: 'DESC' });
            // убираем саму задачу из результатов
            const items = data.items.filter((t) => t.id !== fromTask.id);
            setResults(items);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ошибка поиска задач');
        } finally {
            setLoading(false);
        }
    };

    const canSubmit = !!selectedTaskId || !!manualToTaskId.trim();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;

        const toTaskId = selectedTaskId || manualToTaskId.trim();
        if (!toTaskId) return;

        if (toTaskId === fromTask.id) {
            setError('Нельзя связать задачу саму с собой');
            return;
        }

        await onSubmit({ toTaskId, type });
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                            <LinkIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Создать связь</h3>
                            <p className="text-sm text-gray-600 truncate">Исходная: {fromTask.title}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Тип связи</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as TaskLinkType)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {typeOptions.map((o) => (
                                <option key={o.value} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Board + search */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Доска</label>
                            <select
                                disabled={!!boardsLoading}
                                value={boardId}
                                onChange={(e) => setBoardId(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {boards.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.name} ({b.key})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Поиск задачи</label>
                            <div className="relative">
                                <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Введите часть названия/описания..."
                                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="border border-gray-200 rounded-lg max-h-56 overflow-y-auto">
                        {!boardId || !search.trim() ? (
                            <div className="p-4 text-sm text-gray-500">Укажите доску и поисковый запрос</div>
                        ) : loading ? (
                            <div className="p-4 text-sm text-gray-500">Поиск...</div>
                        ) : error ? (
                            <div className="p-4 text-sm text-red-600">{error}</div>
                        ) : results.length === 0 ? (
                            <div className="p-4 text-sm text-gray-500">Ничего не найдено</div>
                        ) : (
                            <ul className="divide-y divide-gray-200">
                                {results.map((t) => (
                                    <li key={t.id}>
                                        <label className="flex items-start p-3 gap-3 cursor-pointer hover:bg-gray-50">
                                            <input
                                                type="radio"
                                                name="toTask"
                                                className="mt-1"
                                                checked={selectedTaskId === t.id}
                                                onChange={() => {
                                                    setSelectedTaskId(t.id);
                                                    setManualToTaskId('');
                                                }}
                                            />
                                            <div className="min-w-0">
                                                <div className="text-sm font-medium text-gray-900 truncate">{t.title}</div>
                                                {t.description && (
                                                    <div className="text-xs text-gray-500 line-clamp-2">{t.description}</div>
                                                )}
                                            </div>
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Manual ID */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Или вручную ID задачи</label>
                        <div className="relative">
                            <Hash className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                value={manualToTaskId}
                                onChange={(e) => {
                                    setManualToTaskId(e.target.value);
                                    setSelectedTaskId('');
                                }}
                                placeholder="uuid задачи"
                                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            При заполненном ID поиск/выбор из списка будет проигнорирован
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={!canSubmit}
                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300"
                        >
                            Создать связь
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTaskLinkModal;
