import React from 'react';
import { FolderOpen, Users, Calendar, MoreHorizontal, Settings, Trash2, Eye } from 'lucide-react';
import { Project } from '../../types';

interface ProjectCardProps {
  project: Project;
  onSelect: (project: Project) => void;
  onDelete: (projectId: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect, onDelete }) => {
  return (
    <div
      onClick={() => onSelect(project)}
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
          <div className="flex-1 bg-blue-50 text-blue-700 py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 pointer-events-none">
            <Eye className="w-4 h-4" />
            <span>Нажмите для открытия</span>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              // Settings action
            }}
            className="bg-gray-50 hover:bg-gray-100 text-gray-700 p-2 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(project.id);
            }}
            className="bg-red-50 hover:bg-red-100 text-red-700 p-2 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;