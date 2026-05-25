export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export type ID = string | number;

export interface User {
  id: ID;
  name: string;
  email: string;
  role?: string;
  avatarUrl?: string;
  phone?: string;
  department?: string;
  designation?: string;
  bio?: string;
  joinedDate?: string;
  createdAt?: string;
}

export interface Profile extends User {
  notificationPreferences?: Record<string, boolean>;
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Project {
  id: ID;
  name: string;
  description?: string;
  memberCount?: number;
  members?: ProjectMember[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectMember {
  id?: ID;
  userId?: ID;
  name: string;
  email: string;
  role: string;
  joinedDate?: string;
  createdAt?: string;
}

export interface Task {
  id: ID;
  title: string;
  description?: string;
  projectId?: ID;
  projectName?: string;
  project?: Project;
  assignee?: User | null;
  assignedTo?: User | ID | null;
  creator?: User | null;
  createdBy?: User | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardData {
  totalProjects: number;
  totalTasks: number;
  todoTasks?: number;
  inProgressTasks?: number;
  completedTasks: number;
  overdueTasks: number;
  taskStatusDistribution?: Record<TaskStatus, number>;
  priorityDistribution?: Record<TaskPriority, number>;
  recentTasks: Task[];
  overdueTasksList?: Task[];
  recentActivity?: ActivityLog[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
}

export interface VerifyOtpRequest {
  name: string;
  email: string;
  otp: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface AuthPayload {
  token: string;
  user: User;
}

export interface MessageResponse {
  success?: boolean;
  message?: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
}

export interface AddMemberRequest {
  userId: ID;
  role: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: string | null;
  assignedTo?: ID | null;
}

export interface UpdateTaskStatusRequest {
  status: TaskStatus;
}

export type NotificationType = 'NOTIFICATION' | 'TASK_ASSIGNED' | 'TASK_OVERDUE' | 'COMMENT_ADDED' | 'TASK_UPDATED' | 'TASK' | 'PROJECT' | 'COMMENT' | 'SYSTEM';

export interface Notification {
  id: ID;
  title?: string;
  message?: string;
  type?: NotificationType;
  read?: boolean;
  createdAt?: string;
  timestamp?: string;
  referenceId?: ID;
  projectId?: ID;
  payload?: Record<string, unknown>;
}

export interface PageResponse<T> {
  content?: T[];
  totalPages?: number;
  totalElements?: number;
  number?: number;
  size?: number;
}

export interface Comment {
  id: ID;
  taskId?: ID;
  body?: string;
  content?: string;
  author?: User;
  createdAt?: string;
  updatedAt?: string;
}

export interface ActivityLog {
  id: ID;
  type?: string;
  actor?: User;
  actorName?: string;
  summary?: string;
  description?: string;
  createdAt?: string;
  timestamp?: string;
  changes?: Record<string, unknown>;
}

export interface AuditLog {
  id: ID;
  actor?: string;
  actorName?: string;
  action?: string;
  entity?: string;
  entityType?: string;
  entityId?: ID;
  severity?: string;
  createdAt?: string;
  timestamp?: string;
}

export interface ProjectSettings {
  id?: ID;
  projectId?: ID;
  archived?: boolean;
  preferences?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface BoardTask extends Task {
  columnId?: ID;
  position?: number;
}

export interface BoardColumn {
  id: ID;
  name?: string;
  title?: string;
  position?: number;
  tasks?: BoardTask[];
}

export interface Board {
  columns: BoardColumn[];
}

export interface Attachment {
  id: ID;
  fileName?: string;
  name?: string;
  contentType?: string;
  size?: number;
  createdAt?: string;
}

export interface ProjectAnalytics {
  totalTasks?: number;
  overdue?: number;
  completedThisWeek?: number;
  completedThisMonth?: number;
  completionRate?: number;
  tasksByStatus?: Record<string, number>;
  tasksByPriority?: Record<string, number>;
  weeklyTrend?: Array<Record<string, string | number>>;
  memberStats?: Array<Record<string, string | number>>;
}

export interface WebSocketEvent {
  type: NotificationType;
  referenceId: ID;
  projectId?: ID;
  payload: Record<string, unknown>;
  timestamp: string;
}
