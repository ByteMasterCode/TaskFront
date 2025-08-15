import React, { useState, useEffect } from 'react';
import { Clock, User, ArrowRight, MessageSquare, Tag, UserPlus, UserMinus } from 'lucide-react';
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
      case 'created': return <Tag className="h-4 w-4" />;
      case 'moved': return <ArrowRight className="h-4 w-4" />;
      case 'approved': return <Tag className="h-4 w-4" />;
      case 'assigned': return <UserPlus className="h-4 w-4" />;
      case 'unassigned': return <UserMinus className="h-4 w-4" />;
      case 'commented': return <MessageSquare className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTransitionColor = (type: string) => {
    switch (type) {
      case 'created': return 'text-green-600 bg-green-100';
      case 'moved': return 'text-blue-600 bg-blue-100';
      case 'approved': return 'text-purple-600 bg-purple-100';
      case 'assigned': return 'text-indigo-600 bg-indigo-100';
      case 'unassigned': return 'text-gray-600 bg-gray-100';
      case 'commented': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
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

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">Загрузка истории...</p>
      </div>
    );
  }

  if (transitions.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Нет истории изменений</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transitions.map((transition, index) => (
        <div key={transition.id} className="flex items-start space-x-3">
          {/* Timeline line */}
          <div className="flex flex-col items-center">
            <div className={`p-2 rounded-full ${getTransitionColor(transition.type)}`}>
              {getTransitionIcon(transition.type)}
            </div>
            {index < transitions.length - 1 && (
              <div className="w-px h-8 bg-gray-200 mt-2"></div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">
                  {getTransitionLabel(transition)}
                </h4>
                <span className="text-xs text-gray-500">
                  {new Date(transition.createdAt).toLocaleString('ru-RU')}
                </span>
              </div>

              {transition.user && (
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-3 w-3 text-gray-600" />
                  </div>
                  <span className="text-sm text-gray-700">
                    {transition.user.name || transition.user.phone}
                  </span>
                </div>
              )}

              {transition.comment && (
                <div className="bg-gray-50 rounded-lg p-3 mt-2">
                  <p className="text-sm text-gray-700">{transition.comment}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskTimelineView;