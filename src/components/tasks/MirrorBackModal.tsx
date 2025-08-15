import React, { useEffect, useState } from 'react';
import { X, Send, Database, Code, Palette, Bug, CheckCircle, AlertTriangle, Globe, Server, Smartphone, Monitor } from 'lucide-react';
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
    const [commentTemplate, setCommentTemplate] = useState<string>('professional');
    
    // Professional fields
    const [apiEndpoints, setApiEndpoints] = useState<string>('');
    const [dbChanges, setDbChanges] = useState<string>('');
    const [designNotes, setDesignNotes] = useState<string>('');
    const [testResults, setTestResults] = useState<'passed' | 'failed' | 'partial' | ''>('');
    const [issues, setIssues] = useState<string>('');
    const [deploymentNotes, setDeploymentNotes] = useState<string>('');
    const [performanceNotes, setPerformanceNotes] = useState<string>('');
    const [securityNotes, setSecurityNotes] = useState<string>('');
    const [browserCompatibility, setBrowserCompatibility] = useState<string[]>([]);
    const [mobileCompatibility, setMobileCompatibility] = useState<'yes' | 'no' | 'partial' | ''>('');
    
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

    const toggleBrowser = (browser: string) => {
        setBrowserCompatibility(prev => 
            prev.includes(browser) 
                ? prev.filter(b => b !== browser)
                : [...prev, browser]
        );
    };

    const generateProfessionalComment = () => {
        if (commentTemplate === 'custom') return comment;
        
        let report = '';
        
        // Header with task info
        report += `# 📋 **Отчет о выполнении**\n`;
        report += `**Задача:** ${linkedTask.title}\n`;
        report += `**Дата:** ${new Date().toLocaleDateString('ru-RU', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}\n\n`;
        
        // Status Overview
        const statusIcon = testResults === 'passed' ? '🟢' : testResults === 'failed' ? '🔴' : testResults === 'partial' ? '🟡' : '⚪';
        report += `## ${statusIcon} **Статус выполнения**\n`;
        if (testResults) {
            const statusText = testResults === 'passed' ? '✅ **УСПЕШНО** - Все требования выполнены' : 
                             testResults === 'failed' ? '❌ **ТРЕБУЕТ ДОРАБОТКИ** - Обнаружены критические проблемы' : 
                             testResults === 'partial' ? '⚠️ **ЧАСТИЧНО** - Выполнено с замечаниями' : '';
            report += `${statusText}\n\n`;
        }
        
        // Technical Implementation
        if (apiEndpoints.trim() || dbChanges.trim()) {
            report += `## 🔧 **Техническая реализация**\n\n`;
            
            if (apiEndpoints.trim()) {
                report += `### 🔌 **API Endpoints**\n`;
                apiEndpoints.split('\n').forEach(endpoint => {
                    if (endpoint.trim()) {
                        const [method, path] = endpoint.trim().split(' ');
                        const methodColor = method === 'GET' ? '🟢' : method === 'POST' ? '🔵' : method === 'PUT' ? '🟡' : method === 'DELETE' ? '🔴' : '⚪';
                        report += `${methodColor} \`${method}\` **${path}**\n`;
                    }
                });
                report += '\n';
            }
            
            if (dbChanges.trim()) {
                report += `### 🗄️ **База данных**\n`;
                dbChanges.split('\n').forEach(change => {
                    if (change.trim()) {
                        report += `• ${change.trim()}\n`;
                    }
                });
                report += '\n';
            }
        }
        
        // Quality Assurance
        if (testResults || performanceNotes.trim() || securityNotes.trim()) {
            report += `## 🧪 **Контроль качества**\n\n`;
            
            if (testResults) {
                report += `### ✅ **Тестирование**\n`;
                const testIcon = testResults === 'passed' ? '🎯' : testResults === 'failed' ? '💥' : '⚡';
                const testText = testResults === 'passed' ? 'Все тесты пройдены успешно' : 
                               testResults === 'failed' ? 'Обнаружены критические ошибки' : 
                               'Тесты пройдены частично';
                report += `${testIcon} **${testText}**\n\n`;
            }
            
            if (performanceNotes.trim()) {
                report += `### ⚡ **Производительность**\n`;
                performanceNotes.split('\n').forEach(note => {
                    if (note.trim()) {
                        report += `• ${note.trim()}\n`;
                    }
                });
                report += '\n';
            }
            
            if (securityNotes.trim()) {
                report += `### 🔒 **Безопасность**\n`;
                securityNotes.split('\n').forEach(note => {
                    if (note.trim()) {
                        report += `• ${note.trim()}\n`;
                    }
                });
                report += '\n';
            }
        }
        
        // UI/UX Implementation
        if (designNotes.trim() || browserCompatibility.length > 0 || mobileCompatibility) {
            report += `## 🎨 **UI/UX Реализация**\n\n`;
            
            if (designNotes.trim()) {
                report += `### 🖌️ **Дизайн**\n`;
                designNotes.split('\n').forEach(note => {
                    if (note.trim()) {
                        report += `• ${note.trim()}\n`;
                    }
                });
                report += '\n';
            }
            
            if (browserCompatibility.length > 0) {
                report += `### 🌐 **Совместимость браузеров**\n`;
                const browserIcons: Record<string, string> = {
                    'Chrome': '🟢',
                    'Firefox': '🟠', 
                    'Safari': '🔵',
                    'Edge': '🟦'
                };
                browserCompatibility.forEach(browser => {
                    report += `${browserIcons[browser] || '✅'} **${browser}** - Протестировано\n`;
                });
                report += '\n';
            }
            
            if (mobileCompatibility) {
                const mobileIcon = mobileCompatibility === 'yes' ? '📱✅' : mobileCompatibility === 'no' ? '📱❌' : '📱⚠️';
                const mobileText = mobileCompatibility === 'yes' ? 'Полная поддержка' : 
                                 mobileCompatibility === 'no' ? 'Не поддерживается' : 'Частичная поддержка';
                report += `### 📱 **Мобильная версия**\n${mobileIcon} **${mobileText}**\n\n`;
            }
        }
        
        // Deployment
        if (deploymentNotes.trim()) {
            report += `## 🚀 **Развертывание**\n`;
            deploymentNotes.split('\n').forEach(note => {
                if (note.trim()) {
                    report += `• ${note.trim()}\n`;
                }
            });
            report += '\n';
        }
        
        // Issues & Recommendations
        if (issues.trim()) {
            report += `## ⚠️ **Проблемы и рекомендации**\n`;
            issues.split('\n').forEach(issue => {
                if (issue.trim()) {
                    report += `🔸 ${issue.trim()}\n`;
                }
            });
            report += '\n';
        }
        
        // Additional Notes
        if (comment.trim()) {
            report += `## 📝 **Дополнительные заметки**\n`;
            report += `${comment}\n\n`;
        }
        
        // Footer
        report += `---\n`;
        report += `*Автоматически сгенерировано системой управления задачами*\n`;
        report += `*Исполнитель: ${linkedTask.assignee?.name || 'Не указан'}*`;
        
        return report;
    };

    const handleSubmit = async () => {
        try {
            setSaving(true);
            setErr('');
            const finalComment = generateProfessionalComment();
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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                            <Send className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Отправить в исходную доску</h3>
                            <p className="text-sm text-gray-600">Создание профессионального отчета</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-2 hover:bg-white rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{ maxHeight: 'calc(90vh - 200px)' }}>
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600">Загрузка стадий...</p>
                        </div>
                    ) : (
                        <>
                            {/* Target Stage */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <label className="block text-sm font-semibold text-gray-800 mb-2">Целевая стадия исходной доски</label>
                                <select
                                    value={moveToStageKey}
                                    onChange={(e) => setMoveToStageKey(e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                >
                                    {stages.map((s) => (
                                        <option key={s.id} value={s.key}>
                                            {s.name} ({s.key})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Report Type */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">Тип отчета</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setCommentTemplate('professional')}
                                        className={`p-4 rounded-xl border-2 transition-all ${
                                            commentTemplate === 'professional' 
                                                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-2 mb-2">
                                            <CheckCircle className="w-5 h-5" />
                                            <span className="font-semibold">Профессиональный отчет</span>
                                        </div>
                                        <p className="text-xs text-gray-600">Структурированный отчет с техническими деталями</p>
                                    </button>
                                    <button
                                        onClick={() => setCommentTemplate('custom')}
                                        className={`p-4 rounded-xl border-2 transition-all ${
                                            commentTemplate === 'custom' 
                                                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-2 mb-2">
                                            <Code className="w-5 h-5" />
                                            <span className="font-semibold">Свободный формат</span>
                                        </div>
                                        <p className="text-xs text-gray-600">Обычный текстовый комментарий</p>
                                    </button>
                                </div>
                            </div>

                            {commentTemplate === 'professional' ? (
                                <div className="space-y-6">
                                    {/* Status */}
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                                        <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                            Статус выполнения
                                        </label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {[
                                                { value: 'passed', label: '✅ Успешно', color: 'green' },
                                                { value: 'partial', label: '⚠️ Частично', color: 'yellow' },
                                                { value: 'failed', label: '❌ Не пройдено', color: 'red' },
                                                { value: '', label: '⚪ Не указано', color: 'gray' }
                                            ].map(status => (
                                                <button
                                                    key={status.value}
                                                    onClick={() => setTestResults(status.value as any)}
                                                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                                                        testResults === status.value
                                                            ? `border-${status.color}-500 bg-${status.color}-50 text-${status.color}-700`
                                                            : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                >
                                                    {status.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Technical Implementation */}
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                            <Code className="h-5 w-5 text-blue-600" />
                                            Техническая реализация
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">API Endpoints</label>
                                                <textarea
                                                    value={apiEndpoints}
                                                    onChange={(e) => setApiEndpoints(e.target.value)}
                                                    rows={4}
                                                    placeholder="GET /api/users&#10;POST /api/tasks&#10;PUT /api/tasks/:id&#10;DELETE /api/tasks/:id"
                                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">База данных</label>
                                                <textarea
                                                    value={dbChanges}
                                                    onChange={(e) => setDbChanges(e.target.value)}
                                                    rows={4}
                                                    placeholder="Добавлена таблица users&#10;Создан индекс на tasks.status&#10;Миграция 001_add_user_roles.sql"
                                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quality Assurance */}
                                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                            <Bug className="h-5 w-5 text-purple-600" />
                                            Контроль качества
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Производительность</label>
                                                <textarea
                                                    value={performanceNotes}
                                                    onChange={(e) => setPerformanceNotes(e.target.value)}
                                                    rows={3}
                                                    placeholder="Время загрузки: 1.2с&#10;Оптимизированы SQL запросы&#10;Добавлено кэширование"
                                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Безопасность</label>
                                                <textarea
                                                    value={securityNotes}
                                                    onChange={(e) => setSecurityNotes(e.target.value)}
                                                    rows={3}
                                                    placeholder="Добавлена валидация входных данных&#10;Обновлены права доступа&#10;Исправлены XSS уязвимости"
                                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* UI/UX */}
                                    <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-200">
                                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                            <Palette className="h-5 w-5 text-pink-600" />
                                            UI/UX Реализация
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Дизайн и интерфейс</label>
                                                <textarea
                                                    value={designNotes}
                                                    onChange={(e) => setDesignNotes(e.target.value)}
                                                    rows={3}
                                                    placeholder="Обновлена цветовая схема&#10;Добавлены анимации переходов&#10;Улучшена адаптивность"
                                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Совместимость браузеров</label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {['Chrome', 'Firefox', 'Safari', 'Edge'].map(browser => (
                                                            <button
                                                                key={browser}
                                                                onClick={() => toggleBrowser(browser)}
                                                                className={`p-2 rounded-lg border text-sm font-medium transition-all ${
                                                                    browserCompatibility.includes(browser)
                                                                        ? 'border-green-500 bg-green-50 text-green-700'
                                                                        : 'border-gray-200 hover:border-gray-300'
                                                                }`}
                                                            >
                                                                {browser}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Мобильная версия</label>
                                                    <select
                                                        value={mobileCompatibility}
                                                        onChange={(e) => setMobileCompatibility(e.target.value as any)}
                                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                                                    >
                                                        <option value="">Не указано</option>
                                                        <option value="yes">📱 Полная поддержка</option>
                                                        <option value="partial">📱 Частичная поддержка</option>
                                                        <option value="no">📱 Не поддерживается</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Deployment */}
                                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
                                        <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                            <Server className="h-5 w-5 text-orange-600" />
                                            Развертывание
                                        </label>
                                        <textarea
                                            value={deploymentNotes}
                                            onChange={(e) => setDeploymentNotes(e.target.value)}
                                            rows={3}
                                            placeholder="Обновлены переменные окружения&#10;Настроен CI/CD pipeline&#10;Добавлены health checks"
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        />
                                    </div>

                                    {/* Issues */}
                                    <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-4 border border-red-200">
                                        <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                            <AlertTriangle className="h-5 w-5 text-red-600" />
                                            Проблемы и рекомендации
                                        </label>
                                        <textarea
                                            value={issues}
                                            onChange={(e) => setIssues(e.target.value)}
                                            rows={3}
                                            placeholder="Медленная загрузка на слабых устройствах&#10;Требуется оптимизация запросов&#10;Рекомендуется дополнительное тестирование"
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                        />
                                    </div>

                                    {/* Additional Notes */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-800 mb-2">Дополнительные заметки</label>
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            rows={3}
                                            placeholder="Любые дополнительные комментарии и заметки..."
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Комментарий</label>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        rows={8}
                                        placeholder="Введите ваш комментарий..."
                                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            )}

                            {/* Copy Fields */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="text-sm font-semibold text-gray-800 mb-3">Копировать поля из этой задачи в исходную</div>
                                <div className="flex gap-4 text-sm">
                                    {(['description', 'assigneeId', 'dueDate'] as CopyField[]).map((f) => (
                                        <label key={f} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={copyFields.includes(f)}
                                                onChange={() => toggleCopy(f)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="font-medium">{f}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Auto Deploy */}
                            <label className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={autoDeploy}
                                    onChange={(e) => setAutoDeploy(e.target.checked)}
                                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                />
                                <div>
                                    <div className="font-semibold text-gray-800">Триггерить автоматический деплой</div>
                                    <div className="text-sm text-gray-600">Запустить процесс развертывания после отправки</div>
                                </div>
                            </label>

                            {err && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5 text-red-600" />
                                        <span className="font-semibold text-red-800">Ошибка</span>
                                    </div>
                                    <p className="text-red-700 mt-1">{err}</p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="p-6 border-t bg-gray-50 flex justify-between items-center flex-shrink-0">
                    <div className="text-sm text-gray-600">
                        {commentTemplate === 'professional' ? '📋 Профессиональный отчет' : '✏️ Свободный формат'}
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={onClose} 
                            className="px-6 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                        >
                            Отмена
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || saving}
                            className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white disabled:from-gray-300 disabled:to-gray-400 transition-all font-medium flex items-center gap-2 shadow-lg hover:shadow-xl min-w-[140px]"
                        >
                            {saving ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Отправка...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Отправить отчет
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MirrorBackModal;