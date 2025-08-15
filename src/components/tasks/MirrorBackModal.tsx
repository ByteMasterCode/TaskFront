import React, { useEffect, useState } from 'react';
import { X, Send } from 'lucide-react';
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

    const handleSubmit = async () => {
        try {
            setSaving(true);
            setErr('');
            await apiService.mirrorBackTask(linkedTask.id, {
                moveToStageKey,
                comment,
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

                            <div>
                                <label className="block text-sm font-medium mb-1">Комментарий (итоги/заметки)</label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    rows={4}
                                    placeholder={`Например:\n- Пройдено: ...\n- Не пройдено: ...`}
                                    className="w-full border rounded-lg px-3 py-2"
                                />
                            </div>

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
