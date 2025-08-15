// src/services/api.ts

import { AuthManager } from '../utils/auth';
import {
  Project,
  Board,
  Task,
  Label,
  WorkflowStage,
  TaskTransition,
  User,
  TaskLink,
  AutomationConfig,
} from '../types';

const BASE_URL = 'https://ehikchi.online';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const init: RequestInit = { ...options };

    // JSON by default
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

    // для void-эндпоинтов
    const text = await response.text();
    if (!text) return undefined as unknown as T;

    try {
      return JSON.parse(text) as T;
    } catch {
      return undefined as unknown as T;
    }
  }

  // ---------- Users ----------
  getUsers(): Promise<User[]> {
    return this.request<User[]>('/users');
  }
  getUser(id: string): Promise<User> {
    return this.request<User>(`/users/${id}`);
  }
  createUser(data: { phone: string; fullName?: string; telegramUsername?: string; photoUrl?: string }): Promise<User> {
    return this.request<User>('/users', { method: 'POST', body: JSON.stringify(data) });
  }
  updateUser(id: string, data: Partial<User>): Promise<User> {
    return this.request<User>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  deleteUser(id: string): Promise<void> {
    return this.request<void>(`/users/${id}`, { method: 'DELETE' });
  }
  findOrCreateUser(data: { phone: string; fullName?: string; telegramUsername?: string; photoUrl?: string }): Promise<User> {
    return this.request<User>('/users/find-or-create', { method: 'POST', body: JSON.stringify(data) });
  }

  // ---------- Projects ----------
  getProjects(): Promise<Project[]> {
    return this.request<Project[]>('/projects');
  }
  getProject(id: string): Promise<Project> {
    return this.request<Project>(`/projects/${id}`);
  }
  createProject(data: { name: string; description?: string; key: string }): Promise<Project> {
    return this.request<Project>('/projects', { method: 'POST', body: JSON.stringify(data) });
  }
  updateProject(id: string, data: Partial<Project>): Promise<Project> {
    return this.request<Project>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  deleteProject(id: string): Promise<void> {
    return this.request<void>(`/projects/${id}`, { method: 'DELETE' });
  }

  // ---------- Boards ----------
  getProjectBoards(projectId: string): Promise<Board[]> {
    return this.request<Board[]>(`/boards?projectId=${projectId}`);
  }
  getBoard(id: string): Promise<Board> {
    return this.request<Board>(`/boards/${id}`);
  }
  getBoardStages(boardId: string): Promise<WorkflowStage[]> {
    return this.request<WorkflowStage[]>(`/boards/${boardId}/stages`);
  }
  getBoardLabels(boardId: string): Promise<Label[]> {
    return this.request<Label[]>(`/boards/${boardId}/labels`);
  }
  createBoard(data: { projectId: string; name: string; description?: string; key: string }): Promise<Board> {
    return this.request<Board>('/boards', { method: 'POST', body: JSON.stringify(data) });
  }
  updateBoard(id: string, data: Partial<Board>): Promise<Board> {
    return this.request<Board>(`/boards/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  deleteBoard(id: string): Promise<void> {
    return this.request<void>(`/boards/${id}`, { method: 'DELETE' });
  }

  // ---------- Tasks ----------
  getTask(id: string): Promise<Task> {
    return this.request<Task>(`/tasks/${id}`);
  }

  getBoardTasks(
      boardId: string,
      options: {
        page?: number;
        limit?: number;
        stageId?: string;
        assigneeId?: string;
        search?: string;
        labelIds?: string[];
        labelsMode?: 'any' | 'all';
        sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'title';
        sortDir?: 'ASC' | 'DESC';
      } = {}
  ): Promise<{ items: Task[]; page: number; limit: number; total: number }> {
    const p = new URLSearchParams();
    if (options.page) p.set('page', String(options.page));
    if (options.limit) p.set('limit', String(options.limit));
    if (options.stageId) p.set('stageId', options.stageId);
    if (options.assigneeId) p.set('assigneeId', options.assigneeId);
    if (options.search) p.set('search', options.search);
    if (options.labelIds?.length) p.set('labelIds', options.labelIds.join(','));
    if (options.labelsMode) p.set('labelsMode', options.labelsMode);
    if (options.sortBy) p.set('sortBy', options.sortBy);
    if (options.sortDir) p.set('sortDir', options.sortDir);
    const qs = p.toString();
    return this.request(`/boards/${boardId}/tasks${qs ? `?${qs}` : ''}`);
  }

  createTask(data: {
    boardId: string;
    title: string;
    description?: string;
    assigneeId?: string;
    dueDate?: Date;
    parentId?: string;
    labelIds?: string[];
  }): Promise<Task> {
    const payload = {
      ...data,
      dueDate: data.dueDate ? data.dueDate.toISOString() : undefined,
    };
    return this.request<Task>('/tasks', { method: 'POST', body: JSON.stringify(payload) });
  }

  updateTask(
      id: string,
      data: {
        title?: string;
        description?: string;
        assigneeId?: string;
        dueDate?: Date;
        addLabelIds?: string[];
        removeLabelIds?: string[];
      }
  ): Promise<Task> {
    const payload = {
      ...data,
      dueDate: data.dueDate ? data.dueDate.toISOString() : undefined,
    };
    return this.request<Task>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  }

  deleteTask(id: string): Promise<void> {
    return this.request<void>(`/tasks/${id}`, { method: 'DELETE' });
  }

  /** Бэк возвращает {ok:true}, поэтому здесь void */
  moveTask(id: string, data: { toStageId: string; comment?: string }): Promise<void> {
    return this.request<void>(`/tasks/${id}/move`, { method: 'POST', body: JSON.stringify(data) });
  }

  /** Бэк возвращает {ok:true}, поэтому здесь void */
  approveTask(id: string, data: { comment?: string }): Promise<void> {
    return this.request<void>(`/tasks/${id}/approve`, { method: 'POST', body: JSON.stringify(data) });
  }

  // ---------- Stage / Automation ----------
  /** Без автоматизации (если тебе нужно) */
  setStages(
      boardId: string,
      _projectId: string, // не требуется на бэке для /boards/:id/stages, оставил для совместимости вызовов
      stages: { key: string; name: string; order: number; department?: string; requiresApproval?: boolean }[]
  ): Promise<WorkflowStage[]> {
    return this.request<WorkflowStage[]>(`/boards/${boardId}/stages`, {
      method: 'POST',
      body: JSON.stringify({ stages }),
    });
  }

  /** С автоматизацией — главное: НЕ теряем поле automation */
  setStagesWithAutomation(
      boardId: string,
      _projectId: string,
      stages: {
        key: string;
        name: string;
        order: number;
        department?: string;
        requiresApproval?: boolean;
        automation?: AutomationConfig;
      }[]
  ): Promise<WorkflowStage[]> {
    return this.request<WorkflowStage[]>(`/boards/${boardId}/stages`, {
      method: 'POST',
      body: JSON.stringify({
        stages: stages.map((s) => ({
          key: s.key,
          name: s.name,
          order: s.order,
          department: s.department ?? undefined,
          requiresApproval: !!s.requiresApproval,
          automation: s.automation ?? undefined,
        })),
      }),
    });
  }

  updateStageAutomation(boardId: string, stageId: string, automation: AutomationConfig): Promise<WorkflowStage> {
    return this.request<WorkflowStage>(`/boards/${boardId}/stages/${stageId}/automation`, {
      method: 'PATCH',
      body: JSON.stringify({ automation }),
    });
  }

  // ---------- Labels ----------
  createLabel(boardId: string, data: { name: string; color?: string }): Promise<Label> {
    return this.request<Label>(`/boards/${boardId}/labels`, { method: 'POST', body: JSON.stringify(data) });
  }

  // ---------- Links / Transitions ----------
  getTaskLinks(taskId: string): Promise<TaskLink[]> {
    return this.request<TaskLink[]>(`/tasks/${taskId}/links`);
  }
  getTaskTransitions(taskId: string): Promise<TaskTransition[]> {
    return this.request<TaskTransition[]>(`/tasks/${taskId}/transitions`);
  }
  mirrorBackTask(
      linkedTaskId: string,
      payload: {
        moveToStageKey: string;
        comment?: string;
        copyFields?: Array<'description' | 'assigneeId' | 'dueDate'>;
        autoDeploy?: boolean;
      }
  ): Promise<void> {
    return this.request<void>(`/tasks/${linkedTaskId}/mirror-back`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

}

export const apiService = new ApiService();
