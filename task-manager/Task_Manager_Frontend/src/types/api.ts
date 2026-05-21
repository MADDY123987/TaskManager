export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type ProjectRole = 'OWNER' | 'ADMIN' | 'MEMBER' | string;

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  joinedDate?: string;
  createdAt?: string;
}

export interface AuthPayload {
  token: string;
  user: User;
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

export interface ProjectMember {
  userId?: string;
  id?: string;
  name: string;
  email: string;
  role: ProjectRole;
  joinedDate?: string;
  createdAt?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  memberCount?: number;
  members?: ProjectMember[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
}

export interface AddMemberRequest {
  userId: string;
  role: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId?: string;
  projectName?: string;
  project?: Pick<Project, 'id' | 'name'>;
  assignee?: User | null;
  assignedTo?: string | null;
  creator?: User | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: string | null;
  assignedTo?: string | null;
}

export type UpdateTaskRequest = Partial<CreateTaskRequest> & {
  status?: TaskStatus;
};

export interface DashboardData {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  statusDistribution?: Record<TaskStatus, number>;
  priorityDistribution?: Record<TaskPriority, number>;
  recentTasks?: Task[];
}
