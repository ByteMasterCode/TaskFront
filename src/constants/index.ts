export const API_BASE_URL = 'https://ehikchi.online';

export const ROUTES = {
  LOGIN: 'login',
  REGISTER: 'register',
  VERIFY_OTP: 'verify-otp',
  DASHBOARD: 'dashboard'
} as const;

export const TASK_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
} as const;

export const TASK_STATUSES = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed'
} as const;

export const LINK_TYPES = {
  DEPENDS_ON: 'DEPENDS_ON',
  CHILD: 'CHILD',
  RELATED: 'RELATED',
  BLOCKS: 'BLOCKS'
} as const;

export const TRANSITION_TYPES = {
  CREATED: 'created',
  MOVED: 'moved',
  APPROVED: 'approved',
  ASSIGNED: 'assigned',
  UNASSIGNED: 'unassigned',
  COMMENTED: 'commented'
} as const;