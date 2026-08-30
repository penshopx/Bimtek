import { bimtekModules, type BimtekModule } from '@/lib/bimtekCatalog';
import { QUIZ_CATEGORY_MAP } from '@/lib/skkData';
import type { UnitKompetensi } from '@/data/skkni-unit-kompetensi';

const JABATAN_BIMTEK_CATEGORIES: Record<string, string[]> = {
  'SKK-001': ['Jalan', 'K3', 'Safety', 'Quality'],
  'SKK-002': ['Jalan', 'Sipil Gedung', 'K3', 'Quality'],
  'SKK-003': ['Sipil Gedung', 'K3', 'Safety', 'Quality'],
  'SKK-004': ['Jalan', 'K3', 'Quality', 'Digital'],
  'SKK-005': ['Jalan', 'Sipil Gedung', 'K3', 'Quality', 'Digital'],
  'SKK-006': ['Sipil Gedung', 'K3', 'Quality', 'Digital'],
  'SKK-007': ['Manajemen', 'RAB', 'Quality', 'K3', 'Digital', 'Pengadaan & Tender'],
  'SKK-008': ['Manajemen', 'RAB', 'Quality', 'K3', 'Digital', 'Pengadaan & Tender'],
  'SKK-009': ['K3', 'Safety', 'Regulasi', 'ISO Management', 'Lingkungan'],
  'SKK-010': ['Jalan', 'Quality', 'K3', 'Manajemen'],
  'SKK-011': ['RAB', 'Manajemen', 'Pengadaan & Tender', 'Digital'],
  'SKK-012': ['RAB', 'Manajemen', 'Pengadaan & Tender', 'Digital'],
};

interface RecommendationRule {
  keywords: string[];
  bimtekCategories: string[];
  quizCategories: string[];
}

const RECOMMENDATION_RULES: RecommendationRule[] = [
  {
    keywords: ['k3', 'keselamatan', 'bahaya', 'kecelakaan', 'lingkungan kerja'],
    bimtekCategories: ['K3', 'Safety', 'ISO Management'],
    quizCategories: ['K3', 'Regulasi'],
  },
  {
    keywords: ['jalan', 'perkerasan', 'aspal', 'drainase', 'subgrade', 'agregat'],
    bimtekCategories: ['Jalan', 'Quality'],
    quizCategories: ['Jalan', 'Material', 'Pengujian'],
  },
  {
    keywords: ['jembatan', 'substruktur', 'superstruktur'],
    bimtekCategories: ['Jalan', 'Sipil Gedung', 'Quality'],
    quizCategories: ['Jalan', 'Struktur', 'Material'],
  },
  {
    keywords: ['gedung', 'pondasi', 'beton', 'baja', 'struktur', 'dinding', 'lantai', 'atap', 'kusen'],
    bimtekCategories: ['Sipil Gedung', 'Quality'],
    quizCategories: ['Sipil', 'Struktur', 'Material'],
  },
  {
    keywords: ['mutu', 'quality', 'inspeksi', 'pengujian', 'kelaikan'],
    bimtekCategories: ['Quality', 'ISO Management'],
    quizCategories: ['Pengujian', 'Standar', 'Material'],
  },
  {
    keywords: ['biaya', 'rab', 'harga', 'volume', 'quantity', 'penawaran', 'final account'],
    bimtekCategories: ['RAB', 'Manajemen', 'Pengadaan & Tender'],
    quizCategories: ['Manajemen', 'Kontrak', 'Perencanaan'],
  },
  {
    keywords: ['kontrak', 'klaim', 'pengadaan', 'tender', 'subkontraktor', 'rantai pasok'],
    bimtekCategories: ['Pengadaan & Tender', 'Manajemen', 'RAB'],
    quizCategories: ['Kontrak', 'Pengadaan', 'Manajemen'],
  },
  {
    keywords: ['waktu', 'jadwal', 'kemajuan', 'kinerja', 'laporan'],
    bimtekCategories: ['Manajemen', 'Digital'],
    quizCategories: ['Manajemen', 'Perencanaan'],
  },
  {
    keywords: ['risiko', 'ruang lingkup', 'pemangku kepentingan', 'komunikasi', 'koordinasi'],
    bimtekCategories: ['Manajemen'],
    quizCategories: ['Manajemen', 'Perencanaan'],
  },
  {
    keywords: ['gambar', 'desain', 'survei', 'investigasi', 'rekayasa'],
    bimtekCategories: ['Digital', 'Sipil Gedung', 'Jalan'],
    quizCategories: ['Perencanaan', 'Metode', 'Sipil'],
  },
  {
    keywords: ['lingkungan', 'limbah', 'emisi'],
    bimtekCategories: ['Lingkungan', 'ISO Management'],
    quizCategories: ['Lingkungan', 'Regulasi'],
  },
  {
    keywords: ['listrik', 'elektrikal'],
    bimtekCategories: ['Elektrikal'],
    quizCategories: ['Elektrikal'],
  },
  {
    keywords: ['mekanikal', 'plumbing', 'pipa', 'hvac'],
    bimtekCategories: ['Mekanikal'],
    quizCategories: ['Mekanikal', 'Hydraulic', 'Alat'],
  },
];

