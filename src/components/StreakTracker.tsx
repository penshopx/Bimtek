'use client';

import { useState, useEffect } from 'react';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  totalActiveDays: number;
}

export function StreakTracker() {
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: '',
    totalActiveDays: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('learningStreak');
    if (saved) {
      const data = JSON.parse(saved);
      const today = new Date().toDateString();
      const lastDate = new Date(data.lastActivityDate).toDateString();
      
      if (today !== lastDate) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastDate === yesterday.toDateString()) {
          const newStreak = {
            ...data,
            lastActivityDate: today,
          };
          setStreak(newStreak);
          localStorage.setItem('learningStreak', JSON.stringify(newStreak));
        } else if (lastDate !== today) {
          const resetStreak = {
            ...data,
            currentStreak: 0,
            lastActivityDate: today,
          };
          setStreak(resetStreak);
          localStorage.setItem('learningStreak', JSON.stringify(resetStreak));
        } else {
          setStreak(data);
        }
      } else {
        setStreak(data);
      }
    }
  }, []);

  const recordActivity = () => {
    const today = new Date().toDateString();
    let newStreak: StreakData;

    if (streak.lastActivityDate === today) {
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    if (streak.lastActivityDate === yesterdayStr) {
      const newCurrent = streak.currentStreak + 1;
      newStreak = {
        currentStreak: newCurrent,
        longestStreak: Math.max(newCurrent, streak.longestStreak),
        lastActivityDate: today,
        totalActiveDays: streak.totalActiveDays + 1,
      };
    } else if (streak.lastActivityDate === today) {
      return;
    } else {
      newStreak = {
        currentStreak: 1,
        longestStreak: Math.max(1, streak.longestStreak),
        lastActivityDate: today,
        totalActiveDays: streak.totalActiveDays + 1,
      };
    }

    setStreak(newStreak);
    localStorage.setItem('learningStreak', JSON.stringify(newStreak));
  };

  useEffect(() => {
    const completed = localStorage.getItem('bimtekCompleted');
    if (completed && JSON.parse(completed).length > 0) {
      recordActivity();
    }
  }, []);

  if (!mounted) return null;

  const getWeekDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      const isActive = streak.lastActivityDate && 
        (dateStr === new Date(streak.lastActivityDate).toDateString() || 
         dateStr === new Date(Date.now() - 86400000).toDateString());
      const isToday = dateStr === today.toDateString();
      days.push({ date: dateStr, isActive, isToday, day: date.getDate() });
    }
    return days;
  };

  const weekDays = getWeekDays();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">🔥 Learning Streak</h3>
        <span className="text-2xl font-bold text-amber-500">{streak.currentStreak}</span>
      </div>

      <div className="flex justify-between mb-4">
        {weekDays.map((day, i) => (
          <div key={i} className="text-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
              day.isActive 
                ? 'bg-amber-500 text-white' 
                : day.isToday 
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
            }`}>
              {day.isActive ? '✓' : day.day}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">
          <p className="text-slate-500">Longest Streak</p>
          <p className="font-bold text-slate-800 dark:text-white">{streak.longestStreak} days</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">
          <p className="text-slate-500">Total Active</p>
          <p className="font-bold text-slate-800 dark:text-white">{streak.totalActiveDays} days</p>
        </div>
      </div>

      {streak.currentStreak >= 7 && (
        <div className="mt-4 p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg text-white text-center">
          <p className="font-bold">🎉 Amazing! 7+ days streak!</p>
        </div>
      )}
    </div>
  );
}
