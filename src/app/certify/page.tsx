'use client';

import { useState } from 'react';

const steps = [
  {
    number: 1,
    title: 'Pilih Jenjang & Jabatan',
    description: 'Tentukan jenjang sertifikasi (Ahli/Teknisi/Pelaksana) dan jabatan kerja sesuai kompetensi',
    details: ['Identifikasi bidang keahlian Anda', 'Pilih subklasifikasi yang sesuai', 'Tentukan level jabatan target'],
  },
  {
    number: 2,
    title: 'Persiapan Dokumen',
    description: 'Siapkan semua dokumen yang diperlukan untuk pengajuan sertifikasi',
    details: [
      'Ijazah dan transkrip nilai',
      'SK Pengalaman Kerja',
      'Sertifikat pelatihan (SKK)',
      'KTP dan foto terbaru',
      'Surat keterangan perusahaan',
    ],
  },
  {
    number: 3,
    title: 'Ajukan ke LSP',
    description: 'Lembaga Sertifikasi Profesi (LSP) yang terakreditasi',
    details: [
      'Pilih LSP sesuai bidang',
      'Submit aplikasi online',
      'Upload dokumen persyaratan',
      'Bayar biaya sertifikasi',
    ],
  },
  {
    number: 4,
    title: 'Asesmen Kompetensi',
    description: ' Proses uji kompetensi oleh asesor terakreditasi',
    details: [
      'Tesk tertulis ( pilihan ganda)',
      'Tesk praktik/keterampilan',
      'Observasi langsung',
      'Wawancara profesional',
    ],
  },
  {
    number: 5,
    title: 'SKK & Sertifikat',
    description: 'Penerbitan Sertifikat Kompetensi Kerja (SKK)',
    details: [
      'Verifikasi hasil asesmen',
      'Penerbitan SKK oleh BNSP',
      'Registrasi di database',
      'Pengambilan sertifikat',
    ],
  },
];

const requirements = [
  { title: 'SKK Tingkat I (Pelaksana)', education: 'SMA/SMK', experience: '1 tahun', training: '24 jam' },
  { title: 'SKK Tingkat II (Teknisi)', education: 'D3/D4', experience: '2 tahun', training: '40 jam' },
  { title: 'SKK Tingkat III (Ahli)', education: 'S1', experience: '3 tahun', training: '80 jam' },
  { title: 'SKK Tingkat IV (Ahli Madya)', education: 'S1', experience: '5 tahun', training: '120 jam' },
  { title: 'SKK Tingkat V (Manager)', education: 'S2', experience: '7 tahun', training: '160 jam' },
];

export default function CertifyPage() {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">✅ Certify</h1>
          <p className="text-lg text-slate-600">
            Guide lengkap proses sertifikasi tenaga konstruksi Indonesia
          </p>
        </div>

        <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-6 text-white mb-12">
          <h2 className="text-2xl font-bold mb-4">Alur Sertifikasi</h2>
          <p className="mb-4">Proses sertifikasi tenaga konstruksi melalui BNSP:</p>
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="bg-white/20 px-3 py-1 rounded-full">Pilih Jabatan →</span>
            <span className="bg-white/20 px-3 py-1 rounded-full">Persiapan Dokumen →</span>
            <span className="bg-white/20 px-3 py-1 rounded-full">Ajukan ke LSP →</span>
            <span className="bg-white/20 px-3 py-1 rounded-full">Asesmen →</span>
            <span className="bg-white/20 px-3 py-1 rounded-full">SKK</span>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">5 Langkah Sertifikasi</h2>
          <div className="space-y-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedStep(expandedStep === step.number ? null : step.number)}
                  className="w-full p-4 text-left flex items-center gap-4 hover:bg-slate-50"
                >
                  <span className="w-10 h-10 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {step.number}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800">{step.title}</h3>
                    <p className="text-sm text-slate-500">{step.description}</p>
                  </div>
                  <span className="text-slate-400">
                    {expandedStep === step.number ? '▲' : '▼'}
                  </span>
                </button>

                {expandedStep === step.number && (
                  <div className="px-4 pb-4 border-t border-slate-100 pt-4">
                    <ul className="space-y-2">
                      {step.details.map((detail, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                          <span className="text-amber-500">•</span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Persyaratan SKK per Tingkat</h2>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl shadow-sm border border-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold text-slate-700">Tingkat</th>
                  <th className="p-4 text-left text-sm font-semibold text-slate-700">Pendidikan</th>
                  <th className="p-4 text-left text-sm font-semibold text-slate-700">Pengalaman</th>
                  <th className="p-4 text-left text-sm font-semibold text-slate-700">Pelatihan</th>
                </tr>
              </thead>
              <tbody>
                {requirements.map((req, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    <td className="p-4 font-medium text-slate-800">{req.title}</td>
                    <td className="p-4 text-slate-600">{req.education}</td>
                    <td className="p-4 text-slate-600">{req.experience}</td>
                    <td className="p-4 text-slate-600">{req.training}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Dokumen Diperlukan</h3>
            <ul className="space-y-2">
              {['Ijazah asli & fotocopy', 'Transkrip nilai', 'SK Pengalaman kerja', 'Sertifikat pelatihan', 'KTP & Pas photo', 'NPWP'].map((doc, i) => (
                <li key={i} className="flex items-center gap-2 text-slate-600">
                  <span className="text-green-500">✓</span>
                  {doc}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Biaya Estimasi</h3>
            <ul className="space-y-2 text-slate-600">
              <li className="flex justify-between">
                <span>SKK Tingkat I-II:</span>
                <span className="font-semibold">Rp 500.000 - 1.000.000</span>
              </li>
              <li className="flex justify-between">
                <span>SKK Tingkat III:</span>
                <span className="font-semibold">Rp 1.000.000 - 2.000.000</span>
              </li>
              <li className="flex justify-between">
                <span>SKK Tingkat IV-V:</span>
                <span className="font-semibold">Rp 2.000.000 - 5.000.000</span>
              </li>
              <li className="text-xs text-slate-400 mt-4">
                *Biaya dapat bervariasi tergantung LSP
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Siap untuk Sertifikasi?</h3>
          <p className="mb-6 text-slate-300">
            Tanya AI Assistant kami untuk panduan lebih lanjut
          </p>
          <a
            href="/chat"
            className="inline-flex items-center px-6 py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600"
          >
            <span className="mr-2">💬</span>
            Tanya AI Sekarang
          </a>
        </div>
      </div>
    </div>
  );
}
