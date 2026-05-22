import type { ID, User } from '../../types/api';

export interface TaskComment {
  id: ID;
  taskId: ID;
  body: string;
  author: Pick<User, 'id' | 'name' | 'email' | 'avatarUrl'>;
  createdAt: string;
  updatedAt?: string;
}
