'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'instructor';
  avatar?: string;
  phone?: string;
  company?: string;
  position?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  syncProgress: () => Promise<void>;
  saveQuizScore: (category: string, score: number, totalQuestions: number) => Promise<void>;
  addBookmark: (type: string, itemId: string, title: string) => Promise<void>;
  removeBookmark: (itemId: string) => Promise<void>;
  addActivity: (type: string, title: string, description: string, metadata?: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth?action=verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
        }
      } else {
        localStorage.removeItem('sessionId');
      }
    } catch (e) {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    }
    setIsLoading(false);
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/auth?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setUser(data.user);
        localStorage.setItem('sessionId', data.sessionId);
        localStorage.setItem('user', JSON.stringify(data.user));
        setIsLoading(false);
        return { success: true, message: 'Login berhasil!' };
      }
      
      setIsLoading(false);
      return { success: false, message: data.message || 'Email atau password salah' };
    } catch (e) {
      setIsLoading(false);
      return { success: false, message: 'Terjadi kesalahan' };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/auth?action=register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setUser(data.user);
        localStorage.setItem('sessionId', data.sessionId);
        localStorage.setItem('user', JSON.stringify(data.user));
        setIsLoading(false);
        return { success: true, message: 'Registrasi berhasil!' };
      }
      
      setIsLoading(false);
      return { success: false, message: data.message || 'Registrasi gagal' };
    } catch (e) {
      setIsLoading(false);
      return { success: false, message: 'Terjadi kesalahan' };
    }
  };

  const logout = () => {
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      fetch('/api/auth?action=logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      }).catch(() => {});
    }
    
    setUser(null);
    localStorage.removeItem('sessionId');
    localStorage.removeItem('user');
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    try {
      await fetch('/api/auth?action=update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, updates }),
      });
    } catch (e) {
      // local fallback
    }
  };

  const syncProgress = async () => {
    if (!user) return;
    
    try {
      const localProgress = localStorage.getItem('bimtekCompleted');
      if (localProgress) {
        const modules = JSON.parse(localProgress) as string[];
        for (const moduleId of modules) {
          await fetch('/api/user?action=saveProgress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, moduleId, completed: true }),
          });
        }
      }
    } catch (e) {
      // ignore
    }
  };

  const saveQuizScore = async (category: string, score: number, totalQuestions: number) => {
    if (!user) return;
    
    try {
      await fetch('/api/user?action=saveQuizScore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, category, score, totalQuestions }),
      });
    } catch (e) {
      // local fallback
    }
  };

  const addBookmark = async (type: string, itemId: string, title: string) => {
    if (!user) return;
    
    try {
      await fetch('/api/user?action=addBookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, type, itemId, title }),
      });
    } catch (e) {
      // local fallback
    }
  };

  const removeBookmark = async (itemId: string) => {
    if (!user) return;
    
    try {
      await fetch('/api/user?action=removeBookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, itemId }),
      });
    } catch (e) {
      // local fallback
    }
  };

  const addActivity = async (type: string, title: string, description: string, metadata?: any) => {
    if (!user) return;
    
    try {
      await fetch('/api/user?action=addActivity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, type, title, description, metadata }),
      });
    } catch (e) {
      // local fallback
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateProfile, syncProgress, saveQuizScore, addBookmark, removeBookmark, addActivity }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
