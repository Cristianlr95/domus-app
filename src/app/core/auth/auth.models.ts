export type UserRole = 'ADMIN' | 'CONSERJERIA' | 'RESIDENTE';

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  active: boolean;
  roles: UserRole[];
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  tokenType: string;
  accessToken: string;
  expiresIn: number;
  user: AuthUser;
}
