export type UserRole = 'ADMIN' | 'CONSERJERIA' | 'RESIDENTE' | 'MANTENIMIENTO';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  role: UserRole;
  active: boolean;
  profileImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
  password?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role?: UserRole;
  active?: boolean;
}

export interface UserFilter {
  role?: UserRole | '';
  active?: boolean;
  search?: string;
}
