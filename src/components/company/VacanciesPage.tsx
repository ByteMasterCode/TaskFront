// src/services/hrApi.ts

import { AuthManager } from '../utils/auth';
import {
  Department,
  Worker,
  Attendance,
  Vacancy,
  Candidate,
  Interview,
  SalaryCalculation,
  PieceworkPayment,
  PaymentType,
  WorkerStatus,
  AttendanceStatus,
  CandidateStatus,
  VacancyStatus,
  InterviewStatus
} from '../types';

const BASE_URL = 'https://ehikchi.online';

class HRApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const init: RequestInit = { ...options };

    if (init.body && !(init.headers as any)?.['Content-Type']) {
      init.headers = {
        ...(init.headers || {}),
        'Content-Type': 'application/json',
      };
    }

    const response = await AuthManager.apiRequest(`${BASE_URL}${endpoint}`, init);

    if (!response.ok) {
      let message = `HTTP ${response.status}`;
      try {
        const err = await response.json();
        message = err?.message || message;
      } catch {}
      throw new Error(message);
    }

    const text = await response.text();
    if (!text) return undefined as unknown as T;

    try {
      return JSON.parse(text) as T;
    } catch {
      return undefined as unknown as T;
    }
  }

  // ---------- DEPARTMENTS ----------
  getDepartments(parentId?: string, status?: string): Promise<Department[]> {
    const params = new URLSearchParams();
    if (parentId) params.set('parentId', parentId);
    if (status) params.set('status', status);
    const query = params.toString();
    return this.request<Department[]>(`/workers/department${query ? `?${query}` : ''}`);
  }

  getDepartmentHierarchy(): Promise<Department[]> {
    console.log('Making API request to /workers/department/hierarchy');
    return this.request<Department[]>('/workers/department/hierarchy').catch(() => {
      // Заглушка, пока API не реализован
      console.log('API not implemented, using mock data');
      return [
        {
          id: 'dept-1',
          name: 'IT отдел',
          description: 'Отдел информационных технологий',
          parentId: null,
          status: 'active' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          children: [
            {
              id: 'dept-1-1',
              name: 'Разработка',
              description: 'Команда разработчиков',
              parentId: 'dept-1',
              status: 'active' as const,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              children: [],
              workers: []
            },
            {
              id: 'dept-1-2',
              name: 'QA',
              description: 'Отдел тестирования',
              parentId: 'dept-1',
              status: 'active' as const,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              children: [],
              workers: []
            }
          ],
          workers: []
        },
        {
          id: 'dept-2',
          name: 'Отдел продаж',
          description: 'Команда по работе с клиентами',
          parentId: null,
          status: 'active' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          children: [],
          workers: []
        }
      ];
    });
  }

  createDepartment(data: {
    name: string;
    description?: string;
    parentId?: string | null;
    status?: string;
  }): Promise<Department> {
    console.log('Making API request to create department:', data);
    return this.request<Department>('/workers/department', {
      method: 'POST',
      body: JSON.stringify(data)
    }).catch(() => {
      // Заглушка для создания отдела
      console.log('Create department API not implemented, using mock response');
      return {
        id: `dept-${Date.now()}`,
        name: data.name,
        description: data.description,
        parentId: data.parentId,
        status: data.status || 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        children: [],
        workers: []
      } as Department;
    });
  }

  updateDepartment(id: string, data: Partial<Department>): Promise<Department> {
    console.log('Making API request to update department:', id, data);
    return this.request<Department>(`/workers/department/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }).catch(() => {
      // Заглушка для обновления отдела
      console.log('Update department API not implemented, using mock response');
      return {
        ...data,
        id,
        updatedAt: new Date().toISOString()
      } as Department;
    });
  }

  deleteDepartment(id: string): Promise<void> {
    console.log('Making API request to delete department:', id);
    return this.request<void>(`/workers/department/${id}`, {
      method: 'DELETE'
    }).catch(() => {
      // Заглушка для удаления отдела
      console.log('Delete department API not implemented, using mock response');
      return undefined as unknown as void;
    });
  }

  // ---------- WORKERS ----------
  getWorkers(departmentId?: string, status?: WorkerStatus): Promise<Worker[]> {
    const params = new URLSearchParams();
    if (departmentId) params.set('departmentId', departmentId);
    if (status) params.set('status', status);
    const query = params.toString();
    console.log('Making API request to get workers');
    return this.request<Worker[]>(`/workers/worker${query ? `?${query}` : ''}`).catch(() => {
      // Заглушка для списка сотрудников
      console.log('Get workers API not implemented, using mock data');
      return [
        {
          id: 'worker-1',
          employeeId: 'EMP001',
          firstName: 'Иван',
          lastName: 'Иванов',
          middleName: 'Иванович',
          phone: '+998901234567',
          email: 'ivan@company.com',
          birthDate: '1990-05-15',
          hireDate: '2023-01-15',
          departmentId: 'dept-1-1', // Разработка
          position: 'Senior Developer',
          paymentType: 'salary' as PaymentType,
          baseSalary: 120000,
          status: 'active' as WorkerStatus,
          notes: 'Опытный разработчик с хорошими навыками',
          createdAt: '2023-01-15T09:00:00Z',
          updatedAt: '2023-01-15T09:00:00Z'
        },
        {
          id: 'worker-2',
          employeeId: 'EMP002',
          firstName: 'Мария',
          lastName: 'Петрова',
          phone: '+998901234568',
          email: 'maria@company.com',
          hireDate: '2023-03-01',
          departmentId: 'dept-1-2', // QA
          position: 'QA Engineer',
          paymentType: 'salary' as PaymentType,
          baseSalary: 80000,
          status: 'active' as WorkerStatus,
          createdAt: '2023-03-01T09:00:00Z',
          updatedAt: '2023-03-01T09:00:00Z'
        },
        {
          id: 'worker-3',
          employeeId: 'EMP003',
          firstName: 'Алексей',
          lastName: 'Сидоров',
          phone: '+998901234569',
          hireDate: '2023-06-01',
          departmentId: 'dept-2', // Отдел продаж
          position: 'Sales Manager',
          paymentType: 'mixed' as PaymentType,
          baseSalary: 60000,
          hourlyRate: 500,
          status: 'vacation' as WorkerStatus,
          notes: 'В отпуске до 25 января',
          createdAt: '2023-06-01T09:00:00Z',
          updatedAt: '2023-06-01T09:00:00Z'
        }
      ] as Worker[];
    });
  }

  getWorker(id: string): Promise<Worker> {
    return this.request<Worker>(`/workers/worker/${id}`);
  }

  createWorker(data: {
    employeeId: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    phone: string;
    email?: string;
    birthDate?: string;
    hireDate: string;
    departmentId: string;
    position: string;
    paymentType: PaymentType;
    baseSalary?: number;
    hourlyRate?: number;
    pieceRate?: number;
    notes?: string;
  }): Promise<Worker> {
    console.log('Making API request to create worker:', data);
    return this.request<Worker>('/workers/worker', {
      method: 'POST',
      body: JSON.stringify(data)
    }).catch(() => {
      // Заглушка для создания сотрудника
      console.log('Create worker API not implemented, using mock response');
      return {
        id: `worker-${Date.now()}`,
        employeeId: data.employeeId,
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName,
        phone: data.phone,
        email: data.email,
        birthDate: data.birthDate,
        hireDate: data.hireDate,
        departmentId: data.departmentId,
        position: data.position,
        paymentType: data.paymentType,
        baseSalary: data.baseSalary,
        hourlyRate: data.hourlyRate,
        pieceRate: data.pieceRate,
        status: 'active' as WorkerStatus,
        notes: data.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Worker;
    });
  }

  updateWorker(id: string, data: Partial<Worker>): Promise<Worker> {
    console.log('Making API request to update worker:', id, data);
    return this.request<Worker>(`/workers/worker/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }).catch(() => {
      // Заглушка для обновления сотрудника
      console.log('Update worker API not implemented, using mock response');
      return {
        ...data,
        id,
        updatedAt: new Date().toISOString()
      } as Worker;
    });
  }

  transferWorker(data: {
    workerId: string;
    newDepartmentId: string;
    newPosition: string;
    effectiveDate: string;
    reason: string;
  }): Promise<void> {
    console.log('Making API request to transfer worker:', data);
    return this.request<void>('/workers/worker/transfer', {
      method: 'POST',
      body: JSON.stringify(data)
    }).catch(() => {
      // Заглушка для перевода сотрудника
      console.log('Transfer worker API not implemented, using mock response');
      return undefined as unknown as void;
    });
  }

  dismissWorker(data: {
    workerId: string;
    dismissalDate: string;
    reason: string;
  }): Promise<void> {
    console.log('Making API request to dismiss worker:', data);
    return this.request<void>('/workers/worker/dismiss', {
      method: 'POST',
      body: JSON.stringify(data)
    }).catch(() => {
      // Заглушка для увольнения сотрудника
      console.log('Dismiss worker API not implemented, using mock response');
      return undefined as unknown as void;
    });
  }

  // ---------- ATTENDANCE ----------
  createAttendance(data: {
    workerId: string;
    date: string;
    checkIn?: string;
    checkOut?: string;
    scheduledStart: string;
    scheduledEnd: string;
    status: AttendanceStatus;
    hoursWorked?: number;
    overtimeHours?: number;
    penaltyAmount?: number;
    penaltyReason?: string;
    notes?: string;
  }): Promise<Attendance> {
    return this.request<Attendance>('/workers/attendance', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  updateAttendance(id: string, data: Partial<Attendance>): Promise<Attendance> {
    return this.request<Attendance>(`/workers/attendance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  bulkCreateAttendance(data: {
    date: string;
    workerIds: string[];
    status: AttendanceStatus;
    notes?: string;
  }): Promise<void> {
    return this.request<void>('/workers/attendance/bulk', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  markAttendance(workerId: string, date: string, checkIn?: string, checkOut?: string): Promise<void> {
    const params = new URLSearchParams({ date });
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    return this.request<void>(`/workers/attendance/mark/${workerId}?${params.toString()}`, {
      method: 'POST'
    });
  }

  markAbsent(workerId: string, date: string, reason: string): Promise<void> {
    const params = new URLSearchParams({ date, reason });
    return this.request<void>(`/workers/attendance/absent/${workerId}?${params.toString()}`, {
      method: 'POST'
    });
  }

  getWorkerAttendance(workerId: string, startDate: string, endDate: string): Promise<Attendance[]> {
    const params = new URLSearchParams({ startDate, endDate });
    return this.request<Attendance[]>(`/workers/attendance/worker/${workerId}?${params.toString()}`);
  }

  getDepartmentAttendance(departmentId: string, date: string): Promise<Attendance[]> {
    return this.request<Attendance[]>(`/workers/attendance/department/${departmentId}?date=${date}`);
  }

  getAttendanceReport(departmentId: string, startDate: string, endDate: string): Promise<any> {
    const params = new URLSearchParams({ startDate, endDate });
    return this.request<any>(`/workers/attendance/report/${departmentId}?${params.toString()}`);
  }

  getWorkerPenalties(workerId: string, startDate: string, endDate: string): Promise<any> {
    const params = new URLSearchParams({ startDate, endDate });
    return this.request<any>(`/workers/attendance/penalties/${workerId}?${params.toString()}`);
  }

  // ---------- VACANCIES ----------
  getVacancies(departmentId?: string, status?: VacancyStatus): Promise<Vacancy[]> {
    const params = new URLSearchParams();
    if (departmentId) params.set('departmentId', departmentId);
    if (status) params.set('status', status);
    const query = params.toString();
    console.log('Making API request to get vacancies');
    return this.request<Vacancy[]>(`/workers/vacancies${query ? `?${query}` : ''}`).catch(() => {
      // Заглушка для списка вакансий
      console.log('Get vacancies API not implemented, using mock data');
      return [
        {
          id: 'vacancy-1',
          title: 'Frontend разработчик',
          description: 'Ищем опытного Frontend разработчика для работы с React и TypeScript',
          departmentId: 'dept-1-1', // Разработка
          position: 'Senior Frontend Developer',
          status: 'open' as VacancyStatus,
          quantity: 2,
          salaryFrom: 80000,
          salaryTo: 120000,
          paymentType: 'salary' as any,
          requirements: '• Опыт работы от 3 лет\n• Знание React, TypeScript\n• Английский язык B2+',
          responsibilities: '• Разработка веб-приложений\n• Участие в code review\n• Менторинг junior разработчиков',
          openDate: '2025-01-10',
          createdAt: '2025-01-10T09:00:00Z',
          updatedAt: '2025-01-10T09:00:00Z',
          candidates: [
            {
              id: 'candidate-1',
              firstName: 'Анна',
              lastName: 'Смирнова',
              phone: '+998901111111',
              email: 'anna@example.com',
              birthDate: '1995-03-20',
              vacancyId: 'vacancy-1',
                    },
          ]
        }
        {
          id: 'vacancy-2',
          title: 'QA Engineer',
          description: 'Требуется QA инженер для тестирования веб-приложений',
          departmentId: 'dept-1-2', // QA
          position: 'QA Engineer',
          status: 'in_progress' as VacancyStatus,
          quantity: 1,
          salaryFrom: 60000,
          salaryTo: 90000,
          paymentType: 'salary' as any,
          requirements: '• Опыт тестирования от 2 лет\n• Знание автотестов\n• Внимательность к деталям',
          responsibilities: '• Функциональное тестирование\n• Написание автотестов\n• Работа с багтрекерами',
          openDate: '2025-01-05',
          createdAt: '2025-01-05T09:00:00Z',
          updatedAt: '2025-01-05T09:00:00Z',
          candidates: []
        },
        {
          id: 'vacancy-3',
          title: 'Менеджер по продажам',
          description: 'Ищем активного менеджера для работы с клиентами',
          departmentId: 'dept-2', // Отдел продаж
          position: 'Sales Manager',
          status: 'closed' as VacancyStatus,
          quantity: 1,
          salaryFrom: 40000,
          salaryTo: 80000,
          paymentType: 'mixed' as any,
          requirements: '• Опыт продаж от 1 года\n• Коммуникабельность\n• Знание CRM систем',
          responsibilities: '• Работа с клиентами\n• Ведение переговоров\n• Достижение KPI',
          openDate: '2024-12-15',
          closeDate: '2025-01-08',
          createdAt: '2024-12-15T09:00:00Z',
          updatedAt: '2025-01-08T09:00:00Z',
          candidates: []
        }
      ] as Vacancy[];
    });
  }

  getVacancy(id: string): Promise<Vacancy> {
    console.log('Making API request to get vacancy:', id);
    return this.request<Vacancy>(`/workers/vacancies/${id}`).catch(() => {
      // Заглушка для получения вакансии
      console.log('Get vacancy API not implemented, using mock response');
      const mockVacancy = {
        id,
        title: 'Frontend разработчик',
        description: 'Ищем опытного Frontend разработчика',
        departmentId: 'dept-1-1',
        position: 'Senior Frontend Developer',
        status: 'open' as any,
        quantity: 2,
        salaryFrom: 80000,
        salaryTo: 120000,
        paymentType: 'salary' as any,
        openDate: '2025-01-10',
        createdAt: '2025-01-10T09:00:00Z',
        updatedAt: '2025-01-10T09:00:00Z',
        candidates: []
      } as Vacancy;
      return mockVacancy;
    });
  }

  createVacancy(data: {
    title: string;
    description: string;
    departmentId: string;
    position: string;
    quantity: number;
    salaryFrom?: number;
    salaryTo?: number;
    paymentType: PaymentType;
    requirements?: string;
    responsibilities?: string;
    openDate: string;
  }): Promise<Vacancy> {
    console.log('Making API request to create vacancy:', data);
    return this.request<Vacancy>('/workers/vacancies', {
      method: 'POST',
      body: JSON.stringify(data)
    }).catch(() => {
      // Заглушка для создания вакансии
      console.log('Create vacancy API not implemented, using mock response');
      return {
        id: `vacancy-${Date.now()}`,
        title: data.title,
        description: data.description,
        departmentId: data.departmentId,
        position: data.position,
        status: 'open' as VacancyStatus,
        quantity: data.quantity,
        salaryFrom: data.salaryFrom,
        salaryTo: data.salaryTo,
        paymentType: data.paymentType,
        requirements: data.requirements,
        responsibilities: data.responsibilities,
        openDate: data.openDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        candidates: []
      } as Vacancy;
    });
  }

  updateVacancy(id: string, data: Partial<Vacancy>): Promise<Vacancy> {
    console.log('Making API request to update vacancy:', id, data);
    return this.request<Vacancy>(`/workers/vacancies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }).catch(() => {
      // Заглушка для обновления вакансии
      console.log('Update vacancy API not implemented, using mock response');
      return {
        ...data,
        id,
        updatedAt: new Date().toISOString()
      } as Vacancy;
    });
  }

  deleteVacancy(id: string): Promise<void> {
    console.log('Making API request to delete vacancy:', id);
    return this.request<void>(`/workers/vacancies/${id}`, {
      method: 'DELETE'
    }).catch(() => {
      // Заглушка для удаления вакансии
      console.log('Delete vacancy API not implemented, using mock response');
      return undefined as unknown as void;
    });
  }

  getVacancyStats(id: string): Promise<any> {
    return this.request<any>(`/workers/vacancies/${id}/stats`);
  }

  // ---------- CANDIDATES ----------
  getCandidates(vacancyId?: string, status?: CandidateStatus): Promise<Candidate[]> {
    const params = new URLSearchParams();
    if (vacancyId) params.set('vacancyId', vacancyId);
    if (status) params.set('status', status);
    const query = params.toString();
    console.log('Making API request to get candidates');
    return this.request<Candidate[]>(`/workers/candidates${query ? `?${query}` : ''}`).catch(() => {
      // Заглушка для списка кандидатов
      console.log('Get candidates API not implemented, using mock data');
      return [
        {
          id: 'candidate-1',
          firstName: 'Анна',
          lastName: 'Смирнова',
          phone: '+998901111111',
          email: 'anna@example.com',
          birthDate: '1995-03-20',
          vacancyId: 'vacancy-1',
          status: 'new' as CandidateStatus,
          resume: 'https://example.com/resume1.pdf',
          experience: '• 4 года в веб-разработке\n• React, TypeScript, Node.js\n• Работа в Agile команде',
          education: '• ТГТУ, Информатика и ВТ\n• Курсы по React\n• Сертификат AWS',
          expectedSalary: 90000,
          rating: 8,
          notes: 'Очень перспективный кандидат',
          createdAt: '2025-01-12T10:00:00Z',
          updatedAt: '2025-01-12T10:00:00Z'
        },
        {
          id: 'candidate-2',
          firstName: 'Дмитрий',
          lastName: 'Козлов',
          phone: '+998902222222',
          email: 'dmitry@example.com',
          vacancyId: 'vacancy-1',
          status: 'interviewed' as CandidateStatus,
          experience: '• 2 года Junior разработчик\n• Знание JavaScript, HTML, CSS\n• Желание развиваться',
          education: '• Самообразование\n• Онлайн курсы\n• Pet проекты',
          expectedSalary: 70000,
          rating: 6,
          createdAt: '2025-01-10T14:30:00Z',
          updatedAt: '2025-01-10T14:30:00Z'
        }
      ] as Candidate[];
    });
  }

  getCandidate(id: string): Promise<Candidate> {
    return this.request<Candidate>(`/workers/candidates/${id}`);
  }

  createCandidate(data: {
    firstName: string;
    lastName: string;
    middleName?: string;
    phone: string;
    email?: string;
    birthDate?: string;
    vacancyId: string;
    status?: CandidateStatus;
    resume?: string;
    experience?: string;
    education?: string;
    expectedSalary?: number;
    notes?: string;
  }): Promise<Candidate> {
    console.log('Making API request to create candidate:', data);
    return this.request<Candidate>('/workers/candidates', {
      method: 'POST',
      body: JSON.stringify(data)
    }).catch(() => {
      // Заглушка для создания кандидата
      console.log('Create candidate API not implemented, using mock response');
      return {
        id: `candidate-${Date.now()}`,
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName,
        phone: data.phone,
        email: data.email,
        birthDate: data.birthDate,
        vacancyId: data.vacancyId,
        status: data.status || 'new',
        resume: data.resume,
        experience: data.experience,
        education: data.education,
        expectedSalary: data.expectedSalary,
        notes: data.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Candidate;
    });
  }

  updateCandidateStatus(id: string, status: CandidateStatus, notes?: string): Promise<Candidate> {
    const params = new URLSearchParams({ status });
    if (notes) params.set('notes', notes);
    console.log('Making API request to update candidate status:', id, status);
    return this.request<Candidate>(`/workers/candidates/${id}/status?${params.toString()}`, {
      method: 'PUT'
    }).catch(() => {
      // Заглушка для обновления статуса кандидата
      console.log('Update candidate status API not implemented, using mock response');
      return {
        id,
        status,
        updatedAt: new Date().toISOString()
      } as Candidate;
    });
  }

  rejectCandidate(id: string, reason: string): Promise<void> {
    return this.request<void>(`/workers/candidates/${id}/reject?reason=${encodeURIComponent(reason)}`, {
      method: 'POST'
    });
  }

  rateCandidate(id: string, rating: number, notes?: string): Promise<void> {
    const params = new URLSearchParams({ rating: rating.toString() });
    if (notes) params.set('notes', notes);
    console.log('Making API request to rate candidate:', id, rating);
    return this.request<void>(`/workers/candidates/${id}/rate?${params.toString()}`, {
      method: 'POST'
    }).catch(() => {
      // Заглушка для оценки кандидата
      console.log('Rate candidate API not implemented, using mock response');
      return undefined as unknown as void;
    });
  }

  hireCandidate(id: string, workerData: {
    employeeId: string;
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    birthDate?: string;
    departmentId: string;
    position: string;
    paymentType: PaymentType;
    baseSalary?: number;
  }): Promise<Worker> {
    return this.request<Worker>(`/workers/candidates/${id}/hire`, {
      method: 'POST',
      body: JSON.stringify(workerData)
    });
  }

  // ---------- INTERVIEWS ----------
  getInterviews(candidateId?: string, status?: InterviewStatus): Promise<Interview[]> {
    const params = new URLSearchParams();
    if (candidateId) params.set('candidateId', candidateId);
    if (status) params.set('status', status);
    const query = params.toString();
    return this.request<Interview[]>(`/workers/interviews${query ? `?${query}` : ''}`);
  }

  createInterview(data: {
    candidateId: string;
    scheduledDate: string;
    interviewerName: string;
    interviewerPosition: string;
    notes?: string;
  }): Promise<Interview> {
    return this.request<Interview>('/workers/interviews', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  completeInterview(id: string, data: {
    actualDate: string;
    status: InterviewStatus;
    technicalScore?: number;
    softSkillsScore?: number;
    culturalFitScore?: number;
    overallScore?: number;
    recommendation?: 'hire' | 'reject' | 'consider';
    feedback?: string;
  }): Promise<Interview> {
    return this.request<Interview>(`/workers/interviews/${id}/complete`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // ---------- SALARY ----------
  calculateSalary(workerId: string, period: string): Promise<SalaryCalculation> {
    return this.request<SalaryCalculation>(`/workers/salary/calculate/${workerId}?period=${period}`, {
      method: 'POST'
    });
  }

  approveSalary(salaryId: string): Promise<void> {
    return this.request<void>(`/workers/salary/approve/${salaryId}`, {
      method: 'POST'
    });
  }

  paySalary(salaryId: string, paymentDate: string): Promise<void> {
    return this.request<void>(`/workers/salary/pay/${salaryId}?paymentDate=${paymentDate}`, {
      method: 'POST'
    });
  }

  getWorkerSalary(workerId: string, period: string): Promise<SalaryCalculation[]> {
    return this.request<SalaryCalculation[]>(`/workers/salary/worker/${workerId}?period=${period}`);
  }

  getSalaryReport(departmentId: string, period: string): Promise<any> {
    return this.request<any>(`/workers/salary/report/${departmentId}?period=${period}`);
  }

  // ---------- PIECEWORK ----------
  calculatePiecework(workerId: string, period: string, data: {
    workType: string;
    quantity: number;
    pieceRate: number;
    qualityBonus?: number;
  }): Promise<PieceworkPayment> {
    return this.request<PieceworkPayment>(`/workers/piecework/calculate/${workerId}?period=${period}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  approvePiecework(paymentId: string): Promise<void> {
    return this.request<void>(`/workers/piecework/approve/${paymentId}`, {
      method: 'POST'
    });
  }

  payPiecework(paymentId: string, paymentDate: string): Promise<void> {
    return this.request<void>(`/workers/piecework/pay/${paymentId}?paymentDate=${paymentDate}`, {
      method: 'POST'
    });
  }

  // ---------- REPORTS ----------
  getRecruitmentReport(departmentId: string, startDate: string, endDate: string): Promise<any> {
    const params = new URLSearchParams({ departmentId, startDate, endDate });
    return this.request<any>(`/workers/recruitment/report?${params.toString()}`);
  }

}

export const hrApiService = new HRApiService();