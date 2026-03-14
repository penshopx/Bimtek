'use client';

import { useState } from 'react';
import Link from 'next/link';

interface DocTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
}

const docTemplates: DocTemplate[] = [
  { id: 'iso9001-manual', title: 'Manual Mutu ISO 9001', category: 'ISO 9001', description: 'Manual Mutu lengkap untuk Sistem Manajemen Mutu' },
  { id: 'iso9001-prosedur', title: 'Prosedur Umum ISO 9001', category: 'ISO 9001', description: 'Template prosedur umum SMM (10 prosedur)' },
  { id: 'iso9001-audit', title: 'Checklist Audit Internal ISO 9001', category: 'ISO 9001', description: 'Checklist audit internal berdasarkan clause ISO 9001:2015' },
  { id: 'iso37001-kebijakan', title: 'Kebijakan Anti Penyuapan ISO 37001', category: 'ISO 37001', description: 'Template kebijakan anti penyuapan' },
  { id: 'iso37001-prosedur', title: 'Prosedur SMAP ISO 37001', category: 'ISO 37001', description: 'Prosedur due diligence, pembayaran, hadiah' },
  { id: 'iso37001-audit', title: 'Checklist Audit Internal ISO 37001', category: 'ISO 37001', description: 'Checklist audit internal SMAP' },
  { id: 'iso37001-whistleblower', title: 'Kebijakan Whistleblowing ISO 37001', category: 'ISO 37001', description: 'Kebijakan dan prosedur whistleblowing' },
  { id: 'iso45001-manual', title: 'Manual K3 ISO 45001', category: 'ISO 45001', description: 'Manual Sistem Manajemen K3' },
  { id: 'iso45001-prosedur', title: 'Prosedur K3 ISO 45001', category: 'ISO 45001', description: 'Proseduridentifikasi bahaya dan penilaian risiko' },
  { id: 'iso45001-audit', title: 'Checklist Audit Internal ISO 45001', category: 'ISO 45001', description: 'Checklist audit internal K3' },
  { id: 'iso45001-jsa', title: 'JSA - Job Safety Analysis', category: 'ISO 45001', description: 'Template analisis keselamatan kerja' },
  { id: 'iso14001-manual', title: 'Manual Lingkungan ISO 14001', category: 'ISO 14001', description: 'Manual Sistem Manajemen Lingkungan' },
  { id: 'iso14001-aspek', title: 'Form Identifikasi Aspek Lingkungan', category: 'ISO 14001', description: 'Form identifikasi aspek dan dampak lingkungan' },
  { id: 'iso14001-audit', title: 'Checklist Audit Internal ISO 14001', category: 'ISO 14001', description: 'Checklist audit internal lingkungan' },
  { id: 'iso14001-legal', title: 'Legal Register ISO 14001', category: 'ISO 14001', description: 'Register kepatuhan lingkungan' },
  { id: 'antikorupsi-kode', title: 'Kode Etik Anti Korupsi', category: 'Anti Korupsi', description: 'Kode etik dan perilaku anti korupsi' },
  { id: 'antikorupsi-gratifikasi', title: 'Form Pelaporan Gratifikasi', category: 'Anti Korupsi', description: 'Form pelaporan gratifikasi' },
  { id: 'antikorupsi-risk', title: 'Penilaian Risiko Korupsi', category: 'Anti Korupsi', description: 'Matriks penilaian risiko korupsi' },
];

const categoryGroups = [
  { id: 'iso9001', name: 'ISO 9001 - Sistem Mutu', color: 'blue' },
  { id: 'iso37001', name: 'ISO 37001 - Anti Penyuapan', color: 'green' },
  { id: 'iso45001', name: 'ISO 45001 - K3', color: 'red' },
  { id: 'iso14001', name: 'ISO 14001 - Lingkungan', color: 'emerald' },
  { id: 'antikorupsi', name: 'Anti Korupsi', color: 'amber' },
];

export default function IsoGeneratorPage() {
  const [selectedDoc, setSelectedDoc] = useState<DocTemplate | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [companyName, setCompanyName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateDocument = (doc: DocTemplate) => {
    setSelectedDoc(doc);
    setIsGenerating(true);
    
    setTimeout(() => {
      let content = '';
      
      if (doc.id === 'iso9001-manual') {
        content = `MANUAL MUTU
PT. [NAMA PERUSAHAAN]
Nomor Dokumen: MM/001
Revisi: 00
Tanggal: ${new Date().toLocaleDateString('id-ID')}

BAB 1 - PENDAHULUAN
1.1 Latar Belakang
PT. [NAMA PERUSAHAAN] berkomitmen untuk menerapkan Sistem Manajemen Mutu sesuai standar ISO 9001:2015 guna meningkatkan kepuasan pelanggan dan kinerja organisasi.

1.2 Ruang Lingkup
Sistem Manajemen Mutu ini mencakup seluruh aktivitas [jenis usaha] di [lokasi].

1.3 Referensi
- ISO 9001:2015 Sistem Manajemen Mutu
- SNI ISO 9001:2015
- Peraturan perundang-undangan yang berlaku

BAB 2 - ORGANISASI
2.1 Struktur Organisasi
[Struktur organisasi]

2.2 Kepemimpinan
Direksi PT. [NAMA PERUSAHAAN] berkomitmen untuk:
a) Memastikan kebijakan mutu ditetapkan dan dikomunikasikan
b) Memastikan sasaran mutu ditetapkan
c) Menyediakan sumber daya yang diperlukan
d) Melakukan tinjauan manajemen secara berkala

BAB 3 - PERNYATAAN MUTU DAN KEBIJAKAN
3.1 Kebijakan Mutu
PT. [NAMA PERUSAHAAN] berkomitmen untuk:
- Memberikan layanan terbaik kepada pelanggan
- Meningkatkan kinerja mutu secara berkelanjutan
- Mematuhi persyaratan regulasi yang berlaku

3.2 Sasaran Mutu
a) Kepuasan pelanggan > 85%
b) Ketepatan waktu delivery 95%
c) Non-conformance < 3%

[... continue with remaining chapters ...]`;
      } else if (doc.id === 'iso9001-audit') {
        content = `CHECKLIST AUDIT INTERNAL ISO 9001:2015
Perusahaan: PT. [NAMA]
Tanggal Audit: ____________
Auditor: ___________________
Auditee: ___________________

CLAUSE 4 - KONTEKS ORGANISASI
[ ] 4.1 Memahami organisasi dan konteks
[ ] 4.2 Memahami kebutuhan pihak berkepentingan
[ ] 4.3 Menentukan ruang lingkup SMM
[ ] 4.4 Sistem manajemen mutu

CLAUSE 5 - KEPUEMIMPINAN
[ ] 5.1 Kepemimpinan dan komitmen
[ ] 5.2 Fokus pada pelanggan
[ ] 5.3 Kebijakan mutu
[ ] 5.4 Peran, tanggung jawab dan wewenang

CLAUSE 6 - PERENCANAAN
[ ] 6.1 Aksi应对 risiko dan peluang
[ ] 6.2 Sasaran mutu dan perencanaan mencapainya
[ ] 6.3 Perencanaan perubahan

[... continue ...]`;
      } else if (doc.id.includes('kebijakan') || doc.id.includes('-kode')) {
        content = `KEBIJAKAN [ANTI PENYUAPAN / ANTI KORUPSI]
PT. [NAMA PERUSAHAAN]

Nomor: KP/[NOMOR]/2026
Tanggal: ${new Date().toLocaleDateString('id-ID')}

Dengan ini kami menyatakan komitmen untuk:
1. MENCEGAH semua bentuk penyuapan dan korupsi
2. Mematuhi hukum dan regulasi yang berlaku
3. Menyediakan sumber daya yang diperlukan
4. Memberikan sanksi tegas bagi pelaku

RUANG LINGKUP
Kebijakan ini berlaku bagi seluruh karyawan, manajemen, pemasok, dan pihak ketiga yang bekerja sama dengan PT. [NAMA PERUSAHAAN].

PELANGGARAN
Pelanggaran terhadap kebijakan ini akan dikenakan sanksi sesuai peraturan perusahaan dan hukum yang berlaku.

[TTD Direksi]`;
      } else if (doc.id === 'iso37001-audit' || doc.id === 'iso45001-audit' || doc.id === 'iso14001-audit') {
        content = `CHECKLIST AUDIT INTERNAL
ISO [NOMOR]:2016
Perusahaan: PT. [NAMA]
Tanggal: ____________

NO | CLAUSE | PERTANYAAN | Y | T | KETERANGAN
---|--------|-----------|---|---|-------------
1  |  4.1   | Organisasi memahami konteks? |  |  |
2  |  4.2   | Pihak berkepentingan diidentifikasi? |  |  |
3  |  4.3   | Ruang lingkup ditetapkan? |  |  |
4  |  5.1   | Kepemimpinan komitmen? |  |  |
5  |  5.2   | Kebijakan anti penyuapan ada? |  |  |
...`;
      } else if (doc.id === 'iso45001-jsa') {
        content = `JOB SAFETY ANALYSIS (JSA)
PEKERJAAN: _______________________
LOKASI: __________________________
TANGGAL: _________________________

NO | LANGKAH KERJA | BAHAYA | RISIKO | PENGENDALIAN
---|--------------|--------|--------|-------------
1  |              |        |        |             
2  |              |        |        |             
3  |              |        |        |             

Disusun oleh: ____________
Ditinjau oleh: ____________
Disetujui oleh: ____________`;
      } else if (doc.id === 'iso14001-aspek') {
        content = `FORM IDENTIFIKASI ASPEK DAN DAMPAK LINGKUNGAN
PT. [NAMA PERUSAHAAN]
Bulan: ________________

NO | AKTIVITAS | ASPEK LINGKUNGAN | DAMPAK LINGKUNGAN | JENIS DAMPAK | STATUS | PENGENDALIAN
---|-----------|------------------|-------------------|--------------|--------|-------------
1  |           |                  |                   |              |        |            
2  |           |                  |                   |              |        |            
3  |           |                  |                   |              |        |            

Keterangan:
- Jenis Dampak: Positif/Negatif
- Status: Signifikan/Tidak Signifikan

Disusun: ____________
Ditinjau: ____________
Disetujui: ____________`;
      } else {
        content = `DOKUMEN SISTEM MANAJEMEN
${doc.title}
PT. [NAMA PERUSAHAAN]

1. TUJUAN
[Deskripsi tujuan dokumen]

2. RUANG LINGKUP
[Deskripsi ruang lingkup]

3. DEFINISI
[Definisi istilah]

4. REFERENSI
- ISO [NOMOR]:2015
- Peraturan terkait

5. PROSEDUR
[Isi prosedur]

6. RECORD
- [Daftar record yang diperlukan]

7. LAMPIRAN
[Jika ada]

Disusun oleh: ____________
Ditinjau oleh: ____________
Disetujui oleh: ____________
Tanggal efektif: ____________`;
      }
      
      setGeneratedContent(content);
      setIsGenerating(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            📄 ISO Document Generator
          </h1>
          <p className="text-lg text-slate-600">
            Generate dokumen ISO untuk Sistem Manajemen Mutu, Anti Penyuapan, K3, dan Lingkungan
          </p>
        </div>

        {!selectedDoc ? (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-6 text-white">
              <h2 className="text-xl font-semibold mb-2">Generator Dokumen ISO Otomatis</h2>
              <p className="text-amber-100">
                Pilih template dokumen yang Anda butuhkan. Isi nama perusahaan dan dokumen akan digenerate secara otomatis.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nama Perusahaan
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="PT. Contoh Konstruksi Indonesia"
                className="w-full md:w-1/2 px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition"
              />
            </div>

            {categoryGroups.map((group) => (
              <div key={group.id} className="mb-8">
                <h3 className={`text-lg font-semibold text-${group.color}-700 mb-4 flex items-center gap-2`}>
                  <span className={`w-3 h-3 bg-${group.color}-500 rounded-full`}></span>
                  {group.name}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {docTemplates
                    .filter((doc) => doc.category.toLowerCase().includes(group.id.split('-')[0]) || 
                      (group.id === 'antikorupsi' && doc.category === 'Anti Korupsi'))
                    .map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => generateDocument(doc)}
                        className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 text-left hover:shadow-md hover:border-amber-400 transition-all"
                      >
                        <h4 className="font-semibold text-slate-800 mb-2">{doc.title}</h4>
                        <p className="text-sm text-slate-500">{doc.description}</p>
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <button
              onClick={() => { setSelectedDoc(null); setGeneratedContent(''); }}
              className="mb-4 text-amber-600 hover:text-amber-700 font-medium flex items-center gap-2"
            >
              ← Kembali ke Generator
            </button>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-slate-800 text-white px-6 py-4">
                <h2 className="text-xl font-semibold">{selectedDoc.title}</h2>
                <p className="text-slate-300 text-sm">{selectedDoc.category}</p>
              </div>

              <div className="p-6">
                {isGenerating ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
                    <span className="ml-4 text-slate-600">Generating document...</span>
                  </div>
                ) : generatedContent ? (
                  <div>
                    <div className="mb-4 flex gap-3">
                      <button
                        onClick={() => {
                          const content = generatedContent.replace(/\[NAMA PERUSAHAAN\]/g, companyName || 'PT. [NAMA PERUSAHAAN]');
                          navigator.clipboard.writeText(content);
                        }}
                        className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition flex items-center gap-2"
                      >
                        📋 Copy to Clipboard
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition flex items-center gap-2"
                      >
                        🖨️ Print
                      </button>
                    </div>
                    <pre className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm overflow-x-auto whitespace-pre-wrap font-mono">
                      {generatedContent.replace(/\[NAMA PERUSAHAAN\]/g, companyName || 'PT. [NAMA PERUSAHAAN]')}
                    </pre>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
