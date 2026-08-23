// Shared SKK jabatan data used across the app

export interface SkkJabatan {
  id: string;
  name: string;
  level: string;
  subklasifikasi: string;
  bidang: 'Sipil' | 'Manajemen Pelaksanaan';
  /** BIMTEK categories most relevant for this jabatan */
  relatedCategories: string[];
}

export const BIDANG_OPTIONS = ['Sipil', 'Manajemen Pelaksanaan'] as const;
export type Bidang = typeof BIDANG_OPTIONS[number];

export const KUALIFIKASI_OPTIONS = ['Operator', 'Teknisi / Analis', 'Ahli'] as const;
export type Kualifikasi = typeof KUALIFIKASI_OPTIONS[number];

export const SKK_JABATAN: SkkJabatan[] = [
  // ── Bangunan Gedung (B) ───────────────────────────────────────────────────
  { id: 'B001', name: 'Ahli Madya Teknik Bangunan Gedung', level: 'Ahli Madya', subklasifikasi: 'B', bidang: 'Sipil', relatedCategories: ['Sipil Gedung', 'Manajemen', 'Quality', 'RAB'] },
  { id: 'B002', name: 'Ahli Teknik Bangunan Gedung', level: 'Ahli', subklasifikasi: 'B', bidang: 'Sipil', relatedCategories: ['Sipil Gedung', 'Manajemen', 'Quality'] },
  { id: 'B003', name: 'Teknisi Teknik Bangunan Gedung', level: 'Teknisi', subklasifikasi: 'B', bidang: 'Sipil', relatedCategories: ['Sipil Gedung', 'K3', 'Safety'] },
  { id: 'B004', name: 'Pelaksana Teknik Bangunan Gedung', level: 'Pelaksana', subklasifikasi: 'B', bidang: 'Sipil', relatedCategories: ['Sipil Gedung', 'K3'] },
  { id: 'B005', name: 'Ahli Desain Interior', level: 'Ahli', subklasifikasi: 'B', bidang: 'Sipil', relatedCategories: ['Sipil Gedung', 'Digital'] },
  { id: 'B006', name: 'Ahli Arsitektur Lanskap', level: 'Ahli', subklasifikasi: 'B', bidang: 'Sipil', relatedCategories: ['Sipil Gedung', 'Lingkungan'] },
  { id: 'B007', name: 'Manager Proyek Gedung', level: 'Manager', subklasifikasi: 'B', bidang: 'Sipil', relatedCategories: ['Manajemen', 'RAB', 'Quality', 'Sipil Gedung'] },
  // ── Teknik Sipil (C) ─────────────────────────────────────────────────────
  { id: 'C001', name: 'Ahli Madya Teknik Sipil', level: 'Ahli Madya', subklasifikasi: 'C', bidang: 'Sipil', relatedCategories: ['Sipil Gedung', 'Jalan', 'Quality', 'Manajemen'] },
  { id: 'C002', name: 'Ahli Teknik Sipil', level: 'Ahli', subklasifikasi: 'C', bidang: 'Sipil', relatedCategories: ['Sipil Gedung', 'Jalan', 'Quality'] },
  { id: 'C003', name: 'Teknisi Teknik Sipil', level: 'Teknisi', subklasifikasi: 'C', bidang: 'Sipil', relatedCategories: ['Sipil Gedung', 'K3', 'Safety'] },
  { id: 'C004', name: 'Pelaksana Teknik Sipil', level: 'Pelaksana', subklasifikasi: 'C', bidang: 'Sipil', relatedCategories: ['Sipil Gedung', 'K3'] },
  { id: 'C005', name: 'Ahli Geoteknik', level: 'Ahli', subklasifikasi: 'C', bidang: 'Sipil', relatedCategories: ['Sipil Gedung', 'Quality'] },
  { id: 'C006', name: 'Ahli Hidrologi', level: 'Ahli', subklasifikasi: 'C', bidang: 'Sipil', relatedCategories: ['Jalan', 'Lingkungan'] },
  { id: 'C007', name: 'Ahli Struktur', level: 'Ahli', subklasifikasi: 'C', bidang: 'Sipil', relatedCategories: ['Sipil Gedung', 'Quality', 'Digital'] },
  // ── Mekanikal (D) ────────────────────────────────────────────────────────
  { id: 'D001', name: 'Ahli Madya Teknik Mekanikal', level: 'Ahli Madya', subklasifikasi: 'D', bidang: 'Sipil', relatedCategories: ['Mekanikal', 'K3', 'Safety'] },
  { id: 'D002', name: 'Ahli Teknik Mekanikal', level: 'Ahli', subklasifikasi: 'D', bidang: 'Sipil', relatedCategories: ['Mekanikal', 'K3'] },
  { id: 'D003', name: 'Teknisi Teknik Mekanikal', level: 'Teknisi', subklasifikasi: 'D', bidang: 'Sipil', relatedCategories: ['Mekanikal', 'K3'] },
  { id: 'D004', name: 'Ahli Plumbing', level: 'Ahli', subklasifikasi: 'D', bidang: 'Sipil', relatedCategories: ['Mekanikal'] },
  { id: 'D005', name: 'Ahli HVAC', level: 'Ahli', subklasifikasi: 'D', bidang: 'Sipil', relatedCategories: ['Mekanikal', 'Elektrikal'] },
  { id: 'D006', name: 'Ahli Fire Protection', level: 'Ahli', subklasifikasi: 'D', bidang: 'Sipil', relatedCategories: ['Mekanikal', 'Safety', 'K3'] },
  // ── Elektrikal (E) ───────────────────────────────────────────────────────
  { id: 'E001', name: 'Ahli Madya Teknik Elektrikal', level: 'Ahli Madya', subklasifikasi: 'E', bidang: 'Sipil', relatedCategories: ['Elektrikal', 'K3', 'Safety'] },
  { id: 'E002', name: 'Ahli Teknik Elektrikal', level: 'Ahli', subklasifikasi: 'E', bidang: 'Sipil', relatedCategories: ['Elektrikal', 'K3'] },
  { id: 'E003', name: 'Teknisi Teknik Elektrikal', level: 'Teknisi', subklasifikasi: 'E', bidang: 'Sipil', relatedCategories: ['Elektrikal'] },
  { id: 'E004', name: 'Ahli Instalasi Listrik', level: 'Ahli', subklasifikasi: 'E', bidang: 'Sipil', relatedCategories: ['Elektrikal'] },
  { id: 'E005', name: 'Ahli Sistem Pendingin', level: 'Ahli', subklasifikasi: 'E', bidang: 'Sipil', relatedCategories: ['Elektrikal', 'Mekanikal'] },
  // ── Jalan (F) ────────────────────────────────────────────────────────────
  { id: 'F001', name: 'Ahli Madya Teknik Jalan', level: 'Ahli Madya', subklasifikasi: 'F', bidang: 'Sipil', relatedCategories: ['Jalan', 'Quality', 'Manajemen'] },
  { id: 'F002', name: 'Ahli Teknik Jalan', level: 'Ahli', subklasifikasi: 'F', bidang: 'Sipil', relatedCategories: ['Jalan', 'Quality'] },
  { id: 'F003', name: 'Teknisi Teknik Jalan', level: 'Teknisi', subklasifikasi: 'F', bidang: 'Sipil', relatedCategories: ['Jalan', 'K3'] },
  { id: 'F004', name: 'Ahli Perkerasan Jalan', level: 'Ahli', subklasifikasi: 'F', bidang: 'Sipil', relatedCategories: ['Jalan'] },
  { id: 'F005', name: 'Ahli Drainase Jalan', level: 'Ahli', subklasifikasi: 'F', bidang: 'Sipil', relatedCategories: ['Jalan', 'Lingkungan'] },
  // ── Jembatan (G) ─────────────────────────────────────────────────────────
  { id: 'G001', name: 'Ahli Madya Teknik Jembatan', level: 'Ahli Madya', subklasifikasi: 'G', bidang: 'Sipil', relatedCategories: ['Jalan', 'Sipil Gedung', 'Quality'] },
  { id: 'G002', name: 'Ahli Teknik Jembatan', level: 'Ahli', subklasifikasi: 'G', bidang: 'Sipil', relatedCategories: ['Jalan', 'Sipil Gedung'] },
  { id: 'G003', name: 'Teknisi Teknik Jembatan', level: 'Teknisi', subklasifikasi: 'G', bidang: 'Sipil', relatedCategories: ['Jalan', 'K3'] },
  { id: 'G004', name: 'Ahli Struktur Jembatan', level: 'Ahli', subklasifikasi: 'G', bidang: 'Sipil', relatedCategories: ['Jalan', 'Sipil Gedung', 'Digital'] },
  // ── Manajemen Pelaksanaan (MP) ────────────────────────────────────────────
  { id: 'MP001', name: 'Pelaksana Lapangan Pekerjaan Gedung', level: 'Pelaksana', subklasifikasi: 'MP', bidang: 'Manajemen Pelaksanaan', relatedCategories: ['Sipil Gedung', 'K3', 'Safety'] },
  { id: 'MP002', name: 'Pelaksana Lapangan Pekerjaan Jalan', level: 'Pelaksana', subklasifikasi: 'MP', bidang: 'Manajemen Pelaksanaan', relatedCategories: ['Jalan', 'K3'] },
  { id: 'MP003', name: 'Site Engineer / Ahli Teknik Pelaksana', level: 'Ahli', subklasifikasi: 'MP', bidang: 'Manajemen Pelaksanaan', relatedCategories: ['Sipil Gedung', 'Manajemen', 'Quality', 'Digital'] },
  { id: 'MP004', name: 'Site Manager Pekerjaan Gedung', level: 'Manager', subklasifikasi: 'MP', bidang: 'Manajemen Pelaksanaan', relatedCategories: ['Manajemen', 'RAB', 'Quality', 'Sipil Gedung'] },
  { id: 'MP005', name: 'Project Manager Konstruksi', level: 'Ahli Madya', subklasifikasi: 'MP', bidang: 'Manajemen Pelaksanaan', relatedCategories: ['Manajemen', 'RAB', 'Quality', 'Digital'] },
  { id: 'MP006', name: 'Quality Control Engineer', level: 'Teknisi', subklasifikasi: 'MP', bidang: 'Manajemen Pelaksanaan', relatedCategories: ['Quality', 'Sipil Gedung', 'Safety'] },
  { id: 'MP007', name: 'Quantity Surveyor / Cost Estimator', level: 'Ahli', subklasifikasi: 'MP', bidang: 'Manajemen Pelaksanaan', relatedCategories: ['RAB', 'Manajemen'] },
  { id: 'MP008', name: 'Scheduling Engineer (Perencana Jadwal)', level: 'Ahli', subklasifikasi: 'MP', bidang: 'Manajemen Pelaksanaan', relatedCategories: ['Manajemen', 'Digital', 'RAB'] },
  { id: 'MP009', name: 'Inspector Pekerjaan Sipil', level: 'Teknisi', subklasifikasi: 'MP', bidang: 'Manajemen Pelaksanaan', relatedCategories: ['Quality', 'Sipil Gedung'] },
  { id: 'MP010', name: 'Kepala Tukang Batu / Beton', level: 'Pelaksana', subklasifikasi: 'MP', bidang: 'Manajemen Pelaksanaan', relatedCategories: ['Sipil Gedung', 'K3'] },
];

export const SUBKLASIFIKASI_LABELS: Record<string, string> = {
  B: 'Bangunan Gedung',
  C: 'Teknik Sipil',
  D: 'Mekanikal',
  E: 'Elektrikal',
  F: 'Jalan',
  G: 'Jembatan',
  H: 'Benda Cagar Budaya',
  MP: 'Manajemen Pelaksanaan',
  MG: 'Personil Managerial',
  PN: 'Pengadaan',
  LK: 'LKUT',
};

export function getJabatanById(id: string): SkkJabatan | undefined {
  return SKK_JABATAN.find(j => j.id === id);
}

/** Filter jabatan by bidang */
export function getJabatanByBidang(bidang: Bidang): SkkJabatan[] {
  return SKK_JABATAN.filter(j => j.bidang === bidang);
}

/** Given a jabatan id, return its related BIMTEK categories */
export function getRelatedCategories(jabatanId: string): string[] {
  const jabatan = getJabatanById(jabatanId);
  if (!jabatan) return [];
  return jabatan.relatedCategories;
}
