// src/types.ts

export type ID = string;

export interface User {
  id: ID;
  phone: string;
  fullName?: string;
  telegramUsername?: string;
  photoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  id: ID;
  key: string;
  name: string;
  description?: string | null;
  members?: User[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Label {
  id: ID;
  boardId: ID;
  name: string;
  color: string; // hex
  createdAt?: string;
  updatedAt?: string;
}

export type TaskLinkType = 'DEPENDS_ON' | 'CHILD' | 'RELATED' | 'BLOCKS';

export interface TaskLink {
  id: ID;
  projectId: ID;
  fromTaskId: ID;
  toTaskId: ID;
  type: TaskLinkType;
  meta?: any;
  createdAt?: string;
}

export interface TaskTransition {
  id: ID;
  taskId: ID;
  fromStageId: ID | null;
  toStageId: ID | null;
  type: 'MOVE' | 'APPROVE';
  byUserId: string;
  comment?: string | null;
  createdAt: string;
}

export interface TaskLabelLite {
  id: ID;
  name: string;
  color: string;
}

export interface Task {
  id: ID;
  projectId: ID;
  boardId: ID;
  parentId?: ID | null;
  title: string;
  description?: string | null;
  assigneeId?: string | null;
  dueDate?: string | null; // ISO
  stageId?: ID | null;
  createdById: string;
  releaseId?: ID | null;
  labels?: TaskLabelLite[];
  createdAt?: string;
  updatedAt?: string;
}

/** ---------- Automation (frontend = backend contract) ---------- */

export type MirrorBackCopyField = 'description' | 'assigneeId' | 'dueDate';

export interface MirrorBackRule {
  onStageKey?: string;              // ключ стадии linked-задачи (на целевой доске)
  moveOriginToStageKey?: string;    // куда двинуть исходную задачу
  postCommentTpl?: string;          // шаблон комментария в origin
  copyFields?: MirrorBackCopyField[];
  autoDeploy?: boolean;
}

export interface CreateLinkedTaskAction {
  type: 'createLinkedTask';
  /** Куда создавать linked-задачу */
  targetBoardId?: ID;
  targetBoardKey?: string;
  targetStageKey: string;

  /** Связь */
  linkType?: TaskLinkType;

  /** Тексты */
  titleTpl?: string;
  descriptionTpl?: string;

  /** Наследование и автосоздание борды */
  inheritAssignee?: boolean;
  autoCreateBoardIfMissing?: boolean;
  seedStages?: { key: string; name: string; order: number }[];

  /** Обратные действия */
  mirrorBack?: MirrorBackRule;
}

export interface MoveParentWhenAllChildrenDoneAction {
  type: 'moveParentWhenAllChildrenDone';
  childBoardKey?: string;            // фильтр по доске детей (необязательно)
  parentMoveToStageKey: string;      // куда двинуть родителя
  autoDeploy?: boolean;
}

export type AutomationAction = CreateLinkedTaskAction | MoveParentWhenAllChildrenDoneAction;

export interface AutomationConfig {
  actions: AutomationAction[];
}

export interface WorkflowStage {
  id: ID;
  projectId: ID;
  boardId: ID;
  key: string;                 // УНИКАЛЬНЫЙ ключ внутри board
  name: string;
  order: number;
  department?: string | null;
  requiresApproval?: boolean;
  automation?: AutomationConfig | null; // <— важное поле
}

export interface Board {
  id: ID;
  projectId: ID;
  key: string;                 // короткий код BORDA
  name: string;
  description?: string | null;
  stages?: WorkflowStage[];
  labels?: Label[];
  tasks?: Task[];
}
