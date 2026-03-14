'use client';

import { useState, useEffect } from 'react';

interface DayActivity {
  date: string;
  activities: number;
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activityData, setActivityData] = useState<Record<string, number>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const savedCompleted = localStorage.getItem('bimtekCompleted');
    const streakData = localStorage.getItem('learningStreak');
    
    const activities: Record<string, number> = {};
    
    if (savedCompleted) {
      const completed = JSON.parse(savedCompleted);
      completed.forEach((id: string) => {
        const date = new Date().toISOString().split('T')[0];
        activities[date] = (activities[date] || 0) + 1;
      });
    }
    
    setActivityData(activities);
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days: (number | null)[] = [];
    
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const formatDate = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  const getActivityLevel = (day: number) => {
    const dateKey = formatDate(day);
    const count = activityData[dateKey] || 0;
    if (count === 0) return 'bg-slate-100 dark:bg-slate-700';
    if (count === 1) return 'bg-amber-200 dark:bg-amber-800';
    if (count <= 3) return 'bg-amber-400 dark:bg-amber-600';
    return 'bg-amber-500 dark:bg-amber-500';
  };

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const days = getDaysInMonth(currentMonth);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-4">📅 Learning Calendar</h1>
          <p className="text-slate-600 dark:text-slate-300">
            Visualisasi aktivitas belajar Anda setiap hari
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              ←
            </button>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-4">
            {dayNames.map(day => (
              <div key={day} className="text-center text-sm font-medium text-slate-500 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => (
              <div
                key={index}
                className={`aspect-square rounded-lg flex items-center justify-center text-sm ${
                  day ? getActivityLevel(day) : ''
                }`}
              >
                {day && (
                  <span className={activityData[formatDate(day)] ? 'text-white font-medium' : 'text-slate-600 dark:text-slate-400'}>
                    {day}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-slate-100 dark:bg-slate-700"></div>
              <span className="text-slate-500">Tidak aktif</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-amber-200 dark:bg-amber-800"></div>
              <span className="text-slate-500">1 activity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-amber-400 dark:bg-amber-600"></div>
              <span className="text-slate-500">2-3</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-amber-500"></div>
              <span className="text-slate-500">4+</span>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-amber-500">
              {Object.keys(activityData).length}
            </div>
            <div className="text-sm text-slate-500">Hari aktif</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-500">
              {Object.values(activityData).reduce((a, b) => a + b, 0)}
            </div>
            <div className="text-sm text-slate-500">Total aktivitas</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">
              {Object.values(activityData).filter(v => v >= 3).length}
            </div>
            <div className="text-sm text-slate-500">Hari intensif</div>
          </div>
        </div>
      </div>
    </div>
  );
}
