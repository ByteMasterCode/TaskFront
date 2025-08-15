import React, { useState } from 'react';
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Clock, CheckSquare } from 'lucide-react';
import { TASK_PRIORITIES, TASK_STATUSES } from '../../constants';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  assignee?: string;
}

const TasksPage = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Разработать новую функцию',
      description: 'Создать систему уведомлений для пользователей',
      status: 'in-progress',
      priority: 'high',
      dueDate: '2025-01-20',
      assignee: 'Иван Иванов'
    },
    {
      id: '2',
      title: 'Исправить баги',
      description: 'Устранить проблемы с авторизацией',
      status: 'todo',
      priority: 'medium',
      dueDate: '2025-01-18',
      assignee: 'Мария Петрова'
    },
    {
      id: '3',
      title: 'Обновить документацию',
      description: 'Добавить описание новых API методов',
      status: 'completed',
      priority: 'low',
      dueDate: '2025-01-15',
      assignee: 'Алексей Сидоров'
    }
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'todo': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || task.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Задачи</h1>
          <p className="text-gray-600 mt-1">Управляйте своими задачами эффективно</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
        >
          <Plus className="w-5 h-5" />
          <span>Новая задача</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Поиск задач..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
              >
                <option value="all">Все статусы</option>
                <option value="todo">К выполнению</option>
                <option value="in-progress">В процессе</option>
                <option value="completed">Завершено</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map((task) => (
          <div key={task.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">{task.title}</h3>
                <div className="relative">
                  <button className="text-gray-400 hover:text-gray-600 p-1">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{task.description}</p>
              
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                  {task.priority === 'high' ? 'Высокий' : task.priority === 'medium' ? 'Средний' : 'Низкий'}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                  {task.status === 'completed' ? 'Завершено' : task.status === 'in-progress' ? 'В процессе' : 'К выполнению'}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(task.dueDate).toLocaleDateString('ru-RU')}</span>
                </div>
                {task.assignee && (
                  <span className="font-medium">{task.assignee}</span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                  <Edit className="w-4 h-4" />
                  <span>Редактировать</span>
                </button>
                <button className="bg-red-50 hover:bg-red-100 text-red-700 p-2 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <CheckSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Задачи не найдены</h3>
          <p className="text-gray-500">Попробуйте изменить параметры поиска или создайте новую задачу</p>
        </div>
      )}
    </div>
  );
};

export default TasksPage;