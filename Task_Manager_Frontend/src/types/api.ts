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
  joinedDate?: string;
  createdAt?: string;
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
  completedTasks: number;
  overdueTasks: number;
  taskStatusDistribution?: Record<TaskStatus, number>;
  priorityDistribution?: Record<TaskPriority, number>;
  recentTasks: Task[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthPayload {
  token: string;
  user: User;
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
