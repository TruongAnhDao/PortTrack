import api from './api';
import type { UserRole } from '../utils/auth';

export interface AuthCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token?: string;
  accessToken?: string;
  username?: string;
  role: UserRole;
}

export interface RegisterData extends AuthCredentials {
  role: UserRole;
}

export const authService = {
  login: async (credentials: AuthCredentials): Promise<AuthResponse | string> => {
    const response = await api.post<AuthResponse | string>('/api/auth/login', credentials);
    return response.data;
  },
  register: async (data: RegisterData): Promise<AuthResponse | string> => {
    const response = await api.post<AuthResponse | string>('/api/auth/register', data);
    return response.data;
  }
};
