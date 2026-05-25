import type { AuthPayload, User } from '../types/api';

type AuthResponseShape = Partial<AuthPayload> & {
  accessToken?: string;
  jwt?: string;
  bearerToken?: string;
  userId?: User['id'];
  id?: User['id'];
  name?: string;
  email?: string;
  role?: string;
};

export function normalizeAuthPayload(payload: AuthResponseShape): AuthPayload {
  const token = payload.token ?? payload.accessToken ?? payload.jwt ?? payload.bearerToken;
  const user = payload.user ?? {
    id: payload.userId ?? payload.id ?? payload.email ?? 'me',
    name: payload.name ?? payload.email ?? 'User',
    email: payload.email ?? '',
    role: payload.role,
  };

  if (!token) {
    throw new Error('Authentication response did not include a token');
  }

  return { token, user };
}
