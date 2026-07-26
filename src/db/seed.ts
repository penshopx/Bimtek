/**
 * Database seed script — populates demo data for BimtekKita.
 * Safe to run multiple times (idempotent via INSERT OR IGNORE).
 *
 * Usage: bun run db:seed
 */

import { db } from "./index";
import * as schema from "./schema";
import { sql } from "drizzle-orm";

// ── Helpers ────────────────────────────────────────────────────────────────

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

function uuid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const now = new Date().toISOString();

// ── Users ─────────────────────────────────────────────────────────────────

const users = [
  {
    id: "user-demo-admin",
    name: "Admin BimtekKita",
    email: "admin@bimtekkita.id",
    passwordHash: simpleHash("admin123"),
    role: "admin",
    phone: "081234567890",
    company: "BimtekKita",
    position: "Administrator",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "user-demo-1",
    name: "Budi Santoso",
    email: "budi@demo.com",
    passwordHash: simpleHash("demo123"),
    role: "user",
    phone: "081298765432",
    company: "PT Konstruksi Nusantara",
    position: "Site Engineer",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "user-demo-2",
    name: "Siti Rahayu",
    email: "siti@demo.com",
    passwordHash: simpleHash("demo123"),
    role: "user",
    phone: "085612345678",
    company: "CV Bangun Jaya",
    position: "Project Manager",
    createdAt: now,
    updatedAt: now,
  },
];

// ── Offline Events ────────────────────────────────────────────────────────

const offlineEvents = [
  {
    id: "evt-001",
    title: "BIMTEK K3 Konstruksi Gedung Bertingkat",
    description:
      "Pelatihan intensif mengenai keselamatan dan kesehatan kerja (K3) pada proyek konstruksi gedung bertingkat. Peserta akan mendapatkan pemahaman mendalam tentang identifikasi bahaya, penggunaan APD, dan prosedur tanggap darurat.",
    instructorName: "Ir. Hendra Gunawan, M.T.",
    instructorPhone: "081311122233",
    location: "Hotel Aston Priority, Jl. Sudirman No. 10",
    city: "Jakarta",
    province: "DKI Jakarta",
    date: "2026-08-15",
    time: "08:00",
    duration: 8,
    capacity: 30,
    registered: 12,
    price: 500000,
    module: "K3 Konstruksi",
    category: "K3",
    status: "open",
    createdAt: now,
  },
  {
    id: "evt-002",
    title: "BIMTEK Manajemen Proyek Konstruksi",
    description:
      "Workshop manajemen proyek untuk tenaga ahli konstruksi. Materi meliputi perencanaan jadwal, cost control, manajemen risiko, dan koordinasi tim di lapangan menggunakan metode terkini.",
    instructorName: "Dr. Ahmad Wijaya, S.T., M.T.",
    instructorPhone: "081322233344",
    location: "Gedung LPJK Jawa Barat, Jl. Soekarno Hatta No. 458",
    city: "Bandung",
    province: "Jawa Barat",
    date: "2026-08-22",
    time: "08:30",
    duration: 8,
    capacity: 25,
    registered: 8,
    price: 750000,
    module: "Manajemen Proyek",
    category: "Manajemen",
    status: "open",
    createdAt: now,
  },
  {
    id: "evt-003",
    title: "BIMTEK Struktur Beton Bertulang",
    description:
      "Pelatihan teknis struktur beton bertulang sesuai SNI 2847. Mencakup perhitungan tulangan, metode pengecoran, quality control mutu beton, dan pembacaan gambar struktur.",
    instructorName: "Prof. Ir. Bambang Susilo, Ph.D.",
    instructorPhone: "081333344455",
    location: "LPJK Provinsi Jawa Tengah, Jl. Pemuda No. 150",
    city: "Semarang",
    province: "Jawa Tengah",
    date: "2026-09-05",
    time: "08:00",
    duration: 8,
    capacity: 35,
    registered: 20,
    price: 600000,
    module: "Struktur Beton",
    category: "Sipil Gedung",
    status: "open",
    createdAt: now,
  },
  {
    id: "evt-004",
    title: "BIMTEK Instalasi Listrik Gedung",
    description:
      "Pelatihan instalasi sistem kelistrikan gedung bertingkat sesuai PUIL 2011. Materi meliputi perencanaan panel distribusi, grounding system, proteksi petir, dan pemeliharaan instalasi.",
    instructorName: "Ir. Dewi Lestari, M.T.",
    instructorPhone: "081344455566",
    location: "Hotel Santika, Jl. Gubernur Suryo No. 1",
    city: "Surabaya",
    province: "Jawa Timur",
    date: "2026-09-12",
    time: "09:00",
    duration: 8,
    capacity: 30,
    registered: 30,
    price: 650000,
    module: "Instalasi Listrik",
    category: "Elektrikal",
    status: "full",
    createdAt: now,
  },
  {
    id: "evt-005",
    title: "BIMTEK Penyusunan RAB Proyek",
    description:
      "Workshop penyusunan Rencana Anggaran Biaya (RAB) proyek konstruksi. Peserta akan mempelajari analisa harga satuan pekerjaan, perhitungan volume, dan penggunaan software estimasi biaya.",
    instructorName: "Ir. Rini Susilowati, M.M.",
    instructorPhone: "081355566677",
    location: "Graha Pena, Jl. Urip Sumoharjo No. 20",
    city: "Makassar",
    province: "Sulawesi Selatan",
    date: "2026-09-20",
    time: "08:00",
    duration: 8,
    capacity: 40,
    registered: 15,
    price: 550000,
    module: "RAB",
    category: "RAB",
    status: "open",
    createdAt: now,
  },
  {
    id: "evt-006",
    title: "BIMTEK Desain Jembatan Beton",
    description:
      "Pelatihan perencanaan dan desain jembatan beton sesuai standar Bina Marga. Materi mencakup analisis beban, perencanaan pondasi, dan metode pelaksanaan konstruksi jembatan.",
    instructorName: "Dr. Ir. Michael Tanoto, M.T.",
    instructorPhone: "081366677788",
    location: "BPSDM Provinsi Kalimantan Timur, Jl. Basuki Rahmat",
    city: "Balikpapan",
    province: "Kalimantan Timur",
    date: "2026-07-10",
    time: "08:00",
    duration: 8,
    capacity: 25,
    registered: 25,
    price: 700000,
    module: "Jembatan Beton",
    category: "Jalan",
    status: "completed",
    createdAt: now,
  },
  {
    id: "evt-007",
    title: "BIMTEK Plumbing dan Sanitasi Gedung",
    description:
      "Pelatihan sistem plumbing dan sanitasi pada gedung bertingkat. Mencakup perencanaan distribusi air bersih, sistem drainase, pengolahan air limbah, dan standar instalasi perpipaan.",
    instructorName: "Ir. Lisa Permata, M.T.",
    instructorPhone: "081377788899",
    location: "Hotel Grand Mercure, Jl. Gajah Mada No. 100",
    city: "Medan",
    province: "Sumatera Utara",
    date: "2026-10-03",
    time: "08:30",
    duration: 8,
    capacity: 30,
    registered: 5,
    price: 600000,
    module: "Plumbing",
    category: "Mekanikal",
    status: "open",
    createdAt: now,
  },
  {
    id: "evt-008",
    title: "BIMTEK Metode Pelaksanaan Konstruksi Jalan",
    description:
      "Pelatihan metode pelaksanaan konstruksi jalan dan perkerasan aspal. Materi meliputi spesifikasi teknis, pengujian material, metode pengaspalan, dan quality control perkerasan jalan.",
    instructorName: "Ir. Joko Pramono, M.T.",
    instructorPhone: "081388899900",
    location: "Balai Besar Pelaksanaan Jalan Nasional, Jl. Pelajar Pejuang",
    city: "Bandung",
    province: "Jawa Barat",
    date: "2026-10-17",
    time: "08:00",
    duration: 8,
    capacity: 35,
    registered: 10,
    price: 500000,
    module: "Konstruksi Jalan",
    category: "Jalan",
    status: "open",
    createdAt: now,
  },
];

