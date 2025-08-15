import React, { useState, useEffect } from 'react';
import {
  FolderOpen,
  Plus,
} from 'lucide-react';
import { Project } from '../types';
import { apiService } from '../../services/api';
import CreateProjectModal from './CreateProjectModal';
import BoardsView from '../boards/BoardsView';
import ProjectStats from './ProjectStats';
import ProjectFilters from './ProjectFilters';
import ProjectCard from './ProjectCard';
import ProjectList from './ProjectList';

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
        <ProjectStats projects={projects} />

        {/* Filters */}
        <ProjectFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
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
            <ProjectCard
              key={project.id}
              project={project}
              onSelect={setSelectedProject}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>
      ) : (
        <ProjectList
          projects={filteredProjects}
          onSelect={setSelectedProject}
        />
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