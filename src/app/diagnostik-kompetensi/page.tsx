'use client';

import { useState } from 'react';

const jenjangOptions = ['SMA/SMK', 'D3 (Diploma 3)', 'D4 / Sarjana Terapan', 'S1 (Sarjana)', 'S2 (Magister)', 'S3 (Doktor)'];
const bidangOptions = ['Teknik Sipil', 'Teknik Arsitektur', 'Teknik Mekanikal', 'Teknik Elektrikal', 'Teknik Lingkungan', 'Manajemen Konstruksi', 'Teknik Geologi', 'Teknik Bangunan', 'Lainnya'];
const pengalamanBidangOptions = ['Konstruksi Gedung', 'Konstruksi Jalan & Jembatan', 'Konstruksi Irigasi & Air', 'Mekanikal Elektrikal Plumbing', 'K3 Konstruksi', 'Manajemen Proyek', 'Pengawasan Konstruksi', 'Estimasi Biaya / RAB', 'Lainnya'];

interface DiagnostikResult {
  kkniLevel: number;
  kkniLabel: string;
  jabatanEligible: { nama: string; kode: string; alasan: string; match: number }[];
  jabatanTarget1Tahun: { nama: string; kode: string; syaratTambahan: string }[];
  gaps: { aspek: string; kondisiSekarang: string; yangDibutuhkan: string; prioritas: string }[];
  rekomendasiLangkah: string[];
  estimasiBiayaSKK: string;
  catatanPenting: string;
}

export default function DiagnostikPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DiagnostikResult | null>(null);

  // Form state
  const [jenjang, setJenjang] = useState('');
  const [bidang, setBidang] = useState('');
  const [bidangLain, setBidangLain] = useState('');
  const [pengalamanTahun, setPengalamanTahun] = useState('');
  const [pengalamanBidang, setPengalamanBidang] = useState('');
  const [pengalamanDeskripsi, setPengalamanDeskripsi] = useState('');
  const [target, setTarget] = useState('');

  const runDiagnostik = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/diagnostik', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jenjang,
          bidang: bidang === 'Lainnya' ? bidangLain : bidang,
          pengalamanTahun,
          pengalamanBidang,
          pengalamanDeskripsi,
          target: target || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Analisis gagal');
      setResult(data);
      setStep(4);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(1); setResult(null); setError(null);
    setJenjang(''); setBidang(''); setBidangLain('');
    setPengalamanTahun(''); setPengalamanBidang(''); setPengalamanDeskripsi(''); setTarget('');
  };

  const prioritasColor = (p: string) =>
    p === 'tinggi' ? 'text-red-400 bg-red-500/10 border-red-500/30' :
    p === 'sedang' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' :
    'text-slate-400 bg-slate-500/10 border-slate-500/30';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium mb-4">
            🧠 Analisis AI · SKKNI / KKNI
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Diagnostik Kompetensi SKK</h1>
          <p className="text-slate-400">Masukkan profil kamu — AI analisis gap & rekomendasikan jabatan SKK yang bisa diambil</p>
        </div>

        {/* Progress steps */}
        {step < 4 && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step >= s ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-500'
                }`}>
                  {s}
                </div>
                {s < 3 && <div className={`w-16 h-0.5 ${step > s ? 'bg-amber-500' : 'bg-slate-700'}`} />}
              </div>
            ))}
          </div>
        )}

        <div className="bg-slate-800/70 rounded-2xl border border-slate-700 p-6">

          {/* STEP 1 — Pendidikan */}
          {step === 1 && (
            <div>
              <h2 className="text-lg font-bold text-white mb-1">📚 Latar Belakang Pendidikan</h2>
              <p className="text-slate-400 text-sm mb-6">Langkah 1 dari 3</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Jenjang Pendidikan Terakhir *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {jenjangOptions.map(j => (
                      <button
                        key={j}
                        onClick={() => setJenjang(j)}
                        className={`p-3 rounded-lg border text-sm text-left transition-all ${
                          jenjang === j
                            ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                            : 'border-slate-600 text-slate-400 hover:border-slate-400'
                        }`}
                      >
                        {j}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Bidang Studi / Jurusan *</label>
                  <select
                    value={bidang}
                    onChange={e => setBidang(e.target.value)}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-amber-500 outline-none"
                  >
                    <option value="">Pilih bidang studi…</option>
                    {bidangOptions.map(b => <option key={b}>{b}</option>)}
                  </select>
                  {bidang === 'Lainnya' && (
                    <input
                      type="text"
                      value={bidangLain}
                      onChange={e => setBidangLain(e.target.value)}
                      placeholder="Tulis bidang studi kamu…"
                      className="mt-2 w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-amber-500 outline-none"
                    />
                  )}
                </div>
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!jenjang || !bidang || (bidang === 'Lainnya' && !bidangLain)}
                className="mt-6 w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl font-medium transition-colors"
              >
                Lanjut →
              </button>
            </div>
          )}

          {/* STEP 2 — Pengalaman */}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-bold text-white mb-1">💼 Pengalaman Kerja</h2>
              <p className="text-slate-400 text-sm mb-6">Langkah 2 dari 3</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Total pengalaman kerja konstruksi *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['< 1 tahun', '1–2 tahun', '2–3 tahun', '3–5 tahun', '5–8 tahun', '8+ tahun'].map(t => (
                      <button
                        key={t}
                        onClick={() => setPengalamanTahun(t)}
                        className={`p-3 rounded-lg border text-sm transition-all ${
                          pengalamanTahun === t
                            ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                            : 'border-slate-600 text-slate-400 hover:border-slate-400'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Bidang pekerjaan utama *</label>
                  <select
                    value={pengalamanBidang}
                    onChange={e => setPengalamanBidang(e.target.value)}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-amber-500 outline-none"
                  >
                    <option value="">Pilih bidang pekerjaan…</option>
                    {pengalamanBidangOptions.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Deskripsi singkat pekerjaan (opsional)</label>
                  <textarea
                    value={pengalamanDeskripsi}
                    onChange={e => setPengalamanDeskripsi(e.target.value)}
                    placeholder="Contoh: Saya 4 tahun sebagai pelaksana lapangan konstruksi gedung bertingkat, bertanggung jawab atas quality control dan koordinasi sub-kontraktor…"
                    rows={3}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-amber-500 outline-none resize-none text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="px-5 py-3 border border-slate-600 text-slate-400 hover:text-white rounded-xl">← Kembali</button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!pengalamanTahun || !pengalamanBidang}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl font-medium"
                >
                  Lanjut →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 — Target */}
          {step === 3 && (
            <div>
              <h2 className="text-lg font-bold text-white mb-1">🎯 Target Jabatan SKK</h2>
              <p className="text-slate-400 text-sm mb-6">Langkah 3 dari 3</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Jabatan SKK yang ingin dicapai (opsional)</label>
                  <input
                    type="text"
                    value={target}
                    onChange={e => setTarget(e.target.value)}
                    placeholder="Contoh: Site Manager Gedung, Ahli K3 Konstruksi…"
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-amber-500 outline-none"
                  />
                  <p className="text-slate-500 text-xs mt-1">Kosongkan jika ingin AI yang merekomendasikan jabatan terbaik untukmu.</p>
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-300 text-sm">
                  <div className="font-medium mb-1">📋 Ringkasan profil kamu:</div>
                  <div className="text-slate-400 space-y-0.5">
                    <div>• Pendidikan: {jenjang} — {bidang === 'Lainnya' ? bidangLain : bidang}</div>
                    <div>• Pengalaman: {pengalamanTahun} di bidang {pengalamanBidang}</div>
                    {pengalamanDeskripsi && <div>• &quot;{pengalamanDeskripsi.slice(0, 80)}{pengalamanDeskripsi.length > 80 ? '…' : ''}&quot;</div>}
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-red-400 text-sm">
                    ⚠️ {error}
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(2)} className="px-5 py-3 border border-slate-600 text-slate-400 hover:text-white rounded-xl">← Kembali</button>
                <button
                  onClick={runDiagnostik}
                  disabled={loading}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-white rounded-xl font-medium"
                >
                  {loading ? '🧠 AI sedang menganalisis…' : '🔍 Analisis Kompetensi'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4 — Result */}
          {step === 4 && result && (
            <div className="space-y-6">
              {/* KKNI Level badge */}
              <div className="text-center p-6 bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-xl border border-amber-500/30">
                <div className="text-4xl font-bold text-amber-400 mb-1">Level {result.kkniLevel}</div>
                <div className="text-white font-semibold text-lg">{result.kkniLabel}</div>
                <div className="text-slate-400 text-sm mt-1">Berdasarkan KKNI (Kerangka Kualifikasi Nasional Indonesia)</div>
              </div>

              {/* Jabatan eligible */}
              <div>
                <h3 className="text-white font-semibold mb-3">✅ Jabatan SKK yang bisa diambil sekarang</h3>
                <div className="space-y-2">
                  {result.jabatanEligible?.map((j, i) => (
                    <div key={i} className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <div className="font-medium text-green-300">{j.nama}</div>
                        <div className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full whitespace-nowrap">{j.match}% match</div>
                      </div>
                      <div className="text-slate-500 text-xs">{j.kode}</div>
                      <div className="text-slate-400 text-sm mt-1">{j.alasan}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Jabatan target */}
              {result.jabatanTarget1Tahun?.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-3">🎯 Bisa dicapai dalam 1–2 tahun</h3>
                  <div className="space-y-2">
                    {result.jabatanTarget1Tahun.map((j, i) => (
                      <div key={i} className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                        <div className="font-medium text-blue-300 mb-1">{j.nama}</div>
                        <div className="text-slate-500 text-xs mb-1">{j.kode}</div>
                        <div className="text-slate-400 text-sm">📌 {j.syaratTambahan}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gap analysis */}
              {result.gaps?.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-3">⚡ Gap Kompetensi</h3>
                  <div className="space-y-2">
                    {result.gaps.map((g, i) => (
                      <div key={i} className={`p-4 rounded-xl border ${prioritasColor(g.prioritas)}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{g.aspek}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${prioritasColor(g.prioritas)}`}>
                            {g.prioritas}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500">Kondisi: {g.kondisiSekarang}</div>
                        <div className="text-xs text-slate-400 mt-0.5">Dibutuhkan: {g.yangDibutuhkan}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Langkah rekomendasi */}
              <div>
                <h3 className="text-white font-semibold mb-3">🗺️ Langkah yang Disarankan</h3>
                <div className="space-y-2">
                  {result.rekomendasiLangkah?.map((langkah, i) => (
                    <div key={i} className="flex gap-3 items-start p-3 bg-slate-700/50 rounded-lg">
                      <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">{i + 1}</span>
                      <span className="text-slate-300 text-sm">{langkah}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Estimasi biaya + catatan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.estimasiBiayaSKK && (
                  <div className="p-4 bg-slate-700/50 rounded-xl">
                    <div className="text-slate-400 text-xs mb-1">💰 Estimasi Biaya Sertifikasi</div>
                    <div className="text-amber-400 font-semibold">{result.estimasiBiayaSKK}</div>
                  </div>
                )}
                {result.catatanPenting && (
                  <div className="p-4 bg-slate-700/50 rounded-xl">
                    <div className="text-slate-400 text-xs mb-1">📌 Catatan Penting</div>
                    <div className="text-slate-300 text-sm">{result.catatanPenting}</div>
                  </div>
                )}
              </div>

              <p className="text-slate-500 text-xs text-center">
                Hasil bersifat indikatif berdasarkan AI — bukan pengganti konsultasi asesor resmi BNSP.
              </p>

              {/* Actions */}
              <div className="flex gap-3 flex-wrap">
                <button onClick={reset} className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium text-sm">
                  🔄 Diagnostik Ulang
                </button>
                <a href="/mock-asesmen" className="px-5 py-2.5 border border-slate-600 hover:border-amber-500 text-slate-300 hover:text-amber-400 rounded-xl font-medium text-sm">
                  ✍️ Mock Asesmen SKK
                </a>
                <a href="/agentic-chat" className="px-5 py-2.5 border border-slate-600 hover:border-amber-500 text-slate-300 hover:text-amber-400 rounded-xl font-medium text-sm">
                  🤖 Tanya AI lebih lanjut
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
