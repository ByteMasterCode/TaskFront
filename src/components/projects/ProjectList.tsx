import React from 'react';
import { FolderOpen, MoreHorizontal } from 'lucide-react';
import { Project } from '../../types';

interface ProjectListProps {
  projects: Project[];
  onSelect: (project: Project) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, onSelect }) => {
  return (
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
            {projects.map((project) => (
              <tr
                key={project.id}
                onClick={() => onSelect(project)}
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
  );
};

export default ProjectList;