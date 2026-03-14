import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    leaderboard: [
      { rank: 1, name: 'Ahmad Wijaya', points: 12500, modules: 45, quizzes: 28, streak: 45 },
      { rank: 2, name: 'Budi Santoso', points: 11200, modules: 42, quizzes: 25, streak: 38 },
      { rank: 3, name: 'Siti Nurhaliza', points: 10800, modules: 40, quizzes: 24, streak: 35 },
      { rank: 4, name: 'Hendra Gunawan', points: 9500, modules: 38, quizzes: 20, streak: 28 },
      { rank: 5, name: 'Rina Susilowati', points: 8900, modules: 35, quizzes: 18, streak: 25 },
      { rank: 6, name: 'Joko Pramono', points: 8200, modules: 32, quizzes: 16, streak: 22 },
      { rank: 7, name: 'Dewi Lestari', points: 7800, modules: 30, quizzes: 15, streak: 20 },
      { rank: 8, name: 'Michael Tanoto', points: 7200, modules: 28, quizzes: 14, streak: 18 },
      { rank: 9, name: 'Lisa Permata', points: 6800, modules: 26, quizzes: 12, streak: 15 },
      { rank: 10, name: 'Rio Ferdian', points: 6200, modules: 24, quizzes: 11, streak: 12 },
    ],
  });
}
