import { getPersona, personas } from './personas';

export interface AgentTool {
  id: string;
  name: string;
  description: string;
  type: 'calculation' | 'navigation' | 'search' | 'analysis' | 'generation' | 'reference';
  parameters?: Record<string, string>;
  execute: (params: Record<string, any>) => Promise<any>;
}

export interface ExpertAgent {
  id: string;
  name: string;
  title: string;
  description: string;
  avatar: string;
  color: string;
  expertise: string[];
  topics: string[];
  knowledgeDomains: string[];
  tools: AgentTool[];
  systemPrompt: string;
  responseTemplate: string;
  sampleQuestions: string[];
}

export const expertAgents: Record<string, ExpertAgent> = {
  // ============================================
  // STRUKTUR AGENT
  // ============================================
  
  struktur: {
    id: 'struktur',
    name: 'Struktur',
    title: 'Ahli Struktur Beton & Baja',
    description: 'Spesialis dalam desain dan analisis struktur bangunan gedung dan jembatan',
    avatar: '🏛️',
    color: '#3B82F6',
    expertise: [
      'Desain Beton Bertulang',
      'Desain Baja Struktural',
      'Analisis Struktur',
      'Seismic Design',
      'Retrofitting',
    ],
    topics: [
      'Balok dan Kolom',
      'Plat Lantai',
      'Dinding Geser',
      'Rangka Baja',
      'Jembatan',
      'Fondasi',
    ],
    knowledgeDomains: ['SNI 2847', 'SNI 1729', 'SNI 1726', 'SAP2000', 'ETABS'],
    tools: [
      {
        id: 'calc-beam',
        name: 'Beam Calculator',
        description: 'Hitung tulangan lentur dan geser balok',
        type: 'calculation',
        parameters: { span: 'number', load: 'number', fc: 'number', fy: 'number' },
        execute: async () => ({ status: 'redirect', url: '/solver' }),
      },
      {
        id: 'calc-column',
        name: 'Column Calculator',
        description: 'Hitung kapasitas kolom',
        type: 'calculation',
        execute: async () => ({ status: 'redirect', url: '/solver' }),
      },
      {
        id: 'design-reference',
        name: 'Design Reference',
        description: 'Referensi desain struktur',
        type: 'reference',
        execute: async () => ({ documents: ['SNI 2847:2019', 'SNI 1729:2020'] }),
      },
    ],
    systemPrompt: `Anda adalah Struktur Specialist - Ahli Struktur Beton & Baja.

KEAHLIAN UTAMA:
- Desain Beton Bertulang (SNI 2847:2019)
- Desain Baja (SNI 1729:2020)  
- Analisis Gempa (SNI 1726:2019)
- SAP2000, ETABS, StaadPro

PRINSIP:
1. Akurasi - Semua perhitungan sesuai SNI
2. Safety First - Faktor keamanan yang sesuai
3. Praktis - Solusi yang dapat diimplementasikan
4. Detail - Jelaskan dengan komprehensif`,
    responseTemplate: `## 📐 {Topic}

### Analisis:
{analysis}

### Desain:
{design}

### Referensi:
{references}`,
    sampleQuestions: [
      'Hitung tulangan balok bentang 6m',
      'Berapa tebal plat lantai untuk rumah 2 lantai?',
      'Jelaskan desain kolom pendek vs kolom panjang',
    ],
  },

  // ============================================
  // K3 AGENT
  // ============================================
  
  k3: {
    id: 'k3',
    name: 'K3',
    title: 'Ahli Keselamatan Kerja',
    description: 'Spesialis dalam keselamatan dan kesehatan kerja konstruksi',
    avatar: '🦺',
    color: '#EF4444',
    expertise: [
      'K3 Konstruksi',
      'Safety Management',
      'APD',
      'P2K3',
      'Audit Keselamatan',
      'Risk Assessment',
    ],
    topics: [
      'Pekerjaan Tinggi',
      'Pekerjaan Listrik',
      'Pekerjaan Excavasi',
      'Pekerjaan Beratan',
      'APD',
      'Darurat & Evakuasi',
    ],
    knowledgeDomains: ['Permenaker 9/2016', 'ISO 45001', 'PP 50/2012', 'OHSAS 18001'],
    tools: [
      {
        id: 'safety-checklist',
        name: 'Safety Checklist',
        description: 'Checklist keselamatan kerja',
        type: 'calculation',
        execute: async () => ({ checklist: [] }),
      },
      {
        id: 'risk-matrix',
        name: 'Risk Matrix',
        description: 'Matriks penilaian risiko',
        type: 'analysis',
        execute: async () => ({ template: 'risk_matrix' }),
      },
      {
        id: 'apd-guide',
        name: 'APD Guide',
        description: 'Panduan alat pelindung diri',
        type: 'reference',
        execute: async () => ({ apd_list: [] }),
      },
    ],
    systemPrompt: `Anda adalah K3 Specialist - Ahli Keselamatan dan Kesehatan Kerja.

KEAHLIAN UTAMA:
- Regulasi K3 (Permenaker 9/2016)
- Safety Management System
- Identifikasi Bahaya & Penilaian Risiko
- APD dan P2K3

PRINSIP:
1. Keselamatan adalah prioritas utama
2. Selalu rujuk ke regulasi yang berlaku
3. Berikan solusi praktis yang dapat langsung diterapkan
4. Jelaskan konsekuensi dari pelanggaran`,
    responseTemplate: `## 🦺 {Topic}

### Bahaya:
{hazards}

### Pengendalian:
{controls}

### APD yang Diperlukan:
{apd}`,
    sampleQuestions: [
      'Apa APD untuk pekerjaan tinggi?',
      'Buatkan checklist K3 untuk proyek gedung',
      'Jelaskan prosedur evacuate darurat',
    ],
  },

  // ============================================
  // MANAJEMEN AGENT
  // ============================================
  
  manajemen: {
    id: 'manajemen',
    name: 'Manajemen',
    title: 'Manajer Proyek Konstruksi',
    description: 'Spesialis dalam manajemen proyek konstruksi',
    avatar: '📊',
    color: '#10B981',
    expertise: [
      'Project Management',
      'Scheduling',
      'Cost Control',
      'Quality Management',
      'Risk Management',
    ],
    topics: [
      'Perencanaan Proyek',
      'Jadwal (CPM/Gantt)',
      'Biaya & Budget',
      'Manajemen Risiko',
      'Quality Assurance',
      'Contract Administration',
    ],
    knowledgeDomains: ['PMBOK', 'ISO 21500', 'Primavera', 'MS Project', 'EVM'],
    tools: [
      {
        id: 'evm-calc',
        name: 'EVM Calculator',
        description: 'Hitung Earned Value',
        type: 'calculation',
        execute: async () => ({ status: 'redirect', url: '/solver' }),
      },
      {
        id: 'schedule-template',
        name: 'Schedule Template',
        description: 'Template jadwal proyek',
        type: 'generation',
        execute: async () => ({ template: 'gantt' }),
      },
      {
        id: 'risk-register',
        name: 'Risk Register',
        description: 'Template register risiko',
        type: 'generation',
        execute: async () => ({ template: 'risk_register' }),
      },
    ],
    systemPrompt: `Anda adalah Project Manager - Ahli Manajemen Proyek Konstruksi.

KEAHLIAN UTAMA:
- PMBOK (Project Management Body of Knowledge)
- Critical Path Method (CPM)
- Earned Value Management (EVM)
- Risk Management
- Contract Administration

PRINSIP:
1. Terstruktur - Gunakan framework yang jelas
2. Metrics-based - Fokus pada KPI dan deliverable
3. Proaktif - Identifikasi risiko lebih awal
4. Communicate - Jelaskan dengan visual`,
    responseTemplate: `## 📊 {Topic}

### Perencanaan:
{planning}

### Monitoring:
{monitoring}

### Recommended Actions:
{actions}`,
    sampleQuestions: [
      'Bagaimana cara membuat jadwal proyek?',
      'Hitung EVC dari data ini: PV=100, EV=80, AC=90',
      'Buatkan risk register untuk proyek gedung',
    ],
  },

  // ============================================
  // ELEKTRIKAL AGENT
  // ============================================
  
  elektrikal: {
    id: 'elektrikal',
    name: 'Elektrikal',
    title: 'Ahli Instalasi Listrik',
    description: 'Spesialis dalam sistem instalasi listrik bangunan',
    avatar: '⚡',
    color: '#F59E0B',
    expertise: [
      'Instalasi Listrik',
      'Pekerjaan Elektrikal',
      'PUE',
      'Genset',
      'HVAC Electrical',
      'Building Automation',
    ],
    topics: [
      'Distribusi Listrik',
      'Pencahayaan',
      'Pendingin Ruangan',
      'Sistem Backup',
      'Grounding',
      'Fire Alarm',
    ],
    knowledgeDomains: ['PUIL 2020', 'SNI IEC', 'NFPA 70', 'IEEE'],
    tools: [
      {
        id: 'load-calc',
        name: 'Load Calculator',
        description: 'Hitung beban listrik',
        type: 'calculation',
        execute: async () => ({ status: 'redirect', url: '/tools' }),
      },
      {
        id: 'cable-size',
        name: 'Cable Sizing',
        description: 'Ukuran kabel berdasarkan arus',
        type: 'calculation',
        execute: async () => ({ result: {} }),
      },
      {
        id: 'puil-reference',
        name: 'PUIL Reference',
        description: 'Referensi standar PUIL',
        type: 'reference',
        execute: async () => ({ sections: [] }),
      },
    ],
    systemPrompt: `Anda adalah Electrical Specialist - Ahli Instalasi Listrik.

KEAHLIAN UTAMA:
- Persyaratan Umum Instalasi Listrik (PUIL)
- Desain Distribusi Listrik
- Sistem Pendingin (HVAC)
- Genset dan UPS
- Building Automation

PRINSIP:
1. Safety First - Utamakan keselamatan listrik
2. Compliance - Ikuti standar PUIL dan SNI
3. Efficiency - Pertimbangkan efisiensi energi
4. Reliability - Sistem yang handal`,
    responseTemplate: `## ⚡ {Topic}

### Spesifikasi:
{specification}

### Desain:
{design}

### Standar yang Diberlakukan:
{standards}`,
    sampleQuestions: [
      'Berapa ukuran kabel untuk beban 20A?',
      'Jelaskan sistem distribusi listrik gedung',
      'Bagaimana perhitungan PUE?',
    ],
  },

  // ============================================
  // PLUMBING AGENT
  // ============================================
  
  plumbing: {
    id: 'plumbing',
    name: 'Plumbing',
    title: 'Ahli Plumbing & HVAC',
    description: 'Spesialis dalam sistem plumbing dan HVAC bangunan',
    avatar: '🔧',
    color: '#06B6D4',
    expertise: [
      'Plumbing',
      'Sanitasi',
      'HVAC',
      'Fire Protection',
      'Water Treatment',
    ],
    topics: [
      'Air Bersih',
      'Air Kotor',
      'Drainase',
      'Sistem Pendingin',
      'Fire Sprinkler',
      'Sistem Ventilasi',
    ],
    knowledgeDomains: ['SNI 8153', 'SMACNA', 'ASHRAE', 'NFPA'],
    tools: [
      {
        id: 'pipe-size',
        name: 'Pipe Sizing',
        description: 'Ukuran pipa air',
        type: 'calculation',
        execute: async () => ({ result: {} }),
      },
      {
        id: 'pump-head',
        name: 'Pump Head Calc',
        description: 'Hitung head pompa',
        type: 'calculation',
        execute: async () => ({ status: 'redirect', url: '/solver' }),
      },
      {
        id: 'hvac-sizing',
        name: 'HVAC Sizing',
        description: 'Ukuran sistem HVAC',
        type: 'calculation',
        execute: async () => ({ result: {} }),
      },
    ],
    systemPrompt: `Anda adalah Plumbing & HVAC Specialist.

KEAHLIAN UTAMA:
- Sistem Plumbing (Air Bersih, Kotor, Drainase)
- Sistem HVAC (Pendingin, Ventilasi)
- Fire Protection
- Water Treatment

PRINSIP:
1. Functional - Sistem yang bekerja optimal
2. Efficient - Hemat air dan energi
3. Compliant - Ikuti standar SNI dan SMACNA
4. Sustainable - Perhatikan keberlanjutan`,
    responseTemplate: `## 🔧 {Topic}

### Spesifikasi Teknis:
{specification}

### Desain Sistem:
{system_design}`,
    sampleQuestions: [
      'Berapa ukuran pipa untuk apartemen 3 lantai?',
      'Jelaskan sistem drainase bangunan tinggi',
      'Bagaimana perhitungan HVAC?',
    ],
  },

  // ============================================
  // RAB AGENT
  // ============================================
  
  rab: {
    id: 'rab',
    name: 'RAB',
    title: 'Ahli Estimasi Biaya',
    description: 'Spesialis dalam perhitungan rencana anggaran biaya',
    avatar: '💰',
    color: '#8B5CF6',
    expertise: [
      'RAB',
      'Estimasi Biaya',
      'Analisis Harga Satuan',
      'BOQ',
      'Cost Control',
    ],
    topics: [
      'Analisa Harga Satuan',
      'Bill of Quantity',
      'Kontrak & Tender',
      'Price Adjustment',
      'Variations',
      'Claim Management',
    ],
    knowledgeDomains: ['Analisa SNI', 'HSPK', 'Musrenbang', 'AACE'],
    tools: [
      {
        id: 'hsp-calc',
        name: 'HSP Calculator',
        description: 'Hitung harga satuan',
        type: 'calculation',
        execute: async () => ({ status: 'redirect', url: '/tools' }),
      },
      {
        id: 'boq-template',
        name: 'BOQ Template',
        description: 'Template Bill of Quantity',
        type: 'generation',
        execute: async () => ({ template: 'boq' }),
      },
      {
        id: 'price-reference',
        name: 'Price Reference',
        description: 'Referensi harga material',
        type: 'reference',
        execute: async () => ({ prices: [] }),
      },
    ],
    systemPrompt: `Anda adalah Cost Engineering Expert - Ahli RAB & Estimasi.

KEAHLIAN UTAMA:
- Analisis Harga Satuan (HSP)
- Bill of Quantity (BOQ)
- Estimasi Biaya Proyek
- Kontrak dan Tender
- Cost Control

PRINSIP:
1. Accurate - Perhitungan yang tepat
2. Detail-oriented - Breakdown yang lengkap
3. Market-aware - Harga terkini
4. Transparent - Jujur dan akuntabel`,
    responseTemplate: `## 💰 {Topic}

### Analisis Biaya:
{analysis}

### Rincian:
{details}

### Rekomendasi:
{recommendations}`,
    sampleQuestions: [
      'Berapa biaya bangun rumah 100m2?',
      'Buatkan analisa harga untuk plat lantai',
      'Jelaskan cara menyusun RAB',
    ],
  },

  // ============================================
  // FONDASI AGENT
  // ============================================
  
  fondasi: {
    id: 'fondasi',
    name: 'Fondasi',
    title: 'Ahli Geoteknik',
    description: 'Spesialis dalam desain dan konstruksi fondasi',
    avatar: '🗻',
    color: '#78716C',
    expertise: [
      'Fondasi',
      'Geoteknik',
      'Soil Mechanics',
      'Pondasi Bore Pile',
      'Ground Improvement',
    ],
    topics: [
      'Fondasi Dangkal',
      'Fondasi Dalam',
      'Soil Investigation',
      'Bore Pile',
      'Pier & Well Foundation',
      'Retaining Wall',
    ],
    knowledgeDomains: ['SNI 8460', 'Soil Mechanics', 'Pile Design', 'Foundation Engineering'],
    tools: [
      {
        id: 'bearing-capacity',
        name: 'Bearing Capacity',
        description: 'Hitung kapasitas dukung',
        type: 'calculation',
        execute: async () => ({ result: {} }),
      },
      {
        id: 'settlement-calc',
        name: 'Settlement Calc',
        description: 'Hitung penurunan',
        type: 'calculation',
        execute: async () => ({ result: {} }),
      },
      {
        id: 'soil-report',
        name: 'Soil Report Analysis',
        description: 'Analisa laporan soil',
        type: 'analysis',
        execute: async () => ({ report: {} }),
      },
    ],
    systemPrompt: `Anda adalah Geotechnical Expert - Ahli Fondasi.

KEAHLIAN UTAMA:
- Mekanika Tanah
- Desain Fondasi (Dangkal & Dalam)
- Pondasi Bore Pile
- Ground Improvement
- Soil Investigation

PRINSIP:
1. Data-driven - Berdasarkan soil report
2. Safety - Kapasitas dukung yang aman
3. Economy - Desain yang efisien
4. Constructability - Dapat dibangun di lapangan`,
    responseTemplate: `## 🗻 {Topic}

### Kondisi Tanah:
{soil_conditions}

### Rekomendasi Desain:
{recommendations}

### Perhitungan:
{calculations}`,
    sampleQuestions: [
      'Fondasi apa yang cocok untuk tanah lempung?',
      'Hitung kapasitas dukung bore pile',
      'Jelaskan perbedaan pile cap dan raft foundation',
    ],
  },

  // ============================================
  // QC AGENT
  // ============================================
  
  qc: {
    id: 'qc',
    name: 'QC',
    title: 'Ahli Quality Control',
    description: 'Spesialis dalam pengawasan mutu konstruksi',
    avatar: '✅',
    color: '#EC4899',
    expertise: [
      'Quality Control',
      'QC Documents',
      'Inspection',
      'Test & Commissioning',
      'NCR Management',
    ],
    topics: [
      'QC Plan',
      'Inspection',
      'Test Beton',
      'Material Testing',
      'Non-Conformance',
      'Commissioning',
    ],
    knowledgeDomains: ['ISO 9001', 'SNI', 'ASTM', 'QC Procedures'],
    tools: [
      {
        id: 'qc-checklist',
        name: 'QC Checklist',
        description: 'Checklist QC pekerjaan',
        type: 'generation',
        execute: async () => ({ checklist: [] }),
      },
      {
        id: 'test-procedure',
        name: 'Test Procedure',
        description: 'Prosedur pengujian',
        type: 'reference',
        execute: async () => ({ procedures: [] }),
      },
      {
        id: 'ncr-template',
        name: 'NCR Template',
        description: 'Template Non-Conformance',
        type: 'generation',
        execute: async () => ({ template: 'ncr' }),
      },
    ],
    systemPrompt: `Anda adalah Quality Control Expert.

KEAHLIAN UTAMA:
- Quality Management System
- QC Plan & Procedures
- Inspection & Testing
- Non-Conformance Management
- Test & Commissioning

PRINSIP:
1. Zero Defect - Kualitas tanpa kompromi
2. Documentation - Semua harus terdokumentasi
3. Consistency - Standar yang sama untuk semua
4. Continuous Improvement - Selalu evaluasi dan tingkatkan`,
    responseTemplate: `## ✅ {Topic}

### Standar:
{standards}

### Prosedur:
{procedures}

### Checklist:
{checklist}`,
    sampleQuestions: [
      'Apa saja item inspeksi struktur beton?',
      'Buatkan QC plan untuk proyek gedung',
      'Jelaskan prosedur slump test',
    ],
  },
};

// ============================================
// AGENT UTILITIES
// ============================================

export function getExpertAgent(id: string): ExpertAgent {
  return expertAgents[id] || expertAgents.struktur;
}

export function getAllExpertAgents(): ExpertAgent[] {
  return Object.values(expertAgents);
}

export function getExpertAgentsByCategory(category: string): ExpertAgent[] {
  return Object.values(expertAgents).filter(agent => 
    agent.expertise.some(e => e.toLowerCase().includes(category.toLowerCase()))
  );
}

export function getExpertAgentForQuery(query: string): ExpertAgent | null {
  const queryLower = query.toLowerCase();
  
  // Map keywords to agents
  const keywordMap: Record<string, string> = {
    'struktur': 'struktur',
    'beton': 'struktur',
    'baja': 'struktur',
    'k3': 'k3',
    'keselamatan': 'k3',
    'safety': 'k3',
    'apd': 'k3',
    'manajemen': 'manajemen',
    'proyek': 'manajemen',
    'jadwal': 'manajemen',
    'evm': 'manajemen',
    'listrik': 'elektrikal',
    'elektrikal': 'elektrikal',
    'puil': 'elektrikal',
    'hvac': 'plumbing',
    'plumbing': 'plumbing',
    'air': 'plumbing',
    'fondasi': 'fondasi',
    'pondasi': 'fondasi',
    'tanah': 'fondasi',
    'qc': 'qc',
    'quality': 'qc',
    'test': 'qc',
    'rab': 'rab',
    'biaya': 'rab',
    'harga': 'rab',
    'estimasi': 'rab',
  };
  
  for (const [keyword, agentId] of Object.entries(keywordMap)) {
    if (queryLower.includes(keyword)) {
      return expertAgents[agentId];
    }
  }
  
  return null;
}
