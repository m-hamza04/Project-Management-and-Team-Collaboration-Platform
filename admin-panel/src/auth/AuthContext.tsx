import { createContext, useContext, useState, ReactNode } from 'react';
import { AdminUser } from '@/types';

interface AuthContextValue {
  user: AdminUser | null;
  token: string | null;
  login: (user: AdminUser, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(() => {
    const stored = localStorage.getItem('admin_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('admin_token')
  );

  const login = (newUser: AdminUser, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem('admin_user', JSON.stringify(newUser));
    localStorage.setItem('admin_token', newToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
