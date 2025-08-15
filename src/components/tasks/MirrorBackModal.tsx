import React, { useEffect, useState } from 'react';
import { X, Send, Database, Code, Palette, Bug, CheckCircle, AlertTriangle, Globe, Server, Smartphone, Monitor, Plus, Trash2, Edit3, Type, Hash, Calendar, ToggleLeft, Key } from 'lucide-react';
import { WorkflowStage, Task } from '../../types';
import { apiService } from '../../services/api';
import { 
  StructuredComment, 
  ApiEndpoint, 
  DatabaseChange, 
  DatabaseField,
  DesignElement, 
  QualityMetric,
  createStructuredComment,
  addSection,
  serializeComment
} from '../../utils/structuredComment';

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
    const [apiEndpoints, setApiEndpoints] = useState<ApiEndpoint[]>([]);
    const [dbChanges, setDbChanges] = useState<DatabaseChange[]>([]);
    const [designElements, setDesignElements] = useState<DesignElement[]>([]);
    const [qualityMetrics, setQualityMetrics] = useState<QualityMetric[]>([]);
    const [designNotes, setDesignNotes] = useState<string>('');
    const [testResults, setTestResults] = useState<'passed' | 'failed' | 'partial' | ''>('');
    const [issues, setIssues] = useState<{severity: string, description: string}[]>([]);
    const [deploymentNotes, setDeploymentNotes] = useState<string>('');
    const [performanceNotes, setPerformanceNotes] = useState<string>('');
    const [securityNotes, setSecurityNotes] = useState<string>('');
    const [browserCompatibility, setBrowserCompatibility] = useState<string[]>([]);
    const [mobileCompatibility, setMobileCompatibility] = useState<'yes' | 'no' | 'partial' | ''>('');
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState('');
    const [structuredComment, setStructuredComment] = useState<StructuredComment>(
      createStructuredComment('Current User') // В реальном приложении получить из контекста
    );

    // Structured report state
    const [status, setStatus] = useState('completed');
    const [additionalNotes, setAdditionalNotes] = useState('');

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

    const addApiEndpoint = () => {
        const newEndpoint: ApiEndpoint = {
            id: `api-${Date.now()}`,
            method: 'GET',
            path: '/api/',
            description: '',
            status: 'completed'
        };
        setApiEndpoints(prev => [...prev, newEndpoint]);
    };

    const updateApiEndpoint = (id: string, field: string, value: string) => {
        setApiEndpoints(prev => prev.map(endpoint => 
            endpoint.id === id ? { ...endpoint, [field]: value } : endpoint
        ));
    };

    const removeApiEndpoint = (id: string) => {
        setApiEndpoints(prev => prev.filter(endpoint => endpoint.id !== id));
    };

    const addDbChange = () => {
        const newChange: DatabaseChange = {
            id: `db-${Date.now()}`,
            type: 'CREATE',
            table: '',
            description: '',
            status: 'applied'
        };
        setDbChanges(prev => [...prev, newChange]);
    };

    const updateDbChange = (id: string, field: string, value: string) => {
        setDbChanges(prev => prev.map(change => 
            change.id === id ? { ...change, [field]: value } : change
        ));
    };

    const removeDbChange = (id: string) => {
        setDbChanges(prev => prev.filter(change => change.id !== id));
    };

    const addDesignElement = () => {
        const newElement: DesignElement = {
            id: `design-${Date.now()}`,
            type: 'component',
            name: '',
            status: 'implemented',
            browserSupport: {
                chrome: 'supported',
                firefox: 'supported',
                safari: 'supported',
                edge: 'supported',
                mobile: 'supported'
            },
            responsive: true
        };
        setDesignElements(prev => [...prev, newElement]);
    };

    const updateDesignElement = (id: string, field: string, value: any) => {
        setDesignElements(prev => prev.map(element => 
            element.id === id ? { ...element, [field]: value } : element
        ));
    };

    const removeDesignElement = (id: string) => {
        setDesignElements(prev => prev.filter(element => element.id !== id));
    };

    const addQualityMetric = () => {
        const newMetric: QualityMetric = {
            id: `quality-${Date.now()}`,
            name: '',
            value: '',
            status: 'good'
        };
        setQualityMetrics(prev => [...prev, newMetric]);
    };

    const updateQualityMetric = (id: string, field: string, value: any) => {
        setQualityMetrics(prev => prev.map(metric => 
            metric.id === id ? { ...metric, [field]: value } : metric
        ));
    };

    const removeQualityMetric = (id: string) => {
        setQualityMetrics(prev => prev.filter(metric => metric.id !== id));
    };

    const addIssue = () => {
        setIssues(prev => [...prev, { severity: 'medium', description: '' }]);
    };

    const updateIssue = (index: number, field: string, value: string) => {
        setIssues(prev => prev.map((item, i) => 
            i === index ? { ...item, [field]: value } : item
        ));
    };

    const removeIssue = (index: number) => {
        setIssues(prev => prev.filter((_, i) => i !== index));
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
        if (apiEndpoints.length > 0 || dbChanges.length > 0) {
            report += `## 🔧 **Техническая реализация**\n\n`;
            
            if (apiEndpoints.length > 0) {
                report += `### 🔌 **API Endpoints**\n`;
                apiEndpoints.forEach(endpoint => {
                    if (endpoint.path.trim()) {
                        const methodColor = endpoint.method === 'GET' ? '🟢' : endpoint.method === 'POST' ? '🔵' : endpoint.method === 'PUT' ? '🟡' : endpoint.method === 'DELETE' ? '🔴' : '⚪';
                        report += `${methodColor} \`${endpoint.method}\` **${endpoint.path}**`;
                        if (endpoint.description) report += ` - ${endpoint.description}`;
                        report += '\n';
                    }
                });
                report += '\n';
            }
            
            if (dbChanges.length > 0) {
                report += `### 🗄️ **База данных**\n`;
                dbChanges.forEach(change => {
                    if (change.description.trim()) {
                        const typeIcon = change.type === 'CREATE' ? '🆕' : change.type === 'UPDATE' ? '🔄' : change.type === 'DELETE' ? '🗑️' : change.type === 'INDEX' ? '📊' : '🔧';
                        report += `${typeIcon} **${change.type}**: ${change.description}\n`;
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
        if (issues.length > 0) {
            report += `## ⚠️ **Проблемы и рекомендации**\n`;
            issues.forEach(issue => {
                if (issue.description.trim()) {
                    const severityIcon = issue.severity === 'high' ? '🔴' : issue.severity === 'medium' ? '🟡' : '🟢';
                    report += `${severityIcon} **${issue.severity.toUpperCase()}**: ${issue.description}\n`;
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

            let finalComment = '';
            
            if (commentTemplate === 'professional') {
                // Create structured comment
                let comment = structuredComment;
                
                // Add status section
                comment = addSection(comment, {
                    type: 'status',
                    title: 'Статус выполнения',
                    data: { status }
                });
                
                // Add API section
                if (apiEndpoints.length > 0) {
                    comment = addSection(comment, {
                        type: 'api',
                        title: 'API Endpoints',
                        data: { endpoints: apiEndpoints }
                    });
                }
                
                // Add database section
                if (dbChanges.length > 0) {
                    comment = addSection(comment, {
                        type: 'database',
                        title: 'Database Changes',
                        data: { changes: dbChanges }
                    });
                }
                
                // Add design section
                if (designElements.length > 0) {
                    comment = addSection(comment, {
                        type: 'design',
                        title: 'Design & UI/UX',
                        data: { elements: designElements }
                    });
                }
                
                // Add quality section
                if (qualityMetrics.length > 0) {
                    comment = addSection(comment, {
                        type: 'quality',
                        title: 'Quality Metrics',
                        data: { metrics: qualityMetrics }
                    });
                }
                
                // Add notes section
                if (additionalNotes.trim()) {
                    comment = addSection(comment, {
                        type: 'notes',
                        title: 'Additional Notes',
                        data: { text: additionalNotes }
                    });
                }
                
                finalComment = serializeComment(comment);
            } else {
                finalComment = generateProfessionalComment();
            }
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
                                        <div className="space-y-6">
                                            {/* API Endpoints */}
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                                        <Globe className="h-4 w-4 text-blue-600" />
                                                        API Endpoints
                                                    </label>
                                                    <button
                                                        onClick={addApiEndpoint}
                                                        className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                        Добавить
                                                    </button>
                                                </div>
                                                <div className="space-y-3">
                                                    {apiEndpoints.map((endpoint) => (
                                                        <div key={endpoint.id} className="bg-white rounded-lg border border-gray-200 p-3">
                                                            <div className="grid grid-cols-12 gap-2 items-center">
                                                                <div className="col-span-2">
                                                                    <select
                                                                        value={endpoint.method}
                                                                        onChange={(e) => updateApiEndpoint(endpoint.id, 'method', e.target.value)}
                                                                        className="w-full text-xs font-mono font-bold rounded px-2 py-1 border border-gray-200 focus:ring-1 focus:ring-blue-500"
                                                                    >
                                                                        <option value="GET" className="text-green-600">GET</option>
                                                                        <option value="POST" className="text-blue-600">POST</option>
                                                                        <option value="PUT" className="text-yellow-600">PUT</option>
                                                                        <option value="DELETE" className="text-red-600">DELETE</option>
                                                                        <option value="PATCH" className="text-purple-600">PATCH</option>
                                                                    </select>
                                                                </div>
                                                                <div className="col-span-4">
                                                                    <input
                                                                        type="text"
                                                                        value={endpoint.path}
                                                                        onChange={(e) => updateApiEndpoint(endpoint.id, 'path', e.target.value)}
                                                                        placeholder="/api/endpoint"
                                                                        className="w-full text-xs font-mono rounded px-2 py-1 border border-gray-200 focus:ring-1 focus:ring-blue-500"
                                                                    />
                                                                </div>
                                                                <div className="col-span-5">
                                                                    <input
                                                                        type="text"
                                                                        value={endpoint.description}
                                                                        onChange={(e) => updateApiEndpoint(endpoint.id, 'description', e.target.value)}
                                                                        placeholder="Описание endpoint"
                                                                        className="w-full text-xs rounded px-2 py-1 border border-gray-200 focus:ring-1 focus:ring-blue-500"
                                                                    />
                                                                </div>
                                                                <div className="col-span-1">
                                                                    <button
                                                                        onClick={() => removeApiEndpoint(endpoint.id)}
                                                                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                                                    >
                                                                        <Trash2 className="h-3 w-3" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="mt-3 grid grid-cols-2 gap-3">
                                                                <select
                                                                    value={endpoint.status}
                                                                    onChange={(e) => updateApiEndpoint(endpoint.id, 'status', e.target.value)}
                                                                    className="px-3 py-1.5 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                >
                                                                    <option value="implemented">Implemented</option>
                                                                    <option value="testing">Testing</option>
                                                                    <option value="completed">Completed</option>
                                                                    <option value="failed">Failed</option>
                                                                </select>
                                                                <div className="flex items-center space-x-2">
                                                                    <input
                                                                        type="number"
                                                                        value={endpoint.responseTime || ''}
                                                                        onChange={(e) => updateApiEndpoint(endpoint.id, 'responseTime', e.target.value)}
                                                                        placeholder="Response time (ms)"
                                                                        className="flex-1 px-3 py-1.5 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                    />
                                                                    <input
                                                                        type="number"
                                                                        value={endpoint.statusCode || ''}
                                                                        onChange={(e) => updateApiEndpoint(endpoint.id, 'statusCode', e.target.value)}
                                                                        placeholder="Status code"
                                                                        className="w-20 px-3 py-1.5 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {apiEndpoints.length === 0 && (
                                                        <div className="text-center py-4 text-gray-500 text-sm">
                                                            Нажмите "Добавить" чтобы добавить API endpoint
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Database Changes */}
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                                        <Database className="h-4 w-4 text-indigo-600" />
                                                        База данных
                                                    </label>
                                                    <button
                                                        onClick={addDbChange}
                                                        className="px-3 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                        Добавить
                                                    </button>
                                                </div>
                                                <div className="space-y-3">
                                                    {dbChanges.map((change) => (
                                                        <div key={change.id} className="bg-white rounded-lg border border-gray-200 p-3">
                                                            <div className="grid grid-cols-12 gap-2 items-center">
                                                                <div className="col-span-2">
                                                                    <select
                                                                        value={change.type}
                                                                        onChange={(e) => updateDbChange(change.id, 'type', e.target.value)}
                                                                        className="w-full text-xs font-medium rounded px-2 py-1 border border-gray-200 focus:ring-1 focus:ring-indigo-500"
                                                                    >
                                                                        <option value="CREATE">🆕 CREATE</option>
                                                                        <option value="UPDATE">🔄 UPDATE</option>
                                                                        <option value="DELETE">🗑️ DELETE</option>
                                                                        <option value="INDEX">📊 INDEX</option>
                                                                        <option value="MIGRATION">🔧 MIGRATION</option>
                                                                    </select>
                                                                </div>
                                                                <div className="col-span-3">
                                                                    <input
                                                                        type="text"
                                                                        value={change.table}
                                                                        onChange={(e) => updateDbChange(change.id, 'table', e.target.value)}
                                                                        placeholder="Table name"
                                                                        className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm font-mono focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                                    />
                                                                </div>
                                                                <div className="col-span-6">
                                                                    <input
                                                                        type="text"
                                                                        value={change.description}
                                                                        onChange={(e) => updateDbChange(change.id, 'description', e.target.value)}
                                                                        placeholder="Описание изменения в БД"
                                                                        className="w-full text-xs rounded px-2 py-1 border border-gray-200 focus:ring-1 focus:ring-indigo-500"
                                                                    />
                                                                </div>
                                                                <div className="col-span-1">
                                                                    <button
                                                                        onClick={() => removeDbChange(change.id)}
                                                                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                                                    >
                                                                        <Trash2 className="h-3 w-3" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="mt-3">
                                                                <select
                                                                    value={change.status}
                                                                    onChange={(e) => updateDbChange(change.id, 'status', e.target.value)}
                                                                    className="px-3 py-1.5 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                                >
                                                                    <option value="pending">Pending</option>
                                                                    <option value="applied">Applied</option>
                                                                    <option value="failed">Failed</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {dbChanges.length === 0 && (
                                                        <div className="text-center py-4 text-gray-500 text-sm">
                                                            Нажмите "Добавить" чтобы добавить изменение БД
                                                        </div>
                                                    )}
                                                </div>
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

                                    {/* Design & UI/UX */}
                                    <div className="bg-gradient-to-br from-pink-50 to-rose-100 rounded-xl p-4 border border-pink-300">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center space-x-2">
                                                <Palette className="h-4 w-4 text-pink-600" />
                                                <h4 className="font-semibold text-gray-900">Design & UI/UX</h4>
                                            </div>
                                            <button
                                                onClick={addDesignElement}
                                                className="px-3 py-1.5 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-sm font-medium flex items-center space-x-1 transition-colors"
                                            >
                                                <Plus className="h-4 w-4" />
                                                <span>Добавить</span>
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {designElements.map((element) => (
                                                <div key={element.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                                    <div className="grid grid-cols-12 gap-3 items-center">
                                                        <div className="col-span-2">
                                                            <select
                                                                value={element.type}
                                                                onChange={(e) => updateDesignElement(element.id, 'type', e.target.value)}
                                                                className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                                                            >
                                                                <option value="component">Component</option>
                                                                <option value="page">Page</option>
                                                                <option value="style">Style</option>
                                                                <option value="animation">Animation</option>
                                                            </select>
                                                        </div>
                                                        <div className="col-span-4">
                                                            <input
                                                                type="text"
                                                                value={element.name}
                                                                onChange={(e) => updateDesignElement(element.id, 'name', e.target.value)}
                                                                placeholder="Element name"
                                                                className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                                                            />
                                                        </div>
                                                        <div className="col-span-2">
                                                            <select
                                                                value={element.status}
                                                                onChange={(e) => updateDesignElement(element.id, 'status', e.target.value)}
                                                                className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                                                            >
                                                                <option value="draft">Draft</option>
                                                                <option value="review">Review</option>
                                                                <option value="approved">Approved</option>
                                                                <option value="implemented">Implemented</option>
                                                            </select>
                                                        </div>
                                                        <div className="col-span-3">
                                                            <label className="flex items-center space-x-2">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={element.responsive}
                                                                    onChange={(e) => updateDesignElement(element.id, 'responsive', e.target.checked)}
                                                                    className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                                                                />
                                                                <span className="text-sm text-gray-700">Responsive</span>
                                                            </label>
                                                        </div>
                                                        <div className="col-span-1">
                                                            <button
                                                                onClick={() => removeDesignElement(element.id)}
                                                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            
                                            {designElements.length === 0 && (
                                                <div className="text-center py-6 text-gray-500">
                                                    <Palette className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                    <p className="text-sm">No design elements added</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Quality Metrics */}
                                    <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-4 border border-green-300">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center space-x-2">
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                                <h4 className="font-semibold text-gray-900">Quality Metrics</h4>
                                            </div>
                                            <button
                                                onClick={addQualityMetric}
                                                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center space-x-1 transition-colors"
                                            >
                                                <Plus className="h-4 w-4" />
                                                <span>Добавить</span>
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {qualityMetrics.map((metric) => (
                                                <div key={metric.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                                    <div className="grid grid-cols-12 gap-3 items-center">
                                                        <div className="col-span-3">
                                                            <input
                                                                type="text"
                                                                value={metric.name}
                                                                onChange={(e) => updateQualityMetric(metric.id, 'name', e.target.value)}
                                                                placeholder="Metric name"
                                                                className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                            />
                                                        </div>
                                                        <div className="col-span-2">
                                                            <input
                                                                type="text"
                                                                value={metric.value}
                                                                onChange={(e) => updateQualityMetric(metric.id, 'value', e.target.value)}
                                                                placeholder="Value"
                                                                className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                            />
                                                        </div>
                                                        <div className="col-span-2">
                                                            <input
                                                                type="text"
                                                                value={metric.unit || ''}
                                                                onChange={(e) => updateQualityMetric(metric.id, 'unit', e.target.value)}
                                                                placeholder="Unit"
                                                                className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                            />
                                                        </div>
                                                        <div className="col-span-2">
                                                            <select
                                                                value={metric.status}
                                                                onChange={(e) => updateQualityMetric(metric.id, 'status', e.target.value)}
                                                                className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                            >
                                                                <option value="good">Good</option>
                                                                <option value="warning">Warning</option>
                                                                <option value="critical">Critical</option>
                                                            </select>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <input
                                                                type="text"
                                                                value={metric.benchmark || ''}
                                                                onChange={(e) => updateQualityMetric(metric.id, 'benchmark', e.target.value)}
                                                                placeholder="Benchmark"
                                                                className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                            />
                                                        </div>
                                                        <div className="col-span-1">
                                                            <button
                                                                onClick={() => removeQualityMetric(metric.id)}
                                                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            
                                            {qualityMetrics.length === 0 && (
                                                <div className="text-center py-6 text-gray-500">
                                                    <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                    <p className="text-sm">No quality metrics added</p>
                                                </div>
                                            )}
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
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                                <AlertTriangle className="h-5 w-5 text-red-600" />
                                                Проблемы и рекомендации
                                            </label>
                                            <button
                                                onClick={addIssue}
                                                className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                                            >
                                                <Plus className="h-3 w-3" />
                                                Добавить
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {issues.map((issue, index) => (
                                                <div key={index} className="bg-white rounded-lg border border-gray-200 p-3">
                                                    <div className="grid grid-cols-12 gap-2 items-center">
                                                        <div className="col-span-2">
                                                            <select
                                                                value={issue.severity}
                                                                onChange={(e) => updateIssue(index, 'severity', e.target.value)}
                                                                className="w-full text-xs font-medium rounded px-2 py-1 border border-gray-200 focus:ring-1 focus:ring-red-500"
                                                            >
                                                                <option value="low">🟢 LOW</option>
                                                                <option value="medium">🟡 MEDIUM</option>
                                                                <option value="high">🔴 HIGH</option>
                                                            </select>
                                                        </div>
                                                        <div className="col-span-9">
                                                            <input
                                                                type="text"
                                                                value={issue.description}
                                                                onChange={(e) => updateIssue(index, 'description', e.target.value)}
                                                                placeholder="Описание проблемы или рекомендации"
                                                                className="w-full text-xs rounded px-2 py-1 border border-gray-200 focus:ring-1 focus:ring-red-500"
                                                            />
                                                        </div>
                                                        <div className="col-span-1">
                                                            <button
                                                                onClick={() => removeIssue(index)}
                                                                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {issues.length === 0 && (
                                                <div className="text-center py-4 text-gray-500 text-sm">
                                                    Нажмите "Добавить" чтобы добавить проблему
                                                </div>
                                            )}
                                        </div>
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