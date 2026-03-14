export interface KnowledgeDocument {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  content: string;
  keywords: string[];
  tags: string[];
  source: string;
  lastUpdated: string;
  relevance: number;
}

export interface KnowledgeChunk {
  id: string;
  documentId: string;
  content: string;
  embedding?: number[];
  metadata: {
    category: string;
    subcategory: string;
    keywords: string[];
    importance: number;
  };
}

export interface KnowledgeBaseConfig {
  documents: KnowledgeDocument[];
  chunks: KnowledgeChunk[];
  categories: string[];
  indexingEnabled: boolean;
}

// ============================================
// KNOWLEDGE BASE DOCUMENTS
// ============================================

export const knowledgeDocuments: KnowledgeDocument[] = [
  // ============================================
  // STRUKTUR
  // ============================================
  {
    id: 'doc-001',
    title: 'Desain Beton Bertulang - SNI 2847:2019',
    category: 'Struktur',
    subcategory: 'Beton',
    content: `SNI 2847:2019 Persyaratan Beton Struktural untuk Bangunan Gedung

1. MUTU BETON
- fc' minimum: 17 MPa (K-200) untuk struktur bukan exposed
- fc' minimum: 21 MPa (K-250) untuk struktur exposed
- fc' maksimum: 35 MPa tanpa persetujuan khusus

2. TULANGAN
- Fy default: 240 MPa (BJTP) untuk tulangan polos
- Fy default: 400 MPa (BJTD) untuk tulangan ulir
- Modulus elastisitas: Es = 200 GPa

3. LENTUR
- As min = (√fc' / 4fy) x bw x d tapi tidak kurang dari 1.4bw/fy
- As max = 0.025 x bw x d

4. GESER
- Vc = (√fc'/6) x bw x d (tanpa tulangan geser)
- Vs max = (2√fc') x bw x d / 3

5. DEFLEKSI
- Lantai: L/240
- Atap: L/180`,
    keywords: ['beton', 'sni 2847', 'tulangan', 'lentur', 'geser', 'desain'],
    tags: ['struktur', 'beton', 'sni', 'desain'],
    source: 'SNI 2847:2019',
    lastUpdated: '2024-01-01',
    relevance: 10,
  },
  {
    id: 'doc-002',
    title: 'Desain Baja - SNI 1729:2020',
    category: 'Struktur',
    subcategory: 'Baja',
    content: `SNI 1729:2020 Spesifikasi untuk Bangunan Baja Struktural

1. TEGANGAN IJIN
- Fy = 250 MPa (BJ 37)
- Fu = 370 MPa (BJ 37)
- Tegangan izin = Fy / Ω (Ω = 1.5)

2. KOLOM
- Profil: WF, H, Box
- Slenderness ratio: KL/r ≤ 200
- Compression: Pn = Ag x Fcr

3. BALOK
- Lateral bracing: Lb < Lr
- Penyaluran momen
- Web buckling & yielding

4. SAMBUNGAN
- Las: E70XX
- Baut: A325, A490
- Shear rupture: Ubs x Fu x Anb`,
    keywords: ['baja', 'sni 1729', 'wf', 'kolom', 'balok', 'sambungan'],
    tags: ['struktur', 'baja', 'sni', 'desain'],
    source: 'SNI 1729:2020',
    lastUpdated: '2024-01-01',
    relevance: 10,
  },
  {
    id: 'doc-003',
    title: 'Desain Gempa - SNI 1726:2019',
    category: 'Struktur',
    subcategory: 'Gempa',
    content: `SNI 1726:2019 Tata Cara Perencanaan Ketahanan Gempa

1. PARAMETER GEMPA
- SDS = 0.5 x SS x Fa
- SD1 = 0.5 x S1 x Fv
- Kategori risiko: I, II, III, IV

2. SPEKTRUM RESPONS
- Periode pendekatan: Ta = Ct x hn^x
- Cs = SDS / (R/Ie)

3. ANALISIS
- Equivalent static lateral force
- Response spectrum analysis
- Time history analysis

4. STORY DRIFT
- Δa ≤ 0.025 x tinggi lantai
- P-Δ effects`,
    keywords: ['gempa', 'sni 1726', 'spektrum', 'respons', 'story drift'],
    tags: ['struktur', 'gempa', 'sni', 'desain'],
    source: 'SNI 1726:2019',
    lastUpdated: '2024-01-01',
    relevance: 10,
  },
  {
    id: 'doc-004',
    title: 'Beban Struktur - SNI 1727:2020',
    category: 'Struktur',
    subcategory: 'Beban',
    content: `SNI 1727:2020 Beban Minimum untuk Perencanaan Bangunan Gedung

1. BEBAN MATI (DL)
- Beton bertulang: 24 kN/m³
- Baja: 78.5 kN/m³
- Pasangan bata: 21 kN/m³
- Plafond + rangka: 0.2 kN/m²

2. BEBAN HIDUP (LL)
- Lantai gedung: 2.5 kN/m²
- Balkon: 3.0 kN/m²
- Atap datar: 1.0 kN/m²
- Tangga: 3.0 kN/m²

3. BEBAN GEMPA (E)
- Wt = DL + 0.25 x LL (untuk all use)
- Wt = DL + 0.5 x LL (untuk storage)

4. KOMBINASI BEBAN
- 1.4 DL
- 1.2 DL + 1.6 LL
- 1.2 DL + 1.0 E + LL`,
    keywords: ['beban', 'sni 1727', 'mati', 'hidup', 'gempa', 'kombinasi'],
    tags: ['struktur', 'beban', 'sni', 'desain'],
    source: 'SNI 1727:2020',
    lastUpdated: '2024-01-01',
    relevance: 10,
  },

  // ============================================
  // FONDASI
  // ============================================
  {
    id: 'doc-005',
    title: 'Desain Fondasi - SNI 8460:2017',
    category: 'Fondasi',
    subcategory: 'Desain',
    content: `SNI 8460:2017 Persyaratan Perencanaan Geoteknik

1. KAPASITAS DUKUNG
- Ultimate: qu = cNq + 0.5γBNγ + cNc
- Allowable: qall = qu / SF (SF = 3)
- Perhitungan menggunakan data SPT

2. JENIS FONDASI
- Fondasi dangkal: Df/B ≤ 1-2
- Fondasi dalam: Df/B > 4

3. PONDASI BOR (Bore Pile)
- Diameter: 300-1500 mm
- Kedalaman: sesuai lapisan tanah
- Kapasitas: Qallow = Ws + Qskin + Qtip

4. SETTLEMENT
- Immediate settlement: Si = qB(1-μ²)/E
- Total: Sc < 25-50 mm (bangunan umum)`,
    keywords: ['fondasi', 'sni 8460', 'kapasitas dukung', 'bore pile', 'settlement'],
    tags: ['fondasi', 'geoteknik', 'sni', 'desain'],
    source: 'SNI 8460:2017',
    lastUpdated: '2024-01-01',
    relevance: 10,
  },
  {
    id: 'doc-006',
    title: 'Soil Mechanics Dasar',
    category: 'Fondasi',
    subcategory: 'Mekanika Tanah',
    content: `Mekanika Tanah untuk Perencanaan Fondasi

1. SIFAT INDEKS
- Berat jenis: Gs = 2.65-2.80
- Batas cair: LL (%)
- Batas plastis: PL (%)
- PI = LL - PL

2. KLASIFIKASi TANAH
- USCS: GW, GP, GM, GC, SW, SP, SM, SC, ML, CL, OL, MH, CH, OL
- AASHTO: A-1 sampai A-8

3. KEKUATAN GESER
- Kohesi: c (kPa)
- Sudut gesek dalam: φ (°)
- Direct shear, Triaxial

4. KONSOLIDASI
- Cc (Compression Index)
- Cs (Swelling Index)
- mv (Coefficient of Volume Compressibility)`,
    keywords: ['tanah', 'mekanika', 'spa', 'klasifikasi', 'konsolidasi'],
    tags: ['fondasi', 'geoteknik', 'tanah'],
    source: 'Mekanika Tanah Dasar',
    lastUpdated: '2024-01-01',
    relevance: 8,
  },

  // ============================================
  // K3
  // ============================================
  {
    id: 'doc-007',
    title: 'K3 Konstruksi - Permenaker 9/2016',
    category: 'K3',
    subcategory: 'Regulasi',
    content: `Permenaker No. 9 Tahun 2016 tentang K3 Konstruksi

1. KEWAJIBAN PKP
- Menyusun K3
- Menunjuk P2K3
- Menyediakan APD
- Melakukan training

2. IDENTIFIKASI BAHAYA
- Pekerjaan высот
- Pekerjaan Listrik
- Pekerjaan Excavasi
- Pekerjaan Beratan
- Pekerjaan api Terbuka

3. AP ALAT PELINDUNG DIRI
- Helm safety
- Sepatu safety
- Sarung tangan
- Kacamata
- Harness (ketinggian)
- Masker

4. DOKUMEN K3
- Rencana K3
- JSA (Job Safety Analysis)
- Ijin Kerja
- Laporan Incident`,
    keywords: ['k3', 'permenaker', 'apd', 'p2k3', 'konstruksi', 'keselamatan'],
    tags: ['k3', 'regulasi', 'keselamatan'],
    source: 'Permenaker 9/2016',
    lastUpdated: '2024-01-01',
    relevance: 10,
  },
  {
    id: 'doc-008',
    title: 'Safety Induction Konstruksi',
    category: 'K3',
    subcategory: 'Training',
    content: `Safety Induction untuk Pekerja Konstruksi

1. TUJUAN
- Mencegah kecelakaan
- Menambah awareness
- Memenuhi regulasi

2. MATERI DASAR
- Kebijakan K3 perusahaan
- Identifikasi bahaya lokasi
- Prosedur darurat
- Penggunaan APD
- Pelaporan insiden

3. PROSEDUR DARURAT
- Kebakaran: Evakuasi, Assembly Point
- Cedera: P3K, Contact RS
- Gempa: Drop, Cover, Hold

4. SIMBOL KESELAMATAN
- Warning (kuning)
- Prohibition (merah)
- Mandatory (biru)
- Safety sign (hijau)`,
    keywords: ['safety', 'induction', 'apd', 'darurat', 'keselamatan'],
    tags: ['k3', 'training', 'safety'],
    source: 'Safety Training Module',
    lastUpdated: '2024-01-01',
    relevance: 9,
  },

  // ============================================
  // MANAJEMEN PROYEK
  // ============================================
  {
    id: 'doc-009',
    title: 'Manajemen Proyek - PMBOK Guide',
    category: 'Manajemen',
    subcategory: 'Framework',
    content: `Project Management Body of Knowledge (PMBOK 7th)

1. PROJECT PRINCIPLES
- Be a diligent, respectful, and caring steward
- Create a collaborative project team environment
- Effectively engage with stakeholders
- Recognize that everything is a system
- Tailor the approach
- Build quality into processes and products
- Navigate complexity
- Optimize risk responses
- Embrace adaptability and resiliency
- Enable change to achieve the targeted outcome

2. PERFORMANCE DOMAINS
- Stakeholder
- Team
- Approach
- Life Cycle
- Planning
- Project Work
- Delivery
- Measurement
- Uncertainty

3. AGILE & HYBRID
- Iterative development
- Incremental delivery
- Sprint/Iteration`,
    keywords: ['manajemen proyek', 'pmbok', 'stakeholder', 'planning', 'delivery'],
    tags: ['manajemen', 'proyek', 'pmbok'],
    source: 'PMBOK 7th Edition',
    lastUpdated: '2024-01-01',
    relevance: 9,
  },
  {
    id: 'doc-010',
    title: 'Critical Path Method (CPM)',
    category: 'Manajemen',
    subcategory: 'Scheduling',
    content: `Critical Path Method untuk Scheduling

1. KONSEP DASAR
- Activity on Node (AON)
- Earliest Start (ES), Earliest Finish (EF)
- Latest Start (LS), Latest Finish (LF)
- Float = LS - ES = LF - EF

2. CRITICAL PATH
- Path dengan total float = 0
- Activities di critical path: critical activities
- Garis merah di Gantt chart

3. CRASHING
- Menambah resource untuk mempercepat
- Cost slope = (Crashed cost - Normal cost) / (Normal time - Crashed time)
- Minimum cost schedule

4. SOFTWARE
- MS Project
- Primavera P6
- Navisworks`,
    keywords: ['cpm', 'critical path', 'scheduling', 'gantt', 'float'],
    tags: ['manajemen', 'scheduling', 'cpm'],
    source: 'Project Scheduling Basics',
    lastUpdated: '2024-01-01',
    relevance: 8,
  },
  {
    id: 'doc-011',
    title: 'Earned Value Management (EVM)',
    category: 'Manajemen',
    subcategory: 'Cost Control',
    content: `Earned Value Management System

1. PARAMETER DASAR
- Planned Value (PV/Budgeted) = Planned % x BAC
- Earned Value (EV/BCWP) = Actual % x BAC
- Actual Cost (AC/ACWP) = Biaya aktual

2. VARIANCE
- Schedule Variance: SV = EV - PV
- Cost Variance: CV = EV - AC

3. INDEX
- Schedule Performance Index: SPI = EV/PV
- Cost Performance Index: CPI = EV/AC
- SPI > 1: ahead of schedule
- CPI > 1: under budget

4. ESTIMASI
- EAC = BAC / CPI (at current rate)
- ETC = EAC - AC
- VAC = BAC - EAC`,
    keywords: ['evm', 'earned value', 'cpi', 'spi', 'budget', 'cost control'],
    tags: ['manajemen', 'cost control', 'evm'],
    source: 'EVM Fundamentals',
    lastUpdated: '2024-01-01',
    relevance: 9,
  },

  // ============================================
  // ELEKTRIKAL
  // ============================================
  {
    id: 'doc-012',
    title: 'Instalasi Listrik - PUIL',
    category: 'Elektrikal',
    subcategory: 'Desain',
    content: `Persyaratan Umum Instalasi Listrik (PUIL) 2020

1. TEGANGAN
- Tegangan rendah: ≤ 1000V AC
- Tegangan ekstra rendah: ≤ 50V AC

2. PENGHANTAR
- NYA: single core
- NYM: multi core
- NYY: underground
- NYFGbY: flexible

3. PROTEKSI
- MCB: Overcurrent protection
- RCCB/ELCB: Ground fault protection
- SPD: Surge protection

4. UKURAN KABEL
- Berdasarkan arus dan panjang jarak
- Voltage drop ≤ 5%
- Tabel PUIL untuk referens`,
    keywords: ['listrik', 'puil', 'kabel', 'mcb', 'proteksi'],
    tags: ['elektrikal', 'listrik', 'desain'],
    source: 'PUIL 2020',
    lastUpdated: '2024-01-01',
    relevance: 9,
  },
  {
    id: 'doc-013',
    title: 'Desain Sistem Pendingin (HVAC)',
    category: 'Elektrikal',
    subcategory: 'HVAC',
    content: `Sistem HVAC untuk Bangunan Gedung

1. JENIS SISTEM
- Split AC
- VRV/VRF
- Central AHU
- Chiller system

2. BEBAN PENDINGIN
- Q = U x A x ΔT + Latent heat
- Sensible heat ratio
- Block load calculation

3. EQUIPMENT
- Compressor
- Condenser
- Evaporator
- Refrigerant
- Ductwork

4. STANDAR
- ASHRAE 62.1: Ventilation
- ASHRAE 90.1: Energy efficiency`,
    keywords: ['hvac', 'pendingin', 'ac', 'duct', 'refrigerant'],
    tags: ['elektrikal', 'hvac', 'mekanikal'],
    source: 'HVAC Design Guide',
    lastUpdated: '2024-01-01',
    relevance: 8,
  },

  // ============================================
  // RAB & ESTIMASI
  // ============================================
  {
    id: 'doc-014',
    title: 'Analisis Harga Satuan',
    category: 'RAB',
    subcategory: 'Metode',
    content: `Analisis Harga Satuan Pekerjaan (HSP)

1. KOMPONEN HSP
- Material (Bahan)
- Upah (Tenaga Kerja)
- Alat (Equipment)

2. FORMAT ANALISA
- Koefisien x Harga Satuan
- HSP = Σ(Ki x HSi)

3. REFERENSI
- Analisa SNI
- HSPK daerah
- Vendor/supplier

4. MARKUP
- Overhead: 10-15%
- Profit: 5-10%
- PPN: 11%
- Risiko: 3-5%`,
    keywords: ['rab', 'hsp', 'analisa', 'satuan', 'harga', 'upah'],
    tags: ['rab', 'estimasi', 'cost'],
    source: 'HSP Manual',
    lastUpdated: '2024-01-01',
    relevance: 10,
  },
  {
    id: 'doc-015',
    title: 'Bill of Quantity (BOQ)',
    category: 'RAB',
    subcategory: 'Dokumen',
    content: `Bill of Quantity (BOQ) Construction

1. STRUKTUR BOQ
- Item number
- Description
- Unit
- Quantity
- Rate
- Amount

2. TIPE KONTRAK
- Lump sum
- Unit price
- Cost plus

3. KATEGORI PEKERJAAN
- Pekerjaan persiapan
- Pekerjaan tanah
- Pekerjaan struktur
- Pekerjaan arsitektur
- Pekerjaan elektrikal
- Pekerjaan mekanikal

4. QUANTITY TAKE-OFF
- Panjang x Lebar x Tinggi
- Berat besi
- Volume beton
- Luasan plesteran`,
    keywords: ['boq', 'quantity', 'bill', 'take off', 'rab'],
    tags: ['rab', 'estimasi', 'kontrak'],
    source: 'Quantity Surveying',
    lastUpdated: '2024-01-01',
    relevance: 9,
  },

  // ============================================
  // QUALITY CONTROL
  // ============================================
  {
    id: 'doc-016',
    title: 'Quality Control Plan',
    category: 'QC',
    subcategory: 'Dokumen',
    content: `Rencana Quality Control (QC)

1. DOKUMEN QC
- Quality Manual
- QC Plan
- Work Procedure
- Inspection & Test Plan (ITP)

2. INSPECTION LEVEL
- Pre-inspection
- During inspection
- Post-inspection

3. QC CHECKLIST
- Material verification
- Workmanship check
- Dimensional check
- Documentation

4. NON-CONFORMANCE
- NCR (Non-Conformance Report)
- CAR (Corrective Action Request)
- CAPA (Corrective & Preventive Action)`,
    keywords: ['qc', 'quality', 'inspection', 'ncr', 'checklist'],
    tags: ['qc', 'quality', 'inspection'],
    source: 'QC Manual',
    lastUpdated: '2024-01-01',
    relevance: 9,
  },
  {
    id: 'doc-017',
    title: 'Test Beton',
    category: 'QC',
    subcategory: 'Pengujian',
    content: `Pengujian Beton untuk Quality Control

1. SLUMP TEST
- SNI 1972:2008
- Slump: 25-150 mm
- Penurunan vertikal

2. COMPRESSION TEST
- SNI 1974:2011
- Benda uji: silinder 150x300mm
- Kuat tekan: fc' = P/A

3. CORE DRILLING
- SNI 2494:2011
- ASTM C42
- Pengujian aktual di struktur

4. SCHMIDT HAMMER
- Korelasi kekerasan permukaan
- N-value ke fc'`,
    keywords: ['beton', 'test', 'slump', 'kuat tekan', 'qc', 'pengujian'],
    tags: ['qc', 'beton', 'pengujian'],
    source: 'Concrete Testing Manual',
    lastUpdated: '2024-01-01',
    relevance: 9,
  },

  // ============================================
  // SERTIFIKASI
  // ============================================
  {
    id: 'doc-018',
    title: 'Sertifikasi SKK (SNI)',
    category: 'Sertifikasi',
    subcategory: 'SKK',
    content: `Sertifikasi Kompetensi Kerja (SKK) Konstruksi

1. JENIS SERTIFIKASI
- SKK (SNI) - BNP
- BNSP - Sertifikasi Nasional
- LSP - Lembaga Sertifikasi Profesi

2. JENJANG KUALIFIKASI
- Jenjang 1: Terlatih
- Jenjang 2: Mahir
- Jenjang 3: Ahli
- Jenjang 4: Ahli Utama

3. PERSYARATAN
- Pendidikan minimal
- Pengalaman kerja
- Training yang required

4. MASA BERLAKU
- 5 tahun
- Dapat diperpanjang dengan UPC`,
    keywords: ['sertifikasi', 'skk', 'bnsp', 'lsp', 'kompetensi'],
    tags: ['sertifikasi', 'karir', 'skk'],
    source: 'BNSP Guide',
    lastUpdated: '2024-01-01',
    relevance: 10,
  },

  // ============================================
  // PLUMBING
  // ============================================
  {
    id: 'doc-019',
    title: 'Sistem Plumbing',
    category: 'Plumbing',
    subcategory: 'Desain',
    content: `Sistem Plumbing Bangunan Gedung

1. SISTEM AIR BERSIH
- Downfeed system
- Rooftop tank
- Ground tank + pompa
- Pressure tank

2. SISTEM AIR KOTOR
- Sanitary waste
- Ventilation
- Storm water

3. PERALATAN
- Pompa: Centrifugal, Submersible
- Water heater
- Filter
- Softener

4. STANDAR
- SNI 8153:2015
- PUIL 2020
- Local code`,
    keywords: ['plumbing', 'air', 'pompa', 'saniter', 'drainase'],
    tags: ['plumbing', 'mekanikal', 'desain'],
    source: 'Plumbing Design Guide',
    lastUpdated: '2024-01-01',
    relevance: 8,
  },
];

// ============================================
// KNOWLEDGE CHUNKS (For RAG)
// ============================================

export function generateChunks(documents: KnowledgeDocument[]): KnowledgeChunk[] {
  const chunks: KnowledgeChunk[] = [];
  
  documents.forEach(doc => {
    const sections = doc.content.split('\n\n');
    sections.forEach((section, idx) => {
      if (section.trim().length > 50) {
        chunks.push({
          id: `${doc.id}-chunk-${idx}`,
          documentId: doc.id,
          content: section.trim(),
          metadata: {
            category: doc.category,
            subcategory: doc.subcategory,
            keywords: doc.keywords,
            importance: doc.relevance,
          },
        });
      }
    });
  });
  
  return chunks;
}

export const knowledgeChunks = generateChunks(knowledgeDocuments);

// ============================================
// KNOWLEDGE CATEGORIES
// ============================================

export const knowledgeCategories = [
  { id: 'struktur', name: 'Struktur', icon: '🏛️', count: 4 },
  { id: 'fondasi', name: 'Fondasi', icon: '🗻', count: 2 },
  { id: 'k3', name: 'K3 Konstruksi', icon: '🦺', count: 2 },
  { id: 'manajemen', name: 'Manajemen Proyek', icon: '📊', count: 3 },
  { id: 'elektrikal', name: 'Elektrikal', icon: '⚡', count: 2 },
  { id: 'rab', name: 'RAB & Estimasi', icon: '💰', count: 2 },
  { id: 'qc', name: 'Quality Control', icon: '✅', count: 2 },
  { id: 'sertifikasi', name: 'Sertifikasi', icon: '📜', count: 1 },
  { id: 'plumbing', name: 'Plumbing', icon: '🔧', count: 1 },
];

// ============================================
// KNOWLEDGE BASE API
// ============================================

export function searchKnowledge(query: string, topK: number = 5): { document: KnowledgeDocument; chunks: string[] }[] {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/);
  
  const scoredDocs = knowledgeDocuments.map(doc => {
    let score = 0;
    
    // Title match
    queryWords.forEach(word => {
      if (doc.title.toLowerCase().includes(word)) score += 10;
    });
    
    // Keywords match
    doc.keywords.forEach(kw => {
      if (queryLower.includes(kw.toLowerCase())) score += 5;
    });
    
    // Tags match
    doc.tags.forEach(tag => {
      if (queryLower.includes(tag)) score += 3;
    });
    
    // Content match
    if (doc.content.toLowerCase().includes(queryLower)) score += 2;
    
    return { doc, score: score + doc.relevance };
  });
  
  const sorted = scoredDocs.filter(s => s.score > 0).sort((a, b) => b.score - a.score);
  
  return sorted.slice(0, topK).map(s => ({
    document: s.doc,
    chunks: knowledgeChunks
      .filter(c => c.documentId === s.doc.id)
      .slice(0, 3)
      .map(c => c.content),
  }));
}

export function getKnowledgeByCategory(category: string): KnowledgeDocument[] {
  return knowledgeDocuments.filter(doc => 
    doc.category.toLowerCase().includes(category.toLowerCase()) ||
    doc.tags.includes(category.toLowerCase())
  );
}

export function getKnowledgeSummary(): { category: string; count: number; documents: string[] }[] {
  const categoryMap = new Map<string, { count: number; documents: string[] }>();
  
  knowledgeDocuments.forEach(doc => {
    if (!categoryMap.has(doc.category)) {
      categoryMap.set(doc.category, { count: 0, documents: [] });
    }
    const cat = categoryMap.get(doc.category)!;
    cat.count++;
    cat.documents.push(doc.title);
  });
  
  return Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    ...data,
  }));
}
