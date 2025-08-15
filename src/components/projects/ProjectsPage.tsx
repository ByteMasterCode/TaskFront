import React, { useState, useEffect } from 'react';
import {
  FolderOpen,
  Users,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Star,
  MoreHorizontal,
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  Settings,
  Trash2,
  Edit,
  Eye
} from 'lucide-react';
import { Project } from '../types';
import { apiService } from '../../services/api';
import CreateProjectModal from './CreateProjectModal';
import BoardsView from '../boards/BoardsView';

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await apiService.getProjects();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки проектов');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (data: { name: string; description?: string; key: string }) => {
    try {
      const newProject = await apiService.createProject(data);
      setProjects(prev => [newProject, ...prev]);
      setShowCreateModal(false);
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот проект?')) return;
    
    try {
      await apiService.deleteProject(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления проекта');
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedProject) {
    return (
      <BoardsView 
        project={selectedProject} 
        onBack={() => setSelectedProject(null)} 
      />
    );
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка проектов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Мои проекты</h1>
            <p className="text-gray-600">Управляйте всеми своими проектами в одном месте</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="h-5 w-5" />
            <span>Новый проект</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <FolderOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
                <p className="text-sm text-gray-600">Всего проектов</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-600">Активных</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-600">Участников</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-600">Задач</p>
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
                placeholder="Поиск проектов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm w-80"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'grid' ? 'bg-emerald-100 text-emerald-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Grid3X3 className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'list' ? 'bg-emerald-100 text-emerald-600' : 'text-gray-600 hover:bg-gray-100'
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

      {/* Projects Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-3xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 cursor-pointer group overflow-hidden transform hover:-translate-y-1"
            >
              {/* Project Header */}
              <div className="h-40 bg-gradient-to-br from-blue-500 to-purple-600 p-6 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-4 right-4 w-20 h-20 border-2 border-white rounded-full"></div>
                  <div className="absolute bottom-4 left-4 w-16 h-16 border border-white rounded-lg rotate-45"></div>
                </div>
                
                <div className="flex items-start justify-between relative z-10">
                  <div className="text-white flex-1">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                        <FolderOpen className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-white/80 text-sm font-medium">{project.key}</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-2 group-hover:scale-105 transition-transform duration-300 leading-tight">
                      {project.name}
                    </h3>
                    <div className="flex items-center space-x-4 text-white/90 text-sm">
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{project.members?.length || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(project.createdAt).toLocaleDateString('ru-RU')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
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
              </div>

              {/* Project Content */}
              <div className="p-6">
                <p className="text-gray-600 text-sm mb-6 line-clamp-2 leading-relaxed">
                  {project.description || 'Описание проекта отсутствует'}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 text-center">
                    <div className="text-lg font-bold text-blue-600">{project.boards?.length || 0}</div>
                    <div className="text-xs text-blue-600 font-medium">Досок</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 text-center">
                    <div className="text-lg font-bold text-green-600">0</div>
                    <div className="text-xs text-green-600 font-medium">Задач</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 text-center">
                    <div className="text-lg font-bold text-purple-600">{project.members?.length || 0}</div>
                    <div className="text-xs text-purple-600 font-medium">Участников</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedProject(project)}
                    className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Открыть</span>
                  </button>
                  <button className="bg-gray-50 hover:bg-gray-100 text-gray-700 p-2 rounded-lg transition-colors">
                    <Settings className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(project.id);
                    }}
                    className="bg-red-50 hover:bg-red-100 text-red-700 p-2 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
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
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Проект</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Ключ</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Участники</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Создан</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-900">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProjects.map((project) => (
                  <tr
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <FolderOpen className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{project.name}</h3>
                          <p className="text-sm text-gray-600">{project.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono">
                        {project.key}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-900">{project.members?.length || 0}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-900">
                        {new Date(project.createdAt).toLocaleDateString('ru-RU')}
                      </span>
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

      {filteredProjects.length === 0 && !loading && (
        <div className="text-center py-12">
          <FolderOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Проекты не найдены</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery ? 'Попробуйте изменить параметры поиска' : 'Создайте свой первый проект'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium"
            >
              Создать проект
            </button>
          )}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateProject}
        />
      )}
    </div>
  );
};

export default ProjectsPage;