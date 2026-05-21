export type UserRole = 'ADMIN' | 'CONSERJERIA' | 'RESIDENTE';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  active: boolean;
  roles: UserRole[];
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  password: string;
}

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface UserFilter {
  role?: UserRole | '';
  active?: boolean;
  search?: string;
}