// ── Streak ────────────────────────────────────────────────────────────────

const streakRow = {
  currentStreak: 0,
  longestStreak: 0,
  lastActivityDate: null,
  totalDays: 0,
};

// ── Seed ──────────────────────────────────────────────────────────────────

async function seed() {
  console.log("🌱 Seeding database...\n");

  // Users
  let userCount = 0;
  for (const user of users) {
    try {
      await db.insert(schema.users).values(user);
      userCount++;
    } catch {
      // Already exists — skip
    }
  }
  console.log(`✓ Users: ${userCount} inserted (${users.length - userCount} already existed)`);

  // Offline events
  let eventCount = 0;
  for (const event of offlineEvents) {
    try {
      await db.insert(schema.offlineEvents).values(event);
      eventCount++;
    } catch {
      // Already exists — skip
    }
  }
  console.log(`✓ Offline events: ${eventCount} inserted (${offlineEvents.length - eventCount} already existed)`);

  // Streak (only if table is empty)
  const existingStreak = await db.select().from(schema.streak);
  if (existingStreak.length === 0) {
    await db.insert(schema.streak).values(streakRow);
    console.log("✓ Streak: initialized");
  } else {
    console.log("✓ Streak: already exists, skipped");
  }

  console.log("\n✅ Seed complete!");
  console.log("\nDemo accounts:");
  console.log("  Admin  → admin@bimtekkita.id  / admin123");
  console.log("  User 1 → budi@demo.com        / demo123");
  console.log("  User 2 → siti@demo.com        / demo123");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