const STOP_WORDS = new Set([
  'dan',
  'di',
  'ke',
  'dari',
  'untuk',
  'yang',
  'pada',
  'melakukan',
  'menerapkan',
  'melaksanakan',
  'membuat',
  'menyusun',
  'mengelola',
  'pekerjaan',
  'proyek',
  'konstruksi',
]);

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

function titleTokens(title: string): string[] {
  return normalize(title)
    .split(' ')
    .filter((token) => token.length > 3 && !STOP_WORDS.has(token));
}

function fallbackQuizCategories(bimtekCategories: string[]): string[] {
  return unique(
    bimtekCategories.flatMap((category) => QUIZ_CATEGORY_MAP[category] ?? []),
  );
}

export interface UnitLearningRecommendation {
  modules: BimtekModule[];
  quizCategories: string[];
}

export function getUnitLearningRecommendation(
  jabatanId: string,
  unit: UnitKompetensi,
): UnitLearningRecommendation {
  const normalizedTitle = normalize(unit.judul);
  const jabatanCategories = JABATAN_BIMTEK_CATEGORIES[jabatanId] ?? [];
  const matchingRules = RECOMMENDATION_RULES.filter((rule) =>
    rule.keywords.some((keyword) => normalizedTitle.includes(normalize(keyword))),
  );

  const matchedBimtekCategories = unique(
    matchingRules.flatMap((rule) => rule.bimtekCategories),
  );
  const candidateCategories = unique([
    ...matchedBimtekCategories.filter((category) => jabatanCategories.includes(category)),
    ...jabatanCategories,
    ...matchedBimtekCategories,
  ]);
  const tokens = titleTokens(unit.judul);

  const modules = bimtekModules
    .filter((module) => candidateCategories.includes(module.category))
    .map((module) => {
      const normalizedModuleTitle = normalize(module.title);
      const tokenScore = tokens.filter((token) => normalizedModuleTitle.includes(token)).length * 4;
      const matchedCategoryScore = matchedBimtekCategories.includes(module.category) ? 3 : 0;
      const jabatanCategoryScore = jabatanCategories.includes(module.category) ? 1 : 0;
      return {
        module,
        score: tokenScore + matchedCategoryScore + jabatanCategoryScore,
      };
    })
    .sort((a, b) => b.score - a.score || a.module.title.localeCompare(b.module.title, 'id'))
    .slice(0, 3)
    .map(({ module }) => module);

  const matchedQuizCategories = unique(
    matchingRules.flatMap((rule) => rule.quizCategories),
  );

  return {
    modules,
    quizCategories: matchedQuizCategories.length > 0
      ? matchedQuizCategories
      : fallbackQuizCategories(jabatanCategories).slice(0, 3),
  };
}