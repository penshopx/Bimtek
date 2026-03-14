'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Activity {
  id: string;
  type: 'module_complete' | 'quiz_take' | 'bookmark_add' | 'profile_update' | 'achievement_unlock' | 'streak_update';
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface ActivityContextType {
  activities: Activity[];
  addActivity: (type: Activity['type'], title: string, description: string, metadata?: Record<string, any>) => void;
  getActivitiesByType: (type: Activity['type']) => Activity[];
  getRecentActivities: (limit?: number) => Activity[];
  clearActivities: () => void;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export function ActivityProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('activities');
    if (saved) {
      setActivities(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('activities', JSON.stringify(activities));
  }, [activities]);

  const addActivity = (type: Activity['type'], title: string, description: string, metadata?: Record<string, any>) => {
    const newActivity: Activity = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      description,
      timestamp: new Date().toISOString(),
      metadata,
    };
    setActivities(prev => [newActivity, ...prev].slice(0, 100));
  };

  const getActivitiesByType = (type: Activity['type']) => {
    return activities.filter(a => a.type === type);
  };

  const getRecentActivities = (limit: number = 10) => {
    return activities.slice(0, limit);
  };

  const clearActivities = () => {
    setActivities([]);
  };

  return (
    <ActivityContext.Provider value={{ activities, addActivity, getActivitiesByType, getRecentActivities, clearActivities }}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivities() {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivities must be used within ActivityProvider');
  }
  return context;
}
