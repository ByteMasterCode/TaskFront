import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Grid3X3,
  List,
  Plus,
  MoreHorizontal,
  Phone,
  User,
  Calendar,
  Settings,
  Edit,
  Trash2,
  Eye,
  Shield,
  UserCheck,
  UserX
} from 'lucide-react';
import { User as UserType } from '../../types';
import { apiService } from '../../services/api';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await apiService.getUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) return;
    
    try {
      await apiService.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления пользователя');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.phone.includes(searchQuery) ||
                         user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.telegramUsername?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка пользователей...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Пользователи</h1>
            <p className="text-gray-600">Управление пользователями системы</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200">
            <Plus className="h-5 w-5" />
            <span>Добавить пользователя</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                <p className="text-sm text-gray-600">Всего пользователей</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.name).length}</p>
                <p className="text-sm text-gray-600">С именами</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.telegramUsername).length}</p>
                <p className="text-sm text-gray-600">С Telegram</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => {
                    const today = new Date();
                    const userDate = new Date(u.createdAt || '');
                    return userDate.toDateString() === today.toDateString();
                  }).length}
                </p>
                <p className="text-sm text-gray-600">Новых сегодня</p>
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
                placeholder="Поиск пользователей..."
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

      {/* Users Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
            >
              {/* User Header */}
              <div className="h-24 bg-gradient-to-br from-blue-500 to-purple-600 p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-2 right-2 w-12 h-12 border border-white rounded-full"></div>
                  <div className="absolute bottom-2 left-2 w-8 h-8 border border-white rounded-lg rotate-45"></div>
                </div>
                
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-white">
                      <p className="font-semibold text-sm truncate max-w-24">
                        {user.name || 'Без имени'}
                      </p>
                      <p className="text-xs text-white/80">
                        {user.telegramUsername ? `@${user.telegramUsername}` : 'Нет Telegram'}
                      </p>
                    </div>
                  </div>
                  <button className="text-white/80 hover:text-white transition-colors duration-200">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* User Content */}
              <div className="p-4">
                <div className="space-y-3">
                  {/* Phone */}
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 font-mono">{user.phone}</span>
                  </div>

                  {/* Registration Date */}
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('ru-RU') : 'Неизвестно'}
                    </span>
                  </div>

                  {/* Photo URL */}
                  {user.photoUrl && (
                    <div className="flex items-center space-x-2">
                      <img 
                        src={user.photoUrl} 
                        alt="Avatar" 
                        className="w-4 h-4 rounded-full"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <span className="text-sm text-gray-600">Есть фото</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-100">
                  <button className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-1 text-sm">
                    <Eye className="w-3 h-3" />
                    <span>Просмотр</span>
                  </button>
                  <button className="bg-gray-50 hover:bg-gray-100 text-gray-700 p-2 rounded-lg transition-colors">
                    <Edit className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={() => handleDeleteUser(user.id)}
                    className="bg-red-50 hover:bg-red-100 text-red-700 p-2 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
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
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Пользователь</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Телефон</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Telegram</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Регистрация</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-900">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{user.name || 'Без имени'}</h3>
                          <p className="text-sm text-gray-500">ID: {user.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-mono text-sm text-gray-900">{user.phone}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-900">
                        {user.telegramUsername ? `@${user.telegramUsername}` : '—'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-900">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('ru-RU') : '—'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-800 p-1 rounded transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredUsers.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Пользователи не найдены</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery ? 'Попробуйте изменить параметры поиска' : 'Пользователи появятся после регистрации'}
          </p>
        </div>
      )}
    </div>
  );
};

export default UsersPage;