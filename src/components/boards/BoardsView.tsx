import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  MoreHorizontal,
  Settings,
  Users,
  Calendar,
  Target,
  Grid3X3,
  List,
  Search,
  Filter
} from 'lucide-react';
import { Project, Board } from '../../types';
import { apiService } from '../../services/api';
import CreateBoardModal from './CreateBoardModal';
import KanbanBoard from './KanbanBoard';

interface BoardsViewProps {
  project: Project;
  onBack: () => void;
}

const BoardsView: React.FC<BoardsViewProps> = ({ project, onBack }) => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadBoards();
  }, [project.id]);

  const loadBoards = async () => {
    try {
      setLoading(true);
      const data = await apiService.getProjectBoards(project.id);
      setBoards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки досок');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (data: { name: string; description?: string; key: string }) => {
    try {
      const newBoard = await apiService.createBoard({
        ...data,
        projectId: project.id
      });
      setBoards(prev => [newBoard, ...prev]);
      setShowCreateModal(false);
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteBoard = async (boardId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту доску?')) return;
    
    try {
      await apiService.deleteBoard(boardId);
      setBoards(prev => prev.filter(b => b.id !== boardId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления доски');
    }
  };

  const filteredBoards = boards.filter(board =>
    board.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    board.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedBoard) {
    return (
      <KanbanBoard 
        board={selectedBoard} 
        project={project}
        onBack={() => setSelectedBoard(null)} 
      />
    );
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка досок...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {project.key}
                </span>
              </div>
              <p className="text-gray-600">{project.description || 'Управление досками проекта'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => {/* Add navigation logic here */}}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Users className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-5 w-5" />
              <span>Новая доска</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{boards.length}</p>
                <p className="text-sm text-gray-600">Досок</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <Grid3X3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-600">Задач</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{project.members?.length || 0}</p>
                <p className="text-sm text-gray-600">Участников</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-600">Активных</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск досок..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm w-80"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Grid3X3 className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Boards Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBoards.map((board) => (
            <div
              key={board.id}
              onClick={() => setSelectedBoard(board)}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 cursor-pointer group overflow-hidden transform hover:-translate-y-1"
            >
              {/* Board Header */}
              <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600 p-6 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-4 right-4 w-16 h-16 border-2 border-white rounded-lg rotate-12"></div>
                  <div className="absolute bottom-4 left-4 w-12 h-12 border border-white rounded-full"></div>
                </div>
                
                <div className="flex items-start justify-between relative z-10">
                  <div className="text-white flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-white/80 text-sm font-medium">{board.key}</span>
                    </div>
                    <h3 className="text-xl font-bold group-hover:scale-105 transition-transform duration-300 leading-tight">
                      {board.name}
                    </h3>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Show menu
                    }}
                    className="text-white/80 hover:text-white transition-colors duration-200"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Board Content */}
              <div className="p-6">
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                  {board.description || 'Описание доски отсутствует'}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-blue-600">{board.stages?.length || 0}</div>
                    <div className="text-xs text-blue-600 font-medium">Этапов</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-green-600">{board.tasks?.length || 0}</div>
                    <div className="text-xs text-green-600 font-medium">Задач</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-purple-600">{board.labels?.length || 0}</div>
                    <div className="text-xs text-purple-600 font-medium">Меток</div>
                  </div>
                </div>

                {/* Labels Preview */}
                {board.labels && board.labels.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {board.labels.slice(0, 3).map((label) => (
                      <span
                        key={label.id}
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{ 
                          backgroundColor: label.color + '20', 
                          color: label.color,
                          border: `1px solid ${label.color}40`
                        }}
                      >
                        {label.name}
                      </span>
                    ))}
                    {board.labels.length > 3 && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        +{board.labels.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <button className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-4 rounded-lg font-medium transition-colors">
                  Открыть доску
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Доска</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Ключ</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Этапы</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Задачи</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Метки</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-900">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBoards.map((board) => (
                  <tr
                    key={board.id}
                    onClick={() => setSelectedBoard(board)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                  >
                    <td className="py-4 px-6">
                      <div>
                        <h3 className="font-semibold text-gray-900">{board.name}</h3>
                        <p className="text-sm text-gray-600">{board.description}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono">
                        {board.key}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-900">{board.stages?.length || 0}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-900">{board.tasks?.length || 0}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-900">{board.labels?.length || 0}</span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Show menu
                        }}
                        className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredBoards.length === 0 && !loading && (
        <div className="text-center py-12">
          <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Доски не найдены</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery ? 'Попробуйте изменить параметры поиска' : 'Создайте первую доску для проекта'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium"
            >
              Создать доску
            </button>
          )}
        </div>
      )}

      {/* Create Board Modal */}
      {showCreateModal && (
        <CreateBoardModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateBoard}
          projectKey={project.key}
        />
      )}
    </div>
  );
};

export default BoardsView;