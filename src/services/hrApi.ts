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
    return this.request<Department[]>('/workers/department/hierarchy');
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
    });
  }

  updateDepartment(id: string, data: Partial<Department>): Promise<Department> {
    return this.request<Department>(`/workers/department/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // ---------- WORKERS ----------
  getWorkers(departmentId?: string, status?: WorkerStatus): Promise<Worker[]> {
    const params = new URLSearchParams();
    if (departmentId) params.set('departmentId', departmentId);
    if (status) params.set('status', status);
    const query = params.toString();
    return this.request<Worker[]>(`/workers${query ? `?${query}` : ''}`);
  }

  getWorker(id: string): Promise<Worker> {
    return this.request<Worker>(`/workers/${id}`);
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
    return this.request<Worker>('/workers', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  updateWorker(id: string, data: Partial<Worker>): Promise<Worker> {
    return this.request<Worker>(`/workers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  transferWorker(data: {
    workerId: string;
    newDepartmentId: string;
    newPosition: string;
    effectiveDate: string;
    reason: string;
  }): Promise<void> {
    return this.request<void>('/workers/transfer', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  dismissWorker(data: {
    workerId: string;
    dismissalDate: string;
    reason: string;
  }): Promise<void> {
    return this.request<void>('/workers/dismiss', {
      method: 'POST',
      body: JSON.stringify(data)
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
    return this.request<Vacancy[]>(`/workers/vacancies${query ? `?${query}` : ''}`);
  }

  getVacancy(id: string): Promise<Vacancy> {
    return this.request<Vacancy>(`/workers/vacancies/${id}`);
  }

  createVacancy(data: {
    title: string;
    description: string;
    departmentId: string;
    position: string;
    status?: VacancyStatus;
    quantity: number;
    salaryFrom?: number;
    salaryTo?: number;
    paymentType: PaymentType;
    requirements?: string;
    responsibilities?: string;
    openDate: string;
  }): Promise<Vacancy> {
    return this.request<Vacancy>('/workers/vacancies', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  updateVacancy(id: string, data: Partial<Vacancy>): Promise<Vacancy> {
    return this.request<Vacancy>(`/workers/vacancies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
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
    return this.request<Candidate[]>(`/workers/candidates${query ? `?${query}` : ''}`);
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
    return this.request<Candidate>('/workers/candidates', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  updateCandidateStatus(id: string, status: CandidateStatus, notes?: string): Promise<Candidate> {
    const params = new URLSearchParams({ status });
    if (notes) params.set('notes', notes);
    return this.request<Candidate>(`/workers/candidates/${id}/status?${params.toString()}`, {
      method: 'PUT'
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
    return this.request<void>(`/workers/candidates/${id}/rate?${params.toString()}`, {
      method: 'POST'
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