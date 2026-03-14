'use client';

import { useState, useEffect } from 'react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  type: 'pkb' | 'modules' | 'streak' | 'quiz' | 'bookmarks';
  unlocked: boolean;
  unlockedAt?: string;
}

const achievementsList: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
  { id: 'first_step', name: 'First Step', description: 'Selesaikan 1 modul', icon: '🎯', requirement: 1, type: 'modules' },
  { id: 'five_modules', name: 'Penggemar BIMTEK', description: 'Selesaikan 5 modul', icon: '📚', requirement: 5, type: 'modules' },
  { id: 'ten_modules', name: 'Pelajar Gigih', description: 'Selesaikan 10 modul', icon: '💪', requirement: 10, type: 'modules' },
  { id: 'twenty_modules', name: 'Mahir', description: 'Selesaikan 20 modul', icon: '🎓', requirement: 20, type: 'modules' },
  { id: 'fifty_pkb', name: 'PKB Hunter', description: 'Kumpulkan 50 PKB', icon: '⭐', requirement: 50, type: 'pkb' },
  { id: 'hundred_pkb', name: 'Century', description: 'Kumpulkan 100 PKB', icon: '🏆', requirement: 100, type: 'pkb' },
  { id: 'full_pkb', name: 'Expert', description: 'Kumpulkan 150 PKB', icon: '👑', requirement: 150, type: 'pkb' },
  { id: 'streak_3', name: 'Semangat', description: '3 hari streak', icon: '🔥', requirement: 3, type: 'streak' },
  { id: 'streak_7', name: 'Konsisten', description: '7 hari streak', icon: '💯', requirement: 7, type: 'streak' },
  { id: 'streak_30', name: 'Dedikasi', description: '30 hari streak', icon: '🏅', requirement: 30, type: 'streak' },
  { id: 'quiz_3', name: 'Quiz Beginner', description: 'Ikuti 3 kategori quiz', icon: '✍️', requirement: 3, type: 'quiz' },
  { id: 'quiz_7', name: 'Quiz Master', description: 'Ikuti 7 kategori quiz', icon: '🧠', requirement: 7, type: 'quiz' },
  { id: 'bookmark_5', name: 'Peng.collector', description: '5 bookmarks', icon: '🔖', requirement: 5, type: 'bookmarks' },
  { id: 'bookmark_10', name: 'Kolektor', description: '10 bookmarks', icon: '📚', requirement: 10, type: 'bookmarks' },
];

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const savedCompleted = localStorage.getItem('bimtekCompleted');
    const savedQuizScores = localStorage.getItem('quizBestScores');
    const savedStreak = localStorage.getItem('learningStreak');
    const savedBookmarks = localStorage.getItem('bookmarks');
    const savedAchievements = localStorage.getItem('achievements');

    const completed = savedCompleted ? JSON.parse(savedCompleted) : [];
    const quizScores = savedQuizScores ? JSON.parse(savedQuizScores) : {};
    const streakData = savedStreak ? JSON.parse(savedStreak) : { currentStreak: 0 };
    const bookmarks = savedBookmarks ? JSON.parse(savedBookmarks) : [];
    const unlockedAchievements = savedAchievements ? JSON.parse(savedAchievements) : [];

    const pkb = completed.reduce((sum: number, id: string) => {
      const modules = [
        { id: 'sipil-gedung-1', pkb: 10 }, { id: 'sipil-gedung-2', pkb: 12 }, { id: 'sipil-gedung-3', pkb: 12 },
        { id: 'k3-1', pkb: 15 }, { id: 'k3-2', pkb: 10 }, { id: 'k3-3', pkb: 6 }, { id: 'k3-4', pkb: 8 }, { id: 'k3-5', pkb: 10 }, { id: 'k3-6', pkb: 8 },
        { id: 'jalan-1', pkb: 12 }, { id: 'jalan-2', pkb: 10 }, { id: 'jalan-3', pkb: 12 },
        { id: 'elektrikal-1', pkb: 12 }, { id: 'elektrikal-2', pkb: 10 },
        { id: 'mekanikal-1', pkb: 10 }, { id: 'mekanikal-2', pkb: 8 },
        { id: 'manajemen-1', pkb: 15 }, { id: 'manajemen-2', pkb: 12 },
        { id: 'rab-1', pkb: 12 }, { id: 'rab-2', pkb: 10 },
        { id: 'quality-1', pkb: 10 },
        { id: 'digital-1', pkb: 10 }, { id: 'digital-2', pkb: 15 },
      ];
      const mod = modules.find(m => m.id === id);
      return sum + (mod?.pkb || 0);
    }, 0);

    const unlocked = unlockedAchievements as string[];
    const newUnlocked: string[] = [];

    const computedAchievements = achievementsList.map(ach => {
      let isUnlocked = unlocked.includes(ach.id);
      
      if (!isUnlocked) {
        let meetsRequirement = false;
        switch (ach.type) {
          case 'modules': meetsRequirement = completed.length >= ach.requirement; break;
          case 'pkb': meetsRequirement = pkb >= ach.requirement; break;
          case 'streak': meetsRequirement = streakData.currentStreak >= ach.requirement; break;
          case 'quiz': meetsRequirement = Object.keys(quizScores).length >= ach.requirement; break;
          case 'bookmarks': meetsRequirement = bookmarks.length >= ach.requirement; break;
        }
        
        if (meetsRequirement) {
          isUnlocked = true;
          newUnlocked.push(ach.id);
        }
      }

      return {
        ...ach,
        unlocked: isUnlocked,
        unlockedAt: isUnlocked ? new Date().toISOString() : undefined,
      };
    });

    if (newUnlocked.length > 0) {
      const allUnlocked = [...unlocked, ...newUnlocked];
      localStorage.setItem('achievements', JSON.stringify(allUnlocked));
    }

    setAchievements(computedAchievements);
  }, []);

  if (!mounted) return null;

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const progressByType = {
    modules: { current: 0, target: achievementsList.filter(a => a.type === 'modules').length },
    pkb: { current: 0, target: achievementsList.filter(a => a.type === 'pkb').length },
    streak: { current: 0, target: achievementsList.filter(a => a.type === 'streak').length },
    quiz: { current: 0, target: achievementsList.filter(a => a.type === 'quiz').length },
    bookmarks: { current: 0, target: achievementsList.filter(a => a.type === 'bookmarks').length },
  };

  achievements.filter(a => a.unlocked).forEach(a => {
    progressByType[a.type].current++;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-4">🏆 Achievements</h1>
          <p className="text-slate-600 dark:text-slate-300">
            Kumpulkan semua achievement untuk menunjukkan keahlian Anda!
          </p>
          <div className="mt-4 inline-block px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full text-white font-bold">
            {unlockedCount} / {achievementsList.length} Achievement
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2 mb-8">
          {Object.entries(progressByType).map(([type, data]) => (
            <div key={type} className="text-center p-3 bg-white dark:bg-slate-800 rounded-xl">
              <div className="text-2xl font-bold text-amber-500">{data.current}</div>
              <div className="text-xs text-slate-500 capitalize">{type}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`relative p-4 rounded-2xl transition-all ${
                achievement.unlocked
                  ? 'bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 border-2 border-amber-400'
                  : 'bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 opacity-60'
              }`}
            >
              <div className="text-4xl mb-2">{achievement.icon}</div>
              <h3 className={`font-bold text-sm ${
                achievement.unlocked ? 'text-amber-700 dark:text-amber-300' : 'text-slate-500'
              }`}>
                {achievement.name}
              </h3>
              <p className={`text-xs ${
                achievement.unlocked ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'
              }`}>
                {achievement.description}
              </p>
              {achievement.unlocked && (
                <div className="absolute -top-1 -right-1 text-xl">✅</div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">Tips Mencapai Achievement</h2>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <p>🎯 <strong>Modul:</strong> Selesaikan modul BIMTEK secara rutin untuk menambah progress</p>
            <p>⭐ <strong>PKB:</strong> Setiap modul memberikan PKB points, kumpulkan hingga 150 untuk achievementExpert</p>
            <p>🔥 <strong>Streak:</strong> Belajar setiap hari tanpa putus untuk mencapai streak tinggi</p>
            <p>✍️ <strong>Quiz:</strong> Ikuti berbagai kategori quiz untuk unlock achievement</p>
            <p>🔖 <strong>Bookmarks:</strong> Simpan konten favorit yang ingin Anda pelajari nanti</p>
          </div>
        </div>
      </div>
    </div>
  );
}
