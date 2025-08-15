import React, { useEffect, useState } from 'react';
import { X, Send, Database, Code, Palette, Bug, CheckCircle, AlertTriangle } from 'lucide-react';
import { WorkflowStage, Task } from '../../types';
import { apiService } from '../../services/api';

type CopyField = 'description' | 'assigneeId' | 'dueDate';

interface MirrorBackModalProps {
    /** linked-задача, которую вернём на исходную */
    linkedTask: Task;
    /** id исходной задачи (из линка) */
    originTaskId: string;
    /** boardId исходной задачи */
    originBoardId: string;
    onClose: () => void;
    onDone: () => void; // для обновления UI после успешной операции
}

const MirrorBackModal: React.FC<MirrorBackModalProps> = ({
                                                             linkedTask,
                                                             originTaskId,
                                                             originBoardId,
                                                             onClose,
                                                             onDone,
                                                         }) => {
    const [stages, setStages] = useState<WorkflowStage[]>([]);
    const [moveToStageKey, setMoveToStageKey] = useState('');
    const [comment, setComment] = useState('');
    const [copyFields, setCopyFields] = useState<CopyField[]>([]);
    const [autoDeploy, setAutoDeploy] = useState(false);
    const [commentTemplate, setCommentTemplate] = useState<string>('custom');
    const [apiEndpoints, setApiEndpoints] = useState<string>('');
    const [dbChanges, setDbChanges] = useState<string>('');
    const [designNotes, setDesignNotes] = useState<string>('');
    const [testResults, setTestResults] = useState<'passed' | 'failed' | 'partial' | ''>('');
    const [issues, setIssues] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState('');

    useEffect(() => {
        (async () => {
            try {
                const ss = await apiService.getBoardStages(originBoardId);
                setStages(ss);
                if (!moveToStageKey && ss.length) setMoveToStageKey(ss[0].key);
            } catch (e: any) {
                setErr(e?.message || 'Не удалось загрузить стадии исходной доски');
            } finally {
                setLoading(false);
            }
        })();
    }, [originBoardId]);

    const toggleCopy = (f: CopyField) => {
        setCopyFields((prev) =>
            prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
        );
    };

    const generateStructuredComment = () => {
        if (commentTemplate === 'custom') return comment;
        
        let structuredComment = '';
        
        // Header with status
        const statusIcon = testResults === 'passed' ? '✅' : testResults === 'failed' ? '❌' : testResults === 'partial' ? '⚠️' : '📋';
        structuredComment += `${statusIcon} **Результаты проверки**\n\n`;
        
        // Test Results
        if (testResults) {
            const statusText = testResults === 'passed' ? 'Все тесты пройдены' : 
                             testResults === 'failed' ? 'Тесты не пройдены' : 
                             testResults === 'partial' ? 'Частично пройдены' : '';
            structuredComment += `🧪 **Тестирование:** ${statusText}\n\n`;
        }
        
        // API Changes
        if (apiEndpoints.trim()) {
            structuredComment += `🔌 **API изменения:**\n`;
            apiEndpoints.split('\n').forEach(endpoint => {
                if (endpoint.trim()) {
                    structuredComment += `• \`${endpoint.trim()}\`\n`;
                }
            });
            structuredComment += '\n';
        }
        
        // Database Changes
        if (dbChanges.trim()) {
            structuredComment += `🗄️ **База данных:**\n`;
            dbChanges.split('\n').forEach(change => {
                if (change.trim()) {
                    structuredComment += `• ${change.trim()}\n`;
                }
            });
            structuredComment += '\n';
        }
        
        // Design Notes
        if (designNotes.trim()) {
            structuredComment += `🎨 **Дизайн:**\n`;
            designNotes.split('\n').forEach(note => {
                if (note.trim()) {
                    structuredComment += `• ${note.trim()}\n`;
                }
            });
            structuredComment += '\n';
        }
        
        // Issues
        if (issues.trim()) {
            structuredComment += `⚠️ **Проблемы/Замечания:**\n`;
            issues.split('\n').forEach(issue => {
                if (issue.trim()) {
                    structuredComment += `• ${issue.trim()}\n`;
                }
            });
            structuredComment += '\n';
        }
        
        // Custom comment
        if (comment.trim()) {
            structuredComment += `📝 **Дополнительно:**\n${comment}\n\n`;
        }
        
        // Footer
        structuredComment += `---\n*Автоматически сгенерировано ${new Date().toLocaleString('ru-RU')}*`;
        
        return structuredComment;
    };

    const handleSubmit = async () => {
        try {
            setSaving(true);
            setErr('');
            const finalComment = generateStructuredComment();
            await apiService.mirrorBackTask(linkedTask.id, {
                moveToStageKey,
                comment: finalComment,
                copyFields,
                autoDeploy,
            });
            onDone();
            onClose();
        } catch (e: any) {
            setErr(e?.message || 'Ошибка отправки обратно');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl">
                <div className="flex items-center justify-between p-5 border-b">
                    <h3 className="text-lg font-semibold">Отправить в исходную доску</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    {loading ? (
                        <div className="text-sm text-gray-500">Загрузка стадий...</div>
                    ) : (
                        <>
                            <div>
                                <label className="block text-sm font-medium mb-1">Целевая стадия исходной доски</label>
                                <select
                                    value={moveToStageKey}
                                    onChange={(e) => setMoveToStageKey(e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2"
                                >
                                    {stages.map((s) => (
                                        <option key={s.id} value={s.key}>
                                            {s.name} ({s.key})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Template Selection */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Тип отчета</label>
                                <select
                                    value={commentTemplate}
                                    onChange={(e) => setCommentTemplate(e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2"
                                >
                                    <option value="structured">📋 Структурированный отчет</option>
                                    <option value="custom">✏️ Свободный комментарий</option>
                                </select>
                            </div>

                            {commentTemplate === 'structured' ? (
                                <div className="space-y-4 bg-gray-50 rounded-lg p-4">
                                    {/* Test Results */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                            Результат тестирования
                                        </label>
                                        <select
                                            value={testResults}
                                            onChange={(e) => setTestResults(e.target.value as any)}
                                            className="w-full border rounded-lg px-3 py-2"
                                        >
                                            <option value="">Не указано</option>
                                            <option value="passed">✅ Все тесты пройдены</option>
                                            <option value="partial">⚠️ Частично пройдены</option>
                                            <option value="failed">❌ Тесты не пройдены</option>
                                        </select>
                                    </div>

                                    {/* API Endpoints */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                            <Code className="h-4 w-4 text-blue-600" />
                                            API эндпоинты (по одному на строку)
                                        </label>
                                        <textarea
                                            value={apiEndpoints}
                                            onChange={(e) => setApiEndpoints(e.target.value)}
                                            rows={3}
                                            placeholder="GET /api/users&#10;POST /api/tasks&#10;PUT /api/tasks/:id"
                                            className="w-full border rounded-lg px-3 py-2 font-mono text-sm"
                                        />
                                    </div>

                                    {/* Database Changes */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                            <Database className="h-4 w-4 text-purple-600" />
                                            Изменения в БД
                                        </label>
                                        <textarea
                                            value={dbChanges}
                                            onChange={(e) => setDbChanges(e.target.value)}
                                            rows={3}
                                            placeholder="Добавлена таблица users&#10;Изменен индекс на tasks.status&#10;Миграция 001_add_user_roles.sql"
                                            className="w-full border rounded-lg px-3 py-2"
                                        />
                                    </div>

                                    {/* Design Notes */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                            <Palette className="h-4 w-4 text-pink-600" />
                                            Дизайн и UI
                                        </label>
                                        <textarea
                                            value={designNotes}
                                            onChange={(e) => setDesignNotes(e.target.value)}
                                            rows={3}
                                            placeholder="Обновлен цвет кнопок&#10;Добавлена анимация загрузки&#10;Исправлена адаптивность на мобильных"
                                            className="w-full border rounded-lg px-3 py-2"
                                        />
                                    </div>

                                    {/* Issues */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                                            Проблемы и замечания
                                        </label>
                                        <textarea
                                            value={issues}
                                            onChange={(e) => setIssues(e.target.value)}
                                            rows={3}
                                            placeholder="Медленная загрузка на слабых устройствах&#10;Нужно оптимизировать запрос к БД&#10;Требуется дополнительное тестирование"
                                            className="w-full border rounded-lg px-3 py-2"
                                        />
                                    </div>

                                    {/* Additional Comments */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Дополнительные заметки</label>
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            rows={3}
                                            placeholder="Любые дополнительные комментарии..."
                                            className="w-full border rounded-lg px-3 py-2"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Комментарий (итоги/заметки)</label>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        rows={6}
                                        placeholder={`Например:\n- Пройдено: ...\n- Не пройдено: ...\n- API изменения: ...\n- БД изменения: ...`}
                                        className="w-full border rounded-lg px-3 py-2"
                                    />
                                </div>
                            )}

                            <div>
                                <div className="text-sm font-medium mb-1">Копировать поля из этой задачи в исходную</div>
                                <div className="flex gap-4 text-sm">
                                    {(['description', 'assigneeId', 'dueDate'] as CopyField[]).map((f) => (
                                        <label key={f} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={copyFields.includes(f)}
                                                onChange={() => toggleCopy(f)}
                                            />
                                            {f}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={autoDeploy}
                                    onChange={(e) => setAutoDeploy(e.target.checked)}
                                />
                                Триггерить деплой (если настроено)
                            </label>

                            {err && (
                                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{err}</div>
                            )}
                        </>
                    )}
                </div>

                <div className="p-5 border-t flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg border">
                        Отмена
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || saving}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:bg-gray-300 flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Сохранение...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                Отправить
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MirrorBackModal;