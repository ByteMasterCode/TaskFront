import { useState, useEffect } from 'react';
import { AuthManager } from '../utils/auth';
import { User } from '../types';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = AuthManager.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        setUser(AuthManager.getUser());
      } else {
        AuthManager.clearAuth();
        setUser(null);
      }
      
      setLoading(false);
    };

    checkAuth();

    // Check token every 5 minutes
    const interval = setInterval(checkAuth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const login = (authData: any) => {
    AuthManager.saveAuth(authData);
    setIsAuthenticated(true);
    setUser(authData.user);
  };

  const logout = () => {
    AuthManager.clearAuth();
    setIsAuthenticated(false);
    setUser(null);
  };

  return {
    isAuthenticated,
    user,
    loading,
    login,
    logout
  };
};