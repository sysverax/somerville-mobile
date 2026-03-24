import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { loginAdmin, logoutAdmin, validateAdminSession } from '@/services/auth.service';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ADMIN_TOKEN_KEY = 'admin_access_token';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const hasToken = Boolean(localStorage.getItem(ADMIN_TOKEN_KEY));
        if (hasToken) {
          await validateAdminSession();
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Session validation failed:', error);
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await loginAdmin(email, password);
      localStorage.setItem(ADMIN_TOKEN_KEY, result.accessToken);
      setIsAuthenticated(true);
      return true;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    try {
      await logoutAdmin();
    } finally {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
