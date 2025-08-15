import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Coffee,
  Plane,
  Heart,
  Search,
  Filter,
  Download
} from 'lucide-react';
import { Attendance, Worker, Department, AttendanceStatus } from '../../types';
import { hrApiService } from '../../services/hrApi';

const AttendancePage: React.FC = () => {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterDepartment, setFilterDepartment] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<AttendanceStatus | ''>('');

  useEffect(() => {
    loadData();
  }, [selectedDate, filterDepartment]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [workersData, departmentsData] = await Promise.all([
        hrApiService.getWorkers(),
        hrApiService.getDepartments()
      ]);
      setWorkers(Array.isArray(workersData) ? workersData : []);
      setDepartments(Array.isArray(departmentsData) ? departmentsData : []);

      // Load attendance for selected department or all
      if (filterDepartment) {
        const attendanceData = await hrApiService.getDepartmentAttendance(filterDepartment, selectedDate);
        setAttendances(Array.isArray(attendanceData) ? attendanceData : []);
      } else {
        // For now, we'll load attendance for all workers (this might need optimization)
        setAttendances([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
      setWorkers([]);
      setDepartments([]);
      setAttendances([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case 'present': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'absent': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'late': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'early_leave': return <Clock className="h-5 w-5 text-orange-600" />;
      case 'sick_leave': return <Heart className="h-5 w-5 text-pink-600" />;
      case 'vacation': return <Coffee className="h-5 w-5 text-blue-600" />;
      case 'business_trip': return <Plane className="h-5 w-5 text-purple-600" />;
      default: return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800 border-green-200';
      case 'absent': return 'bg-red-100 text-red-800 border-red-200';
      case 'late': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'early_leave': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'sick_leave': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'vacation': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'business_trip': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: AttendanceStatus) => {
    switch (status) {
      case 'present': return 'Присутствует';
      case 'absent': return 'Отсутствует';
      case 'late': return 'Опоздал';
      case 'early_leave': return 'Ушел раньше';
      case 'sick_leave': return 'Больничный';
      case 'vacation': return 'Отпуск';
      case 'business_trip': return 'Командировка';
      default: return status;
    }
  };

  const filteredAttendances = attendances.filter(attendance => {
    const matchesStatus = !filterStatus || attendance.status === filterStatus;
    return matchesStatus;
  });

  const stats = {
    total: workers.length,
    present: attendances.filter(a => a.status === 'present').length,
    absent: attendances.filter(a => a.status === 'absent').length,
    late: attendances.filter(a => a.status === 'late').length,
    vacation: attendances.filter(a => a.status === 'vacation').length,
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка данных посещаемости...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Stats */}
      <div className="grid grid-cols-5 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Всего сотрудников</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.present}</p>
              <p className="text-sm text-gray-600">Присутствуют</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
              <XCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.absent}</p>
              <p className="text-sm text-gray-600">Отсутствуют</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.late}</p>
              <p className="text-sm text-gray-600">Опоздали</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Coffee className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.vacation}</p>
              <p className="text-sm text-gray-600">В отпуске</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-600" />
              <label className="text-sm font-medium text-gray-700">Дата:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Все отделы</option>
              {Array.isArray(departments) && departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as AttendanceStatus | '')}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Все статусы</option>
              <option value="present">Присутствует</option>
              <option value="absent">Отсутствует</option>
              <option value="late">Опоздал</option>
              <option value="early_leave">Ушел раньше</option>
              <option value="sick_leave">Больничный</option>
              <option value="vacation">Отпуск</option>
              <option value="business_trip">Командировка</option>
            </select>
          </div>
          <div className="flex items-center space-x-2 ml-auto">
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors">
              <Download className="h-4 w-4" />
              <span>Экспорт</span>
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

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Посещаемость на {new Date(selectedDate).toLocaleDateString('ru-RU')}
          </h3>
        </div>
        
        {filteredAttendances.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Сотрудник</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Отдел</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Приход</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Уход</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Часы</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Статус</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Штраф</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAttendances.map((attendance) => {
                  const worker = workers.find(w => w.id === attendance.workerId);
                  const department = departments.find(d => d.id === worker?.departmentId);
                  
                  return (
                    <tr key={attendance.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <Users className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {worker ? `${worker.firstName} ${worker.lastName}` : 'Неизвестно'}
                            </h3>
                            <p className="text-sm text-gray-500">{worker?.employeeId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-900">{department?.name || '—'}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-900 font-mono">
                          {attendance.checkIn || '—'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-900 font-mono">
                          {attendance.checkOut || '—'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-900">
                          {attendance.hoursWorked ? `${attendance.hoursWorked}ч` : '—'}
                          {attendance.overtimeHours ? ` (+${attendance.overtimeHours}ч)` : ''}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(attendance.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(attendance.status)}`}>
                            {getStatusLabel(attendance.status)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {attendance.penaltyAmount ? (
                          <div>
                            <span className="text-sm font-medium text-red-600">
                              {attendance.penaltyAmount} ₽
                            </span>
                            {attendance.penaltyReason && (
                              <p className="text-xs text-gray-500">{attendance.penaltyReason}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Нет данных о посещаемости</h3>
            <p className="text-gray-600 mb-4">
              {filterDepartment 
                ? 'Выберите отдел для просмотра посещаемости' 
                : 'Данные о посещаемости на выбранную дату отсутствуют'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;