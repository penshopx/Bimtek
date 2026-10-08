'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { SKK_JABATAN, BIDANG_OPTIONS, KUALIFIKASI_OPTIONS, getJabatanByBidang } from '@/lib/skkData';
import type { Bidang, Kualifikasi } from '@/lib/skkData';

export function SkkSelectionModal() {
  const { user, isLoading, updateProfile } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [bidang, setBidang] = useState<Bidang | ''>('');
  const [jabatanId, setJabatanId] = useState('');
  const [kualifikasi, setKualifikasi] = useState<Kualifikasi | ''>('');
  const [saving, setSaving] = useState(false);

  // Only show for participants without a jabatan set; hide during auth init to prevent flash
  if (isLoading || !user || user.jabatanSkk || user.role === 'admin' || user.role === 'instructor') return null;

  const jabatanList = bidang ? getJabatanByBidang(bidang as Bidang) : [];

  const handleSave = async () => {
    if (!bidang || !jabatanId || !kualifikasi) return;
    setSaving(true);
    await updateProfile({
      bidang,
      jabatanSkk: jabatanId,
      kualifikasiSkk: kualifikasi,
    } as any);
    setSaving(false);
  };

  const selectedJabatan = SKK_JABATAN.find(j => j.id === jabatanId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-t-2xl p-6 text-white">
          <h2 className="text-2xl font-bold">🎯 Pilih Jabatan SKK Anda</h2>
          <p className="text-amber-100 text-sm mt-1">
            Kami akan menyesuaikan konten pelatihan dengan target sertifikasi Anda
          </p>
          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step >= s ? 'bg-white text-amber-600' : 'bg-amber-400/50 text-amber-100'
                }`}>
                  {step > s ? '✓' : s}
                </div>
                {s < 3 && <div className={`h-0.5 w-8 transition-all ${step > s ? 'bg-white' : 'bg-amber-400/50'}`} />}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Step 1: Bidang */}
          {step === 1 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Pilih Bidang</h3>
              <p className="text-slate-400 text-sm mb-4">Bidang pekerjaan konstruksi yang Anda tekuni</p>
              <div className="grid grid-cols-1 gap-3">
                {BIDANG_OPTIONS.map(b => (
                  <button
                    key={b}
                    onClick={() => { setBidang(b); setJabatanId(''); }}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      bidang === b
                        ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                        : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div className="font-semibold">
                      {b === 'Sipil' ? '🏗️ Sipil' : '📋 Manajemen Pelaksanaan'}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {b === 'Sipil'
                        ? 'Gedung, Sipil, Mekanikal, Elektrikal, Jalan, Jembatan'
                        : 'Pelaksana lapangan, Site Manager, QC Engineer, Cost Estimator'}
                    </div>
                  </button>
                ))}
              </div>
              <button
                disabled={!bidang}
                onClick={() => setStep(2)}
                className="mt-4 w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all"
              >
                Lanjut →
              </button>
            </div>
          )}

          {/* Step 2: Jabatan */}
          {step === 2 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Pilih Jabatan SKK</h3>
              <p className="text-slate-400 text-sm mb-4">Jabatan yang ingin Anda sertifikasi</p>
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {jabatanList.map(j => (
                  <button
                    key={j.id}
                    onClick={() => setJabatanId(j.id)}
                    className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                      jabatanId === j.id
                        ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                        : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div className="font-medium text-sm">{j.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {j.level} • Sub {j.subklasifikasi}
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setStep(1)} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-all">
                  ← Kembali
                </button>
                <button
                  disabled={!jabatanId}
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all"
                >
                  Lanjut →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Kualifikasi */}
          {step === 3 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Pilih Kualifikasi</h3>
              <p className="text-slate-400 text-sm mb-4">Level kualifikasi SKK yang Anda targetkan</p>

              {selectedJabatan && (
                <div className="mb-4 p-3 bg-slate-700/50 rounded-xl border border-slate-600">
                  <p className="text-amber-400 text-xs font-medium mb-1">Jabatan dipilih:</p>
                  <p className="text-white text-sm font-semibold">{selectedJabatan.name}</p>
                  <p className="text-slate-400 text-xs">{selectedJabatan.bidang} • {selectedJabatan.level}</p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3">
                {KUALIFIKASI_OPTIONS.map(k => (
                  <button
                    key={k}
                    onClick={() => setKualifikasi(k)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      kualifikasi === k
                        ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                        : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div className="font-semibold">
                      {k === 'Operator' ? '🔧 Operator' : k === 'Teknisi / Analis' ? '⚙️ Teknisi / Analis' : '🎓 Ahli'}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {k === 'Operator' ? 'KKNI Level 1-3 — pelaksana pekerjaan lapangan' :
                       k === 'Teknisi / Analis' ? 'KKNI Level 4-5 — teknisi spesialisasi' :
                       'KKNI Level 6-9 — ahli, madya, utama'}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3 mt-4">
                <button onClick={() => setStep(2)} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-all">
                  ← Kembali
                </button>
                <button
                  disabled={!kualifikasi || saving}
                  onClick={handleSave}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all"
                >
                  {saving ? '⏳ Menyimpan...' : '✅ Simpan & Mulai'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 pb-4 text-center">
          <p className="text-slate-500 text-xs">Anda dapat mengubah pilihan ini kapan saja di halaman Profil</p>
        </div>
      </div>
    </div>
  );
}
