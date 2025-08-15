import React from 'react';
import {
  Calendar,
  User,
  MessageSquare,
  Paperclip,
  MoreHorizontal,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Task, Label, WorkflowStage } from '../../types';

interface TaskCardProps {
  task: Task;
  labels: Label[];
  stages: WorkflowStage[];
  onMove: (taskId: string, stageId: string) => void;
  onApprove?: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, labels, stages, onMove, onApprove }) => {
  const taskLabels = (task.labels || []) as Label[];
  
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
  const isDueSoon = task.dueDate && 
    new Date(task.dueDate) > new Date() && 
    new Date(task.dueDate) <= new Date(Date.now() + 24 * 60 * 60 * 1000);

  return (
    <div className={`bg-white rounded-xl shadow-sm border-l-4 ${getPriorityColor()} hover:shadow-lg transition-all duration-300 cursor-pointer group relative overflow-hidden backdrop-blur-sm border border-gray-100/50 w-full`}>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent pointer-events-none"></div>
      
      <div className="p-3 relative z-10 min-w-0">
        {/* Task Header */}
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-semibold text-gray-900 text-sm leading-tight flex-1 min-w-0 pr-2 break-words">
            {task.title}
          </h4>
          <button className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>

        {/* Description */}
        {task.description && (
          <div className="mb-3">
            {(() => {
              // Проверяем, является ли описание структурированным отчетом
              if (task.description.includes('## ') || task.description.includes('**Статус:**') || task.description.includes('🔌 **API Endpoints:**')) {
                const lines = task.description.split('\n');
                const statusLine = lines.find(line => line.includes('**Статус:**'));
                const apiLine = lines.find(line => line.includes('🔌 **API Endpoints:**'));
                const dbLine = lines.find(line => line.includes('🗄️ **База данных:**'));
                
                return (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-2 border border-blue-200">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-xs font-semibold text-blue-800">Профессиональный отчет</span>
                    </div>
                    
                    {statusLine && (
                      <div className="text-xs text-blue-700 mb-1">
                        {statusLine.replace(/\*\*/g, '').replace('Статус:', '📊')}
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-1">
                      {apiLine && (
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
                          🔌 API
                        </span>
                      )}
                      {dbLine && (
                        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-medium">
                          🗄️ БД
                        </span>
                      )}
                      {task.description.includes('🎨 **UI/UX:**') && (
                        <span className="bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full text-xs font-medium">
                          🎨 UI/UX
                        </span>
                      )}
                      {task.description.includes('⚠️ **Проблемы:**') && (
                        <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-medium">
                          ⚠️ Проблемы
                        </span>
                      )}
                    </div>
                  </div>
                );
              } else {
                // Обычное описание
                return (
                  <p className="text-gray-600 text-xs line-clamp-2 leading-relaxed break-words">
                    {task.description}
                  </p>
                );
              }
            })()}
          </div>
        )}

        {/* Labels */}
        {taskLabels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3 overflow-hidden">
            {taskLabels.map((label: Label) => (
              <span
                key={label.id}
                className="px-2 py-1 rounded-full text-xs font-semibold shadow-sm truncate max-w-full"
                style={{ 
                  backgroundColor: label.color + '20', 
                  color: label.color,
                  border: `1px solid ${label.color}40`
                }}
              >
                {label.name}
              </span>
            ))}
          </div>
        )}

        {/* Due Date */}
        {task.dueDate && (
          <div className={`flex items-center space-x-1 mb-3 text-xs px-2 py-1 rounded-lg overflow-hidden ${
            isOverdue ? 'text-red-600' : isDueSoon ? 'text-orange-600' : 'text-gray-500'
          } ${
            isOverdue ? 'bg-red-50 border border-red-200' : 
            isDueSoon ? 'bg-orange-50 border border-orange-200' : 
            'bg-gray-50 border border-gray-200'
          }`}>
            {isOverdue ? (
              <AlertCircle className="h-3 w-3" />
            ) : (
              <Calendar className="h-3 w-3" />
            )}
            <span className={`${isOverdue ? 'font-medium' : ''} truncate`}>
              {new Date(task.dueDate).toLocaleDateString('ru-RU')}
            </span>
            {isOverdue && <span className="font-medium">(просрочено)</span>}
            {isDueSoon && <span className="font-medium">(завтра)</span>}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 flex-1 min-w-0">
            {/* Assignee */}
            {task.assignee ? (
              <div className="flex items-center space-x-1 min-w-0">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-sm">
                  <User className="h-3 w-3 text-blue-600" />
                </div>
                <span className="text-xs text-gray-700 truncate max-w-20 font-medium">
                  {task.assignee.name || task.assignee.phone}
                </span>
              </div>
            ) : (
              <div className="w-6 h-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                <User className="h-3 w-3 text-gray-400" />
              </div>
            )}

            {/* Comments count (if available) */}
            <div className="flex items-center space-x-1 text-gray-400 bg-gray-50 px-1 py-0.5 rounded flex-shrink-0">
              <MessageSquare className="h-3 w-3" />
              <span className="text-xs font-medium">0</span>
            </div>

            {/* Attachments count (if available) */}
            <div className="flex items-center space-x-1 text-gray-400 bg-gray-50 px-1 py-0.5 rounded flex-shrink-0">
              <Paperclip className="h-3 w-3" />
              <span className="text-xs font-medium">0</span>
            </div>
          </div>

          {/* Created date */}
          <div className="flex items-center space-x-1 text-gray-400 bg-gray-50 px-1 py-0.5 rounded flex-shrink-0">
            <Clock className="h-3 w-3" />
            <span className="text-xs font-medium whitespace-nowrap">
              {new Date(task.createdAt).toLocaleDateString('ru-RU')}
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-2 pt-2 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
          <div className="flex items-center space-x-1">
            {/* Move to Stage Dropdown */}
            <select
              onChange={(e) => {
                if (e.target.value && e.target.value !== task.stageId) {
                  onMove(task.id, e.target.value);
                }
                e.target.value = ''; // Reset selection
              }}
              className="flex-1 text-xs bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium min-w-0"
              defaultValue=""
            >
              <option value="" disabled>Переместить в...</option>
              {stages
                .filter(stage => stage.id !== task.stageId)
                .map(stage => (
                  <option key={stage.id} value={stage.id}>
                    {stage.name}
                  </option>
                ))}
            </select>
            
            {/* Approve Button (if stage requires approval) */}
            {onApprove && stages.find(s => s.id === task.stageId)?.requiresApproval && (
              <button
                onClick={() => onApprove(task.id)}
                className="px-2 py-1 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-green-700 rounded-lg text-xs font-bold transition-all duration-200 shadow-sm hover:shadow-md flex-shrink-0"
                title="Подтвердить задачу"
              >
                ✓
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;