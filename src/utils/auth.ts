import { AuthResponse } from '../types';

export const AuthManager = {
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('auth_token');
    console.log('Checking token:', token ? `${token.substring(0, 50)}...` : 'missing');
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isValid = payload.exp > Date.now() / 1000;
      console.log('Token valid:', isValid, 'expires:', new Date(payload.exp * 1000), 'current time:', new Date());
      return isValid;
    } catch {
      console.log('Token parsing failed');
      // Если токен поврежден, очистить его
      localStorage.removeItem('auth_token');
      return false;
    }
  },

  saveAuth: (authData: AuthResponse): void => {
    console.log('Saving auth data:', { 
      token: authData.accessToken ? `${authData.accessToken.substring(0, 50)}...` : 'missing',
      user: authData.user 
    });
    localStorage.setItem('auth_token', authData.accessToken);
    localStorage.setItem('user_data', JSON.stringify(authData.user));
    
    // Проверить, что токен сохранился
    const savedToken = localStorage.getItem('auth_token');
    console.log('Token saved successfully:', savedToken === authData.accessToken);
  },

  clearAuth: (): void => {
    console.log('Clearing auth data');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  },

  getToken: (): string | null => {
    const token = localStorage.getItem('auth_token');
    console.log('Getting token:', token ? `${token.substring(0, 50)}...` : 'null');
    return token;
  },

  getUser: () => {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  },

  apiRequest: async (url: string, options: RequestInit = {}) => {
    const token = AuthManager.getToken();
    console.log('Making API request to:', url, 'with token:', token ? 'yes' : 'no');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
      console.log('Authorization header set:', `Bearer ${token.substring(0, 50)}...`);
    }

    console.log('Request headers:', headers);

    return fetch(url, {
      ...options,
      headers,
    });
  }
};