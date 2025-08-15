import React, { useState, useEffect } from 'react';
import { Clock, User, ArrowRight, MessageSquare, Tag, UserPlus, UserMinus, CheckCircle, GitBranch, AlertTriangle, Code, Database, Palette, Server } from 'lucide-react';
import { Task, TaskTransition } from '../../types';
import { apiService } from '../../services/api';

interface TaskTimelineViewProps {
  task: Task;
}

const TaskTimelineView: React.FC<TaskTimelineViewProps> = ({ task }) => {
  const [transitions, setTransitions] = useState<TaskTransition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTaskTransitions();
  }, [task.id]);

  const loadTaskTransitions = async () => {
    try {
      setLoading(true);
      const data = await apiService.getTaskTransitions(task.id);
      setTransitions(data);
    } catch (err) {
      console.error('Error loading task transitions:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTransitionIcon = (type: string) => {
    switch (type) {
      case 'created': return <CheckCircle className="h-4 w-4" />;
      case 'moved': return <GitBranch className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'assigned': return <UserPlus className="h-4 w-4" />;
      case 'unassigned': return <UserMinus className="h-4 w-4" />;
      case 'commented': return <MessageSquare className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTransitionColor = (type: string) => {
    switch (type) {
      case 'created': return 'text-green-600 bg-gradient-to-br from-green-100 to-green-200 border border-green-300';
      case 'moved': return 'text-blue-600 bg-gradient-to-br from-blue-100 to-blue-200 border border-blue-300';
      case 'approved': return 'text-purple-600 bg-gradient-to-br from-purple-100 to-purple-200 border border-purple-300';
      case 'assigned': return 'text-indigo-600 bg-gradient-to-br from-indigo-100 to-indigo-200 border border-indigo-300';
      case 'unassigned': return 'text-gray-600 bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300';
      case 'commented': return 'text-orange-600 bg-gradient-to-br from-orange-100 to-orange-200 border border-orange-300';
      default: return 'text-gray-600 bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300';
    }
  };

  const getTransitionLabel = (transition: TaskTransition) => {
    switch (transition.type) {
      case 'created': return 'Задача создана';
      case 'moved': 
        return `Перемещена: ${transition.fromStage?.name || 'Неизвестно'} → ${transition.toStage?.name || 'Неизвестно'}`;
      case 'approved': return 'Задача подтверждена';
      case 'assigned': return 'Назначен исполнитель';
      case 'unassigned': return 'Исполнитель снят';
      case 'commented': return 'Добавлен комментарий';
      default: return transition.type;
    }
  };

  const parseStructuredComment = (comment: string) => {
    if (!comment.includes('**') && !comment.includes('#') && !comment.includes('🔌') && !comment.includes('🗄️')) {
      return { isStructured: false, content: comment };
    }

    const sections: { type: string; title: string; content: string; icon: React.ReactNode; items?: any[] }[] = [];
    const lines = comment.split('\n');
    let currentSection: { type: string; title: string; content: string; icon: React.ReactNode } | null = null;

    for (const line of lines) {
      if (line.startsWith('# ') || line.startsWith('## ') || line.includes('**') && line.includes(':')) {
        if (currentSection) {
          sections.push(currentSection);
        }
        const title = line.replace(/^#+\s*/, '').replace(/\*\*/g, '').replace(/🔌|🗄️|🎨|⚠️|🚀|📊/g, '').trim();
        let icon = <MessageSquare className="h-4 w-4" />;
        let type = 'default';

        if (line.includes('📊') || title.includes('Статус') || title.includes('выполнения')) {
          icon = <CheckCircle className="h-4 w-4" />;
          type = 'status';
        } else if (line.includes('🔌') || title.includes('API') || title.includes('Endpoints')) {
          icon = <Code className="h-4 w-4" />;
          type = 'api';
        } else if (line.includes('🗄️') || title.includes('База') || title.includes('данных')) {
          icon = <Database className="h-4 w-4" />;
          type = 'database';
        } else if (line.includes('🎨') || title.includes('UI/UX') || title.includes('Дизайн')) {
          icon = <Palette className="h-4 w-4" />;
          type = 'design';
        } else if (line.includes('⚠️') || title.includes('Проблемы') || title.includes('качества')) {
          icon = <AlertTriangle className="h-4 w-4" />;
          type = 'quality';
        } else if (line.includes('🚀') || title.includes('Развертывание')) {
          icon = <Server className="h-4 w-4" />;
          type = 'deployment';
        }

        currentSection = { type, title, content: '', icon };
      } else if (currentSection) {
        currentSection.content += line + '\n';
      }
    }

    if (currentSection) {
      sections.push(currentSection);
    }

    return { isStructured: true, sections };
  };

  const parseApiEndpoints = (content: string) => {
    const endpoints: { method: string; path: string; description: string }[] = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      const match = line.match(/^\s*-\s*(GET|POST|PUT|DELETE|PATCH)\s+([^\s]+)\s*-?\s*(.*)$/);
      if (match) {
        endpoints.push({
          method: match[1],
          path: match[2],
          description: match[3] || ''
        });
      }
    }
    
    return endpoints;
  };

  const parseDatabaseChanges = (content: string) => {
    const changes: { type: string; description: string }[] = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      const match = line.match(/^\s*-\s*(CREATE|UPDATE|DELETE|INDEX|MIGRATION)\s*[:\-]?\s*(.*)$/);
      if (match) {
        changes.push({
          type: match[1],
          description: match[2] || ''
        });
      }
    }
    
    return changes;
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'POST': return 'bg-green-100 text-green-800 border-green-300';
      case 'PUT': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'DELETE': return 'bg-red-100 text-red-800 border-red-300';
      case 'PATCH': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getDbTypeColor = (type: string) => {
    switch (type) {
      case 'CREATE': return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-blue-100 text-blue-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'INDEX': return 'bg-purple-100 text-purple-800';
      case 'MIGRATION': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStructuredComment = (comment: string) => {
    const parsed = parseStructuredComment(comment);
    
    if (!parsed.isStructured) {
      return (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 mt-2 border border-gray-200">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment}</p>
        </div>
      );
    }

    return (
      <div className="mt-2 space-y-3">
        {parsed.sections?.map((section, index) => {
          const getSectionColor = (type: string) => {
            switch (type) {
              case 'status': return 'from-green-50 to-emerald-100 border-green-300';
              case 'api': return 'from-blue-50 to-indigo-100 border-blue-300';
              case 'database': return 'from-purple-50 to-violet-100 border-purple-300';
              case 'quality': return 'from-red-50 to-pink-100 border-red-300';
              case 'design': return 'from-pink-50 to-rose-50 border-pink-200';
              case 'deployment': return 'from-orange-50 to-amber-50 border-orange-200';
              default: return 'from-gray-50 to-slate-100 border-gray-300';
            }
          };

          return (
            <div key={index} className={`bg-gradient-to-br ${getSectionColor(section.type)} rounded-xl p-4 border shadow-sm`}>
              <div className="flex items-center space-x-2 mb-3">
                {section.icon}
                <h4 className="font-bold text-gray-900 text-sm">{section.title}</h4>
              </div>
              
              {/* Специальная обработка для API endpoints */}
              {section.type === 'api' && (() => {
                const endpoints = parseApiEndpoints(section.content);
                if (endpoints.length > 0) {
                  return (
                    <div className="space-y-2">
                      {endpoints.map((endpoint, idx) => (
                        <div key={idx} className="bg-white/70 rounded-lg p-2 border border-blue-200">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded text-xs font-bold border ${getMethodColor(endpoint.method)}`}>
                              {endpoint.method}
                            </span>
                            <code className="text-sm font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded">
                              {endpoint.path}
                            </code>
                          </div>
                          {endpoint.description && (
                            <p className="text-xs text-gray-600 mt-1 ml-2">{endpoint.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                }
              })()}
              
              {/* Специальная обработка для изменений БД */}
              {section.type === 'database' && (() => {
                const changes = parseDatabaseChanges(section.content);
                if (changes.length > 0) {
                  return (
                    <div className="space-y-2">
                      {changes.map((change, idx) => (
                        <div key={idx} className="bg-white/70 rounded-lg p-2 border border-purple-200">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${getDbTypeColor(change.type)}`}>
                              {change.type}
                            </span>
                            <span className="text-sm text-gray-800">{change.description}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                }
              })()}
              
              {/* Обычный контент для остальных секций */}
              {section.type !== 'api' && section.type !== 'database' && (
                <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {section.content.trim()}
                </div>
              )}
              
              {/* Если нет специальной обработки, показываем обычный текст */}
              {((section.type === 'api' && parseApiEndpoints(section.content).length === 0) ||
                (section.type === 'database' && parseDatabaseChanges(section.content).length === 0)) && (
                <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {section.content.trim()}
                </div>
              )}
              </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-gray-600 font-medium">Загрузка истории изменений...</p>
      </div>
    );
  }

  if (transitions.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="font-semibold text-gray-700 mb-1">Нет истории изменений</h3>
        <p className="text-sm text-gray-500">История появится после первых действий с задачей</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {transitions.map((transition, index) => (
        <div key={transition.id} className="flex items-start space-x-4">
          {/* Timeline line */}
          <div className="flex flex-col items-center">
            <div className={`p-3 rounded-full shadow-sm ${getTransitionColor(transition.type)}`}>
              {getTransitionIcon(transition.type)}
            </div>
            {index < transitions.length - 1 && (
              <div className="w-px h-12 bg-gradient-to-b from-gray-300 to-gray-200 mt-3"></div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 text-base">
                    {getTransitionLabel(transition)}
                  </h4>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full font-medium">
                    {new Date(transition.createdAt).toLocaleString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                {transition.user && (
                  <div className="flex items-center space-x-3 mb-3 p-2 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center border border-blue-300">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-800">
                        {transition.user.name || 'Пользователь'}
                      </span>
                      <p className="text-xs text-gray-500">{transition.user.phone}</p>
                    </div>
                  </div>
                )}

                {transition.comment && renderStructuredComment(transition.comment)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskTimelineView;