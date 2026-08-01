/**
 * Database seed script — populates demo data for BimtekKita.
 * Safe to run multiple times (idempotent via per-table existence checks).
 *
 * Usage: bun run db:seed
 */

import { db } from './index';
import * as schema from './schema';
import { eq } from 'drizzle-orm';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

function uid(prefix = ''): string {
  return `${prefix}${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

async function seedUsers() {
  const existing = await db.select().from(schema.users);
  if (existing.length > 0) {
    console.log(`  ↳ users: ${existing.length} rows already exist, skipping.`);
    return existing;
  }

  const now = new Date().toISOString();
  const demoUsers = [
    {
      id: 'user-demo-admin',
      name: 'Admin BimtekKita',
      email: 'admin@bimtekkita.id',
      passwordHash: simpleHash('admin123'),
      role: 'admin',
      avatar: null,
      phone: '081234567890',
      company: 'BimtekKita',
      position: 'Administrator',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'user-admin-001',
      name: 'Admin KILOkode',
      email: 'admin@kilokode.com',
      passwordHash: simpleHash('admin123'),
      role: 'admin',
      avatar: null,
      phone: '0811-0000-0001',
      company: 'KILOkode',
      position: 'Administrator',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'user-demo-001',
      name: 'Ahmad Wijaya',
      email: 'ahmad@demo.com',
      passwordHash: simpleHash('demo123'),
      role: 'user',
      avatar: null,
      phone: '0812-3456-7890',
      company: 'PT Wijaya Konstruksi',
      position: 'Ahli Teknik Bangunan Gedung',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'user-demo-1',
      name: 'Budi Santoso',
      email: 'budi@demo.com',
      passwordHash: simpleHash('demo123'),
      role: 'user',
      avatar: null,
      phone: '081298765432',
      company: 'PT Konstruksi Nusantara',
      position: 'Site Engineer',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'user-demo-002',
      name: 'Siti Nurhaliza',
      email: 'siti@demo.com',
      passwordHash: simpleHash('demo123'),
      role: 'user',
      avatar: null,
      phone: '0813-9876-5432',
      company: 'PT Nusantara Bangun',
      position: 'Ahli K3 Konstruksi',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'user-demo-003',
      name: 'Hendra Gunawan',
      email: 'hendra@demo.com',
      passwordHash: simpleHash('demo123'),
      role: 'user',
      avatar: null,
      phone: '0821-5566-7788',
      company: 'CV Gunawan & Rekan',
      position: 'Ahli Manajemen Proyek',
      createdAt: now,
      updatedAt: now,
    },
  ];

  await db.insert(schema.users).values(demoUsers);
  console.log(`  ↳ users: inserted ${demoUsers.length} demo users.`);
  return demoUsers;
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

async function seedProfile() {
  const existing = await db.select().from(schema.profile);
  if (existing.length > 0) {
    console.log(`  ↳ profile: already exists, skipping.`);
    return;
  }

  await db.insert(schema.profile).values({
    name: 'Ahmad Wijaya',
    email: 'ahmad@demo.com',
    company: 'PT Wijaya Konstruksi',
    position: 'Ahli Teknik Bangunan Gedung',
    updatedAt: new Date(),
  });
  console.log(`  ↳ profile: inserted demo profile.`);
}

// ---------------------------------------------------------------------------
// Streak
// ---------------------------------------------------------------------------

async function seedStreak() {
  const existing = await db.select().from(schema.streak);
  if (existing.length > 0) {
    console.log(`  ↳ streak: already exists, skipping.`);
    return;
  }

  const today = new Date().toISOString().split('T')[0];
  await db.insert(schema.streak).values({
    currentStreak: 12,
    longestStreak: 25,
    lastActivityDate: today,
    totalDays: 42,
  });
  console.log(`  ↳ streak: inserted demo streak data.`);
}

// ---------------------------------------------------------------------------
// BIMTEK Progress & Lessons
// ---------------------------------------------------------------------------

const DEMO_MODULE_IDS = [
  'sipil-gedung-1',
  'sipil-gedung-2',
  'sipil-gedung-3',
  'k3-1',
  'k3-2',
  'jalan-1',
  'manajemen-1',
  'regulasi-1',
  'iso9001-1',
  'pengadaan-1',
  'pengadaan-2',
  'lkut-1',
  'managerial-1',
  'managerial-4',
  'digital-3',
];

async function seedBimtekProgress() {
  const existing = await db.select().from(schema.bimtekProgress);
  if (existing.length > 0) {
    console.log(`  ↳ bimtek_progress: ${existing.length} rows already exist, skipping.`);
    return;
  }

  const now = new Date();
  const rows = DEMO_MODULE_IDS.map((moduleId, i) => {
    const progress = i < 5 ? 1.0 : i < 10 ? 0.5 + (i * 0.05) : 0.2;
    return {
      moduleId,
      progress,
      completedAt: progress === 1.0 ? now : null,
    };
  });

  await db.insert(schema.bimtekProgress).values(rows);
  console.log(`  ↳ bimtek_progress: inserted ${rows.length} module progress rows.`);
}

async function seedBimtekLessons() {
  const existing = await db.select().from(schema.bimtekLessons);
  if (existing.length > 0) {
    console.log(`  ↳ bimtek_lessons: ${existing.length} rows already exist, skipping.`);
    return;
  }

  const now = new Date();
  const lessons: (typeof schema.bimtekLessons.$inferInsert)[] = [];

  // For completed modules insert 3 completed lessons each
  const completedModules = DEMO_MODULE_IDS.slice(0, 5);
  for (const moduleId of completedModules) {
    for (let j = 1; j <= 3; j++) {
      lessons.push({
        id: uid(),
        moduleId,
        lessonId: `${moduleId}-lesson-${j}`,
        completed: true,
        completedAt: now,
      });
    }
  }

  // For in-progress modules insert 1 completed + 1 pending lesson each
  const inProgressModules = DEMO_MODULE_IDS.slice(5, 10);
  for (const moduleId of inProgressModules) {
    lessons.push({
      id: uid(),
      moduleId,
      lessonId: `${moduleId}-lesson-1`,
      completed: true,
      completedAt: now,
    });
    lessons.push({
      id: uid(),
      moduleId,
      lessonId: `${moduleId}-lesson-2`,
      completed: false,
      completedAt: null,
    });
  }

  await db.insert(schema.bimtekLessons).values(lessons);
  console.log(`  ↳ bimtek_lessons: inserted ${lessons.length} lesson rows.`);
}

// ---------------------------------------------------------------------------
// Quiz Scores
// ---------------------------------------------------------------------------

async function seedQuizScores() {
  const existing = await db.select().from(schema.quizScores);
  if (existing.length > 0) {
    console.log(`  ↳ quiz_scores: ${existing.length} rows already exist, skipping.`);
    return;
  }

  const categories = ['Sipil', 'K3', 'Standar', 'Material', 'Manajemen', 'Jalan', 'Elektrikal', 'Mekanikal'];
  const rows = categories.map((category, i) => ({
    id: uid(),
    category,
    score: 14 - i,
    totalQuestions: 15,
    takenAt: new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000),
  }));

  await db.insert(schema.quizScores).values(rows);
  console.log(`  ↳ quiz_scores: inserted ${rows.length} quiz score rows.`);
}

async function seedUserQuizScores(users: { id: string }[]) {
  const existing = await db.select().from(schema.userQuizScores);
  if (existing.length > 0) {
    console.log(`  ↳ user_quiz_scores: ${existing.length} rows already exist, skipping.`);
    return;
  }

  const categories = ['Sipil', 'K3', 'Standar', 'Material', 'Manajemen'];
  const rows: (typeof schema.userQuizScores.$inferInsert)[] = [];

  for (const user of users.slice(0, 3)) {
    for (const [i, category] of categories.entries()) {
      rows.push({
        id: uid(),
        userId: user.id,
        category,
        score: 12 - i,
        totalQuestions: 15,
        takenAt: new Date(Date.now() - i * 3 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
  }

  await db.insert(schema.userQuizScores).values(rows);
  console.log(`  ↳ user_quiz_scores: inserted ${rows.length} rows.`);
}

// ---------------------------------------------------------------------------
// Offline Events
// ---------------------------------------------------------------------------

async function seedOfflineEvents() {
  const existing = await db.select().from(schema.offlineEvents);
  if (existing.length > 0) {
    console.log(`  ↳ offline_events: ${existing.length} rows already exist, skipping.`);
    return;
  }

  const now = new Date().toISOString();
  const events: (typeof schema.offlineEvents.$inferInsert)[] = [
    {
      id: 'evt-001',
      title: 'BIMTEK K3 Konstruksi Gedung Bertingkat',
      description:
        'Pelatihan intensif mengenai keselamatan dan kesehatan kerja (K3) pada proyek konstruksi gedung bertingkat. Peserta akan mendapatkan pemahaman mendalam tentang identifikasi bahaya, penggunaan APD, dan prosedur tanggap darurat.',
      instructorName: 'Ir. Budi Santoso, MT',
      instructorPhone: '0812-3456-7890',
      location: 'Hotel Aston Priority, Jl. Sudirman No. 10',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      date: '2026-09-15',
      time: '08:00',
      duration: 8,
      capacity: 30,
      registered: 22,
      price: 1500000,
      module: 'K3 Konstruksi',
      category: 'K3',
      status: 'open',
      createdAt: now,
    },
    {
      id: 'evt-002',
      title: 'BIMTEK Manajemen Proyek Konstruksi',
      description:
        'Workshop manajemen proyek untuk tenaga ahli konstruksi. Materi meliputi perencanaan jadwal, cost control, manajemen risiko, dan koordinasi tim di lapangan menggunakan metode terkini.',
      instructorName: 'Dr. Ahmad Wijaya, ST, MT',
      instructorPhone: '0813-9876-5432',
      location: 'Gedung LPJK Jawa Barat, Jl. Soekarno Hatta No. 458',
      city: 'Bandung',
      province: 'Jawa Barat',
      date: '2026-09-22',
      time: '08:30',
      duration: 8,
      capacity: 40,
      registered: 35,
      price: 2000000,
      module: 'Manajemen Proyek',
      category: 'Manajemen',
      status: 'full',
      createdAt: now,
    },
    {
      id: 'evt-003',
      title: 'BIMTEK Struktur Beton Bertulang',
      description:
        'Pelatihan teknis struktur beton bertulang sesuai SNI 2847. Mencakup perhitungan tulangan, metode pengecoran, quality control mutu beton, dan pembacaan gambar struktur.',
      instructorName: 'Prof. Ir. Bambang Susilo, Ph.D.',
      instructorPhone: '0813-3334-4455',
      location: 'LPJK Provinsi Jawa Tengah, Jl. Pemuda No. 150',
      city: 'Semarang',
      province: 'Jawa Tengah',
      date: '2026-10-05',
      time: '08:00',
      duration: 8,
      capacity: 35,
      registered: 20,
      price: 1750000,
      module: 'Struktur Beton',
      category: 'Sipil',
      status: 'open',
      createdAt: now,
    },
    {
      id: 'evt-004',
      title: 'Bimtek Instalasi Listrik Gedung',
      description: 'Pelatihan teknis instalasi listrik gedung sesuai PUIL 2021. Include ujian praktik.',
      instructorName: 'Ir. Made Surya, ST',
      instructorPhone: '0821-4455-6677',
      location: 'Balai Diklat PU',
      city: 'Denpasar',
      province: 'Bali',
      date: '2026-10-12',
      time: '09:00',
      duration: 8,
      capacity: 20,
      registered: 8,
      price: 1600000,
      module: 'Instalasi Listrik',
      category: 'Elektrikal',
      status: 'open',
      createdAt: now,
    },
    {
      id: 'evt-005',
      title: 'Bimtek Pengadaan Barang/Jasa Perpres 46/2025',
      description: 'Sosialisasi dan pelatihan mendalam Perpres 46/2025 tentang Pengadaan Barang/Jasa Pemerintah.',
      instructorName: 'Dr. Rina Susilowati, SH, MH',
      instructorPhone: '0815-7788-9900',
      location: 'Hotel Sari Pan Pacific',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      date: '2026-10-20',
      time: '08:00',
      duration: 8,
      capacity: 50,
      registered: 31,
      price: 2500000,
      module: 'Pengadaan & Tender',
      category: 'Pengadaan',
      status: 'open',
      createdAt: now,
    },
    {
      id: 'evt-006',
      title: 'Bimtek ISO 9001:2015 Internal Auditor',
      description: 'Pelatihan auditor internal Sistem Manajemen Mutu ISO 9001:2015 lengkap dengan simulasi audit.',
      instructorName: 'Ir. Joko Pramono, MT',
      instructorPhone: '0819-1122-3344',
      location: 'Gedung KADIN',
      city: 'Semarang',
      province: 'Jawa Tengah',
      date: '2026-11-03',
      time: '08:00',
      duration: 16,
      capacity: 35,
      registered: 12,
      price: 3500000,
      module: 'ISO Management',
      category: 'ISO',
      status: 'open',
      createdAt: now,
    },
    {
      id: 'evt-007',
      title: 'Bimtek Regulasi SBU & SKK Terbaru',
      description: 'Update regulasi Sertifikat Badan Usaha dan Sertifikat Kompetensi Kerja sesuai Permen PU 7/2024.',
      instructorName: 'Ir. Dewi Lestari, MT',
      instructorPhone: '0822-5566-7788',
      location: 'Hotel Santika',
      city: 'Yogyakarta',
      province: 'DI Yogyakarta',
      date: '2026-11-10',
      time: '08:30',
      duration: 8,
      capacity: 45,
      registered: 20,
      price: 1800000,
      module: 'Regulasi',
      category: 'Regulasi',
      status: 'open',
      createdAt: now,
    },
    {
      id: 'evt-008',
      title: 'Bimtek BIM (Building Information Modeling)',
      description: 'Pelatihan BIM fundamental menggunakan Revit dan teknik kolaborasi digital.',
      instructorName: 'Michael Tanoto, ST, M.Arch',
      instructorPhone: '0816-9900-1122',
      location: 'Pusat Inovasi Digital Konstruksi',
      city: 'Surabaya',
      province: 'Jawa Timur',
      date: '2026-11-17',
      time: '09:00',
      duration: 16,
      capacity: 20,
      registered: 15,
      price: 4000000,
      module: 'Digital',
      category: 'Digital',
      status: 'open',
      createdAt: now,
    },
  ];

  await db.insert(schema.offlineEvents).values(events);
  console.log(`  ↳ offline_events: inserted ${events.length} events.`);
}

// ---------------------------------------------------------------------------
// Activities
// ---------------------------------------------------------------------------

async function seedActivities() {
  const existing = await db.select().from(schema.activities);
  if (existing.length > 0) {
    console.log(`  ↳ activities: ${existing.length} rows already exist, skipping.`);
    return;
  }

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const rows: (typeof schema.activities.$inferInsert)[] = [
    {
      id: uid(),
      type: 'bimtek',
      title: 'Modul Selesai: K3 Konstruksi Gedung',
      description: 'Berhasil menyelesaikan modul K3 Konstruksi Gedung dan mendapat 15 PKB poin.',
      timestamp: new Date(now - 1 * day),
      metadata: JSON.stringify({ moduleId: 'k3-1', pkb: 15 }),
    },
    {
      id: uid(),
      type: 'quiz',
      title: 'Quiz Sipil — Nilai 93%',
      description: 'Menyelesaikan quiz kategori Sipil dengan skor 14/15 soal benar.',
      timestamp: new Date(now - 2 * day),
      metadata: JSON.stringify({ category: 'Sipil', score: 14, total: 15 }),
    },
    {
      id: uid(),
      type: 'bimtek',
      title: 'Modul Selesai: Teknik Fondasi Gedung',
      description: 'Berhasil menyelesaikan modul Teknik Fondasi Gedung dan mendapat 10 PKB poin.',
      timestamp: new Date(now - 3 * day),
      metadata: JSON.stringify({ moduleId: 'sipil-gedung-1', pkb: 10 }),
    },
    {
      id: uid(),
      type: 'event',
      title: 'Mendaftar: BIMTEK K3 Konstruksi Gedung Bertingkat',
      description: 'Berhasil mendaftar untuk event BIMTEK K3 Konstruksi Gedung di Jakarta.',
      timestamp: new Date(now - 5 * day),
      metadata: JSON.stringify({ eventId: 'evt-001' }),
    },
    {
      id: uid(),
      type: 'quiz',
      title: 'Quiz K3 — Nilai 87%',
      description: 'Menyelesaikan quiz kategori K3 dengan skor 13/15 soal benar.',
      timestamp: new Date(now - 7 * day),
      metadata: JSON.stringify({ category: 'K3', score: 13, total: 15 }),
    },
    {
      id: uid(),
      type: 'bimtek',
      title: 'Modul Selesai: Struktur Beton Bertulang',
      description: 'Berhasil menyelesaikan modul Struktur Beton Bertulang dan mendapat 12 PKB poin.',
      timestamp: new Date(now - 9 * day),
      metadata: JSON.stringify({ moduleId: 'sipil-gedung-2', pkb: 12 }),
    },
    {
      id: uid(),
      type: 'achievement',
      title: 'Pencapaian: Pemula BIMTEK',
      description: 'Menyelesaikan 5 modul BIMTEK pertama.',
      timestamp: new Date(now - 12 * day),
      metadata: JSON.stringify({ achievementId: 'bimtek-beginner' }),
    },
  ];

  await db.insert(schema.activities).values(rows);
  console.log(`  ↳ activities: inserted ${rows.length} activity rows.`);
}

// ---------------------------------------------------------------------------
// Achievements
// ---------------------------------------------------------------------------

async function seedAchievements() {
  const existing = await db.select().from(schema.achievements);
  if (existing.length > 0) {
    console.log(`  ↳ achievements: ${existing.length} rows already exist, skipping.`);
    return;
  }

  const rows: (typeof schema.achievements.$inferInsert)[] = [
    { id: uid(), achievementId: 'first-module', unlockedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    { id: uid(), achievementId: 'bimtek-beginner', unlockedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000) },
    { id: uid(), achievementId: 'quiz-ace', unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
    { id: uid(), achievementId: 'streak-7', unlockedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
  ];

  await db.insert(schema.achievements).values(rows);
  console.log(`  ↳ achievements: inserted ${rows.length} achievements.`);
}

// ---------------------------------------------------------------------------
// Bookmarks
// ---------------------------------------------------------------------------

async function seedBookmarks() {
  const existing = await db.select().from(schema.bookmarks);
  if (existing.length > 0) {
    console.log(`  ↳ bookmarks: ${existing.length} rows already exist, skipping.`);
    return;
  }

  const rows: (typeof schema.bookmarks.$inferInsert)[] = [
    { id: uid(), type: 'bimtek', itemId: 'iso9001-1', title: 'ISO 9001:2015 - Pengenalan Sistem Mutu', createdAt: new Date() },
    { id: uid(), type: 'bimtek', itemId: 'pengadaan-2', title: 'Perpres 46/2025 - Pengadaan Baru', createdAt: new Date() },
    { id: uid(), type: 'event', itemId: 'evt-005', title: 'Bimtek Pengadaan Barang/Jasa Perpres 46/2025', createdAt: new Date() },
  ];

  await db.insert(schema.bookmarks).values(rows);
  console.log(`  ↳ bookmarks: inserted ${rows.length} bookmarks.`);
}

// ---------------------------------------------------------------------------
// Favorites (module shortcuts)
// ---------------------------------------------------------------------------

async function seedFavorites() {
  const existing = await db.select().from(schema.favorites);
  if (existing.length > 0) {
    console.log(`  ↳ favorites: ${existing.length} rows already exist, skipping.`);
    return;
  }

  const rows: (typeof schema.favorites.$inferInsert)[] = [
    { id: uid(), moduleId: 'k3-1', createdAt: new Date() },
    { id: uid(), moduleId: 'manajemen-1', createdAt: new Date() },
    { id: uid(), moduleId: 'regulasi-1', createdAt: new Date() },
  ];

  await db.insert(schema.favorites).values(rows);
  console.log(`  ↳ favorites: inserted ${rows.length} favorites.`);
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

async function seedSettings() {
  const existing = await db.select().from(schema.settings);
  if (existing.length > 0) {
    console.log(`  ↳ settings: ${existing.length} rows already exist, skipping.`);
    return;
  }

  const rows: (typeof schema.settings.$inferInsert)[] = [
    { key: 'notifications_enabled', value: 'true' },
    { key: 'language', value: 'id' },
    { key: 'theme', value: 'light' },
    { key: 'seeded', value: 'true' },
  ];

  await db.insert(schema.settings).values(rows);
  console.log(`  ↳ settings: inserted ${rows.length} settings.`);
}

// ---------------------------------------------------------------------------
// User Progress (per-user module tracking)
// ---------------------------------------------------------------------------

async function seedUserProgress(users: { id: string }[]) {
  const existing = await db.select().from(schema.userProgress);
  if (existing.length > 0) {
    console.log(`  ↳ user_progress: ${existing.length} rows already exist, skipping.`);
    return;
  }

  const now = new Date().toISOString();
  const rows: (typeof schema.userProgress.$inferInsert)[] = [];

  const completedForDemo = ['sipil-gedung-1', 'sipil-gedung-2', 'k3-1'];
  const inProgressForDemo = ['manajemen-1', 'pengadaan-1'];

  const demoUser = users.find(u => u.id === 'user-demo-001');
  if (!demoUser) return;

  for (const moduleId of completedForDemo) {
    rows.push({
      id: uid(),
      oderId: demoUser.id,
      moduleId,
      lessonId: null,
      completed: true,
      progress: 1.0,
      completedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  }

  for (const moduleId of inProgressForDemo) {
    rows.push({
      id: uid(),
      oderId: demoUser.id,
      moduleId,
      lessonId: null,
      completed: false,
      progress: 0.5,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  await db.insert(schema.userProgress).values(rows);
  console.log(`  ↳ user_progress: inserted ${rows.length} rows.`);
}

// ---------------------------------------------------------------------------
// Quiz Questions
// ---------------------------------------------------------------------------

async function seedQuizQuestions() {
  const existing = await db.select().from(schema.quizQuestions);
  if (existing.length > 0) {
    console.log(`  ↳ quiz_questions: ${existing.length} rows already exist, skipping.`);
    return;
  }

  const now = new Date().toISOString();
  const questions: (typeof schema.quizQuestions.$inferInsert)[] = [
    { question: 'Apa fungsi utama pondasi pada struktur bangunan?', category: 'Sipil', options: JSON.stringify(['Menahan beban struktural', 'Dekorasi', 'Insulasi', 'Ventilasi']), correct: 0, createdAt: now, updatedAt: now },
    { question: 'SNI yang mengatur perencanaan struktur beton adalah?', category: 'Standar', options: JSON.stringify(['SNI 1726', 'SNI 2847', 'SNI 6371', 'SNI 1729']), correct: 1, createdAt: now, updatedAt: now },
    { question: 'APD yang wajib digunakan di ketinggian adalah?', category: 'K3', options: JSON.stringify(['Helm dan sepatu', 'Harness dan safety belt', 'Kacamata dan sarung tangan', 'Topi dan rompi']), correct: 1, createdAt: now, updatedAt: now },
    { question: 'Apa kepanjangan AMDAL?', category: 'Lingkungan', options: JSON.stringify(['Analisis Manajemen Dampak', 'Analisis Mengenai Dampak Lingkungan', 'Assessment Muka Dasar Laut', 'Auditing Material Dienstbilitas']), correct: 1, createdAt: now, updatedAt: now },
    { question: 'Steel reinforcement pada beton berfungsi untuk?', category: 'Sipil', options: JSON.stringify(['Mengurangi berat', 'Menambah kekuatan tarik', 'Memperindah tampilan', 'Menambah kedap air']), correct: 1, createdAt: now, updatedAt: now },
    { question: 'Berapa kuat tekan minimum beton struktural (MPa)?', category: 'Material', options: JSON.stringify(['15 MPa', '20 MPa', '25 MPa', '30 MPa']), correct: 2, createdAt: now, updatedAt: now },
    { question: 'Alat pelindung diri (APD) untuk pekerjaan tinggi wajib menggunakan?', category: 'K3', options: JSON.stringify(['Helm', 'Safety harness', 'Sepatu safety', 'Kacamata']), correct: 1, createdAt: now, updatedAt: now },
    { question: 'Floor Area Ratio (FAR) adalah?', category: 'Perencanaan', options: JSON.stringify(['Rasio biaya lantai', 'Rasio luas lantai terhadap luas tanah', 'Rasio finishing', 'Rasio fondasi']), correct: 1, createdAt: now, updatedAt: now },
    { question: 'Konstruksi metode precast adalah?', category: 'Metode', options: JSON.stringify(['Cor di tempat', 'Pabrikasi di luar lokasi', 'Pasang batu bata', 'Catatan arsitektur']), correct: 1, createdAt: now, updatedAt: now },
    { question: 'Apa fungsi utama Scaffolding?', category: 'K3', options: JSON.stringify(['Dekorasi', 'Penyangga sementara', 'Jalur kabel', 'Drainase']), correct: 1, createdAt: now, updatedAt: now },
    { question: 'Peraturan Pemerintah yang mengatur JLAP adalah?', category: 'Regulasi', options: JSON.stringify(['PP 14/2021', 'PP 34/2021', 'PP 24/2021', 'PP 44/2021']), correct: 1, createdAt: now, updatedAt: now },
    { question: 'Slump test digunakan untuk mengukur?', category: 'Material', options: JSON.stringify(['Kekuatan beton', 'Workability beton', 'Durabilitas', 'Berat jenis']), correct: 1, createdAt: now, updatedAt: now },
    { question: 'Jenis pondasi yang cocok untuk tanah lunak adalah?', category: 'Sipil', options: JSON.stringify(['Raft foundation', 'Pile foundation', 'Ring foundation', 'Strip foundation']), correct: 1, createdAt: now, updatedAt: now },
    { question: 'Fire rating minimum untuk struktur baja adalah?', category: 'K3', options: JSON.stringify(['30 menit', '60 menit', '90 menit', '120 menit']), correct: 1, createdAt: now, updatedAt: now },
    { question: 'Kontrak yang berdasarkan lumpsum adalah?', category: 'Kontrak', options: JSON.stringify(['Bayar sesuai volume', 'Bayar sesuai waktu', 'Harga tetap total', 'Cost plus fee']), correct: 2, createdAt: now, updatedAt: now },
    { question: 'Critical Path Method (CPM) adalah?', category: 'Manajemen', options: JSON.stringify(['Metode biaya', 'Metode penjadwalan', 'Metode pengawasan', 'Metode quality']), correct: 1, createdAt: now, updatedAt: now },
    { question: 'Yang bukan merupakan jenis crane adalah?', category: 'Alat', options: JSON.stringify(['Tower crane', 'Mobile crane', 'Forklift crane', 'Crawler crane']), correct: 2, createdAt: now, updatedAt: now },
    { question: 'Besi tulangan polos (plain bar) memiliki simbol?', category: 'Material', options: JSON.stringify(['D', 'U', 'P', 'R']), correct: 2, createdAt: now, updatedAt: now },
    { question: 'Fungsi expansion joint adalah?', category: 'Sipil', options: JSON.stringify(['Mengikat struktur', 'Mungkinkan gerakan termal', 'Memperkuat kolom', 'Dekorasi']), correct: 1, createdAt: now, updatedAt: now },
    { question: 'PUIL adalah singkatan dari?', category: 'Elektrikal', options: JSON.stringify(['Pedoman Umum Instalasi Listrik', 'Petunjuk Utama Instalasi Listrik', 'Peraturan Umum Instalasi Listrik', 'Peraturan Útama Instalasi Listrik']), correct: 2, createdAt: now, updatedAt: now },
    { question: 'Kapasitas genset diukur dalam?', category: 'Elektrikal', options: JSON.stringify(['Volt', 'Ampere', 'kVA', 'Watt']), correct: 2, createdAt: now, updatedAt: now },
    { question: 'AC Split kapasitas besar disebut?', category: 'Mekanikal', options: JSON.stringify(['Window type', 'Split wall', 'VRV/VRF', 'Portable']), correct: 2, createdAt: now, updatedAt: now },
    { question: 'Sistem sprinkler menggunakan standar?', category: 'Mekanikal', options: JSON.stringify(['ISO 9001', 'NFPA 13', 'ASTM A36', 'BS 1139']), correct: 1, createdAt: now, updatedAt: now },
    { question: 'Pipa PVC ukuran 4 inch sama dengan?', category: 'Mekanikal', options: JSON.stringify(['100 mm', '110 mm', '125 mm', '150 mm']), correct: 1, createdAt: now, updatedAt: now },
    { question: 'Debit air diukur dalam?', category: 'Hydraulic', options: JSON.stringify(['m/s', 'm³/s', 'kg/m', 'Pa']), correct: 1, createdAt: now, updatedAt: now },
    { question: 'Boiler berfungsi untuk?', category: 'Mekanikal', options: JSON.stringify(['Pendinginan', 'Pemanas air', 'Kompresi', 'Generasi']), correct: 1, createdAt: now, updatedAt: now },
    { question: 'HVAC adalah singkatan dari?', category: 'Mekanikal', options: JSON.stringify(['Heat, Ventilation, Air Conditioning', 'High Voltage Alternating Current', 'Heat Valve Air Compressor', 'Horizontal Ventilation AC']), correct: 0, createdAt: now, updatedAt: now },
    { question: 'Tegangan listrik gedung menggunakan?', category: 'Elektrikal', options: JSON.stringify(['220V 1 phase', '380V 3 phase', '110V DC', '1000V AC']), correct: 1, createdAt: now, updatedAt: now },
    { question: 'MCB berfungsi untuk?', category: 'Elektrikal', options: JSON.stringify(['Mengubah voltage', 'Proteksi overload', 'Mengubah frekuensi', 'Menyimpan energi']), correct: 1, createdAt: now, updatedAt: now },
    { question: 'Grounding electrode resistance idealnya?', category: 'Elektrikal', options: JSON.stringify(['< 1 Ohm', '< 5 Ohm', '< 10 Ohm', '< 50 Ohm']), correct: 1, createdAt: now, updatedAt: now },
    { question: 'Material yang tidak cocok untuk struktur tahan api adalah?', category: 'Material', options: JSON.stringify(['Beton', 'Batu bata', 'Baja', 'Kayu']), correct: 3, createdAt: now, updatedAt: now },
    { question: 'Uji beban (load test) pada jembatan menggunakan?', category: 'Pengujian', options: JSON.stringify(['Beban hidup', 'Beban mati', 'Beban desain', 'Semua benar']), correct: 3, createdAt: now, updatedAt: now },
    { question: 'Beton bertulang dalam bahasa sehari-hari disebut?', category: 'Sipil', options: JSON.stringify(['Reinforced concrete', 'Prestressed concrete', 'Plain concrete', 'Mass concrete']), correct: 0, createdAt: now, updatedAt: now },
    { question: 'Ductility material menunjukkan?', category: 'Material', options: JSON.stringify(['Kekuatan', 'Kekerasan', 'Kemampuan deformasi', 'Kekakuan']), correct: 2, createdAt: now, updatedAt: now },
    { question: 'Freeboard minimum pada bendungan adalah?', category: 'Hydraulic', options: JSON.stringify(['0.5 m', '1.0 m', '1.5 m', '2.0 m']), correct: 1, createdAt: now, updatedAt: now },
    { question: 'Peak Expiratory Flow digunakan untuk?', category: 'K3', options: JSON.stringify(['Kebugaran jantung', 'Fungsi paru', 'Kekuatan tangan', 'Pendengaran']), correct: 1, createdAt: now, updatedAt: now },
    { question: 'Noise level aman di tempat kerja adalah?', category: 'K3', options: JSON.stringify(['< 85 dB', '< 90 dB', '< 100 dB', '< 120 dB']), correct: 0, createdAt: now, updatedAt: now },
    { question: 'MSDS adalah?', category: 'K3', options: JSON.stringify(['Manual Safety Data Sheet', 'Material Safety Data Sheet', 'Mechanical Safety Design', 'Management Safety Documentation']), correct: 1, createdAt: now, updatedAt: now },
    { question: 'LOTO dalam K3 berarti?', category: 'K3', options: JSON.stringify(['List of Tools', 'Lock Out Tag Out', 'Low Oil Temperature', 'Life Of Tools']), correct: 1, createdAt: now, updatedAt: now },
    { question: 'JSA adalah?', category: 'K3', options: JSON.stringify(['Job Safety Analysis', 'Japanese Safety Association', 'Joint Safety Audit', 'Junior Safety Agent']), correct: 0, createdAt: now, updatedAt: now },
    { question: 'Tiang lampu jalan menggunakan pondasi?', category: 'Sipil', options: JSON.stringify(['Raft', 'Pile', 'Spread footing', 'Caisson']), correct: 2, createdAt: now, updatedAt: now },
    { question: 'Asphalt mixing plant menghasilkan?', category: 'Jalan', options: JSON.stringify(['Beton jadi', 'Campuran aspal', 'Agregat', 'Subbase']), correct: 1, createdAt: now, updatedAt: now },
    { question: 'Marshall test untuk?', category: 'Jalan', options: JSON.stringify(['Tanah', 'Aspal', 'Baja', 'Beton']), correct: 1, createdAt: now, updatedAt: now },
    { question: 'CBR test mengukur?', category: 'Jalan', options: JSON.stringify(['Kekuatan jalan', 'Daya dukung tanah', 'Ketebalan perkerasan', 'Kekasaran']), correct: 1, createdAt: now, updatedAt: now },
    { question: 'Lapisan aus (wearing course) menggunakan?', category: 'Jalan', options: JSON.stringify(['Limestone', 'Hot mix asphalt', 'Batu pecah', 'Pasir']), correct: 1, createdAt: now, updatedAt: now },
    { question: 'PMI (Physical Metal Identification) meliputi?', category: 'Material', options: JSON.stringify(['Komposisi kimia', 'Warna', 'Berat', 'Ukuran']), correct: 0, createdAt: now, updatedAt: now },
    { question: 'NDT adalah?', category: 'Pengujian', options: JSON.stringify(['New Design Technology', 'Non Destructive Testing', 'National Design Test', 'Nuclear Data Test']), correct: 1, createdAt: now, updatedAt: now },
    { question: 'Ultrasonic test mendeteksi?', category: 'Pengujian', options: JSON.stringify(['Retak internal', 'Warna', 'Berat', 'Ukuran']), correct: 0, createdAt: now, updatedAt: now },
    { question: 'Weldability baja dipengaruhi oleh?', category: 'Material', options: JSON.stringify(['Kadar karbon', 'Kadar manganese', 'Kadar chromium', 'Semua benar']), correct: 3, createdAt: now, updatedAt: now },
    { question: 'Galvanisasi melindungi baja dari?', category: 'Material', options: JSON.stringify(['Api', 'Korosi', 'Suhu tinggi', 'Tekanan']), correct: 1, createdAt: now, updatedAt: now },
    { question: 'Kontraktor all risk insurance melindungi?', category: 'Asuransi', options: JSON.stringify(['Pekerja', 'Material dan peralatan', 'Properti sekitar', 'Semua benar']), correct: 3, createdAt: now, updatedAt: now },
    { question: 'Retensioning pada post-tension dilakukan?', category: 'Metode', options: JSON.stringify(['Sebelum beton keras', 'Sesudah beton keras', 'Saat pengecoran', 'Setiap saat']), correct: 1, createdAt: now, updatedAt: now },
    { question: 'Grout digunakan untuk?', category: 'Material', options: JSON.stringify(['Finishing', 'Mengisi void', 'Dekorasi', 'Insulasi']), correct: 1, createdAt: now, updatedAt: now },
    { question: 'Waterstop pada beton berfungsi?', category: 'Sipil', options: JSON.stringify(['Menghilangkan air', 'Menghentikan rembesan', 'Menambah kekuatan', 'Dekorasi']), correct: 1, createdAt: now, updatedAt: now },
    { question: 'Shotcrete adalah?', category: 'Metode', options: JSON.stringify(['Cat beton', 'Semprotan beton', 'Beton polos', 'Beton pracetak']), correct: 1, createdAt: now, updatedAt: now },
    { question: 'Tegangan geser izin baja struktural sekitar?', category: 'Material', options: JSON.stringify(['0.4 fy', '0.5 fy', '0.6 fy', '0.7 fy']), correct: 2, createdAt: now, updatedAt: now },
    { question: 'Rafter pada atap berfungsi?', category: 'Sipil', options: JSON.stringify(['Mendukung beban atap', 'Drainase', 'Dekorasi', 'Ventilasi']), correct: 0, createdAt: now, updatedAt: now },
    { question: 'Batang tekan (column) menerima?', category: 'Sipil', options: JSON.stringify(['Tarik', 'Tekan', 'Geser', 'Torsi']), correct: 1, createdAt: now, updatedAt: now },
    { question: 'Saggy floor menunjukkan?', category: 'Struktur', options: JSON.stringify(['Beban berlebih', 'Fondasi masalah', 'Keduanya benar', 'Tidak ada']), correct: 2, createdAt: now, updatedAt: now },
    { question: 'Persiapan sebelum welding meliputi?', category: 'Manufaktur', options: JSON.stringify(['Cleaning', 'Preheating', 'Welding', 'A dan B benar']), correct: 3, createdAt: now, updatedAt: now },
    { question: 'Welder qualification test menggunakan?', category: 'Manufaktur', options: JSON.stringify(['Visual test', 'Destructive test', 'NDT', 'Semua benar']), correct: 3, createdAt: now, updatedAt: now },
    { question: 'PQR dalam welding adalah?', category: 'Manufaktur', options: JSON.stringify(['Procedure Qualification Record', 'Process Quality Report', 'Professional Qualification', 'Production Quality Review']), correct: 0, createdAt: now, updatedAt: now },
    { question: 'SMA (Stone Matrix Asphalt) menggunakan?', category: 'Jalan', options: JSON.stringify(['Agregat halus', 'Agregat kasar', 'Filler mineral', 'B and C']), correct: 3, createdAt: now, updatedAt: now },
    { question: 'Joint sealant berfungsi?', category: 'Jalan', options: JSON.stringify(['Mengisi celah', 'Mencegah air masuk', 'Memperkuat', 'Dekorasi']), correct: 1, createdAt: now, updatedAt: now },
    { question: 'Micro surfacing adalah?', category: 'Jalan', options: JSON.stringify(['Lapisan tipis', 'Lapisan tebal', 'Fondasi', 'Subbase']), correct: 0, createdAt: now, updatedAt: now },
  ];

  await db.insert(schema.quizQuestions).values(questions);
  console.log(`  ↳ quiz_questions: inserted ${questions.length} questions.`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('🌱 Seeding database...\n');

  const users = await seedUsers();
  await seedProfile();
  await seedStreak();
  await seedBimtekProgress();
  await seedBimtekLessons();
  await seedQuizScores();
  await seedUserQuizScores(users);
  await seedOfflineEvents();
  await seedActivities();
  await seedAchievements();
  await seedBookmarks();
  await seedFavorites();
  await seedSettings();
  await seedUserProgress(users);
  await seedQuizQuestions();

  console.log('\n✅ Seed complete!');
  console.log('\nDemo accounts:');
  console.log('  Admin  → admin@bimtekkita.id  / admin123');
  console.log('  Admin  → admin@kilokode.com   / admin123');
  console.log('  User   → ahmad@demo.com       / demo123');
  console.log('  User   → budi@demo.com        / demo123');
  console.log('  User   → siti@demo.com        / demo123');
  console.log('  User   → hendra@demo.com      / demo123');
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
