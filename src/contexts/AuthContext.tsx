import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '@/types/crm';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('vedavi_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    // Mock authentication - in production this would call an API
    if (password.length >= 4) {
      const mockUser: User = {
        id: role === 'admin' ? '4' : '1',
        name: role === 'admin' ? 'Neha Gupta' : 'Rahul Sharma',
        email: email,
        role: role,
        avatar: undefined,
      };
      setUser(mockUser);
      localStorage.setItem('vedavi_user', JSON.stringify(mockUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('vedavi_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
