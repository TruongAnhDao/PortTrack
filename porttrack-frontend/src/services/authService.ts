import api from './api';

export interface AuthCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token?: string;
  accessToken?: string;
}

export const authService = {
  login: async (credentials: AuthCredentials): Promise<AuthResponse | string> => {
    const response = await api.post<AuthResponse | string>('/api/auth/login', credentials);
    return response.data;
  },
  register: async (data: AuthCredentials): Promise<AuthResponse | string> => {
    const response = await api.post<AuthResponse | string>('/api/auth/register', data);
    return response.data;
  }
};
