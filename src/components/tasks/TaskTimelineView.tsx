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
    if (!comment.includes('**') && !comment.includes('#')) {
      return { isStructured: false, content: comment };
    }

    const sections: { type: string; title: string; content: string; icon: React.ReactNode }[] = [];
    const lines = comment.split('\n');
    let currentSection: { type: string; title: string; content: string; icon: React.ReactNode } | null = null;

    for (const line of lines) {
      if (line.startsWith('# ') || line.startsWith('## ')) {
        if (currentSection) {
          sections.push(currentSection);
        }
        const title = line.replace(/^#+\s*/, '').replace(/\*\*/g, '');
        let icon = <MessageSquare className="h-4 w-4" />;
        let type = 'default';

        if (title.includes('Статус') || title.includes('выполнения')) {
          icon = <CheckCircle className="h-4 w-4" />;
          type = 'status';
        } else if (title.includes('Техническая') || title.includes('API') || title.includes('База')) {
          icon = <Code className="h-4 w-4" />;
          type = 'technical';
        } else if (title.includes('качества') || title.includes('Тестирование')) {
          icon = <AlertTriangle className="h-4 w-4" />;
          type = 'quality';
        } else if (title.includes('UI/UX') || title.includes('Дизайн')) {
          icon = <Palette className="h-4 w-4" />;
          type = 'design';
        } else if (title.includes('Развертывание')) {
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

  const renderStructuredComment = (comment: string) => {
    const parsed = parseStructuredComment(comment);
    
    if (!parsed.isStructured) {
      return (
        <div className="bg-gray-50 rounded-lg p-3 mt-2">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment}</p>
        </div>
      );
    }

    return (
      <div className="mt-2 space-y-3">
        {parsed.sections?.map((section, index) => {
          const getSectionColor = (type: string) => {
            switch (type) {
              case 'status': return 'from-green-50 to-emerald-50 border-green-200';
              case 'technical': return 'from-blue-50 to-indigo-50 border-blue-200';
              case 'quality': return 'from-purple-50 to-pink-50 border-purple-200';
              case 'design': return 'from-pink-50 to-rose-50 border-pink-200';
              case 'deployment': return 'from-orange-50 to-amber-50 border-orange-200';
              default: return 'from-gray-50 to-gray-100 border-gray-200';
            }
          };

          return (
            <div key={index} className={`bg-gradient-to-r ${getSectionColor(section.type)} rounded-lg p-3 border`}>
              <div className="flex items-center space-x-2 mb-2">
                {section.icon}
                <h4 className="font-semibold text-gray-800 text-sm">{section.title}</h4>
              </div>
              <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {section.content.trim()}
              </div>
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