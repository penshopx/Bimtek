'use client';

import { useState } from 'react';
import Link from 'next/link';

// ─── Data ─────────────────────────────────────────────────────────────────────

const levelOptions = [
  { value: '2', label: 'Level 2 — Pelaksana Muda', group: 'Teknisi / Juru' },
  { value: '3', label: 'Level 3 — Pelaksana Madya', group: 'Teknisi / Juru' },
  { value: '4', label: 'Level 4 — Pelaksana Utama / Teknisi', group: 'Teknisi / Juru' },
  { value: '5', label: 'Level 5 — Analis / Teknisi Senior', group: 'Analis / Teknisi' },
  { value: '6', label: 'Level 6 — Ahli Muda', group: 'Ahli' },
  { value: '7', label: 'Level 7 — Ahli Madya', group: 'Ahli' },
  { value: '8', label: 'Level 8 — Ahli Utama', group: 'Ahli' },
  { value: '9', label: 'Level 9 — Ahli Utama Senior / Spesialis', group: 'Ahli' },
];

const bidangOptions = [
  { value: 'sipil', label: 'Sipil (Jalan, Jembatan, Bangunan Gedung)' },
  { value: 'mp', label: 'Manajemen Pelaksanaan Konstruksi' },
  { value: 'mekanikal', label: 'Mekanikal & Elektrikal' },
  { value: 'k3', label: 'K3 Konstruksi' },
  { value: 'lingkungan', label: 'Lingkungan & Geoteknik' },
];

const wilayahOptions = [
  { value: 'besar', label: 'Kota Besar (Jakarta, Surabaya, Bandung, Medan)', multiplier: 1.0 },
  { value: 'menengah', label: 'Kota Menengah (Semarang, Makassar, Palembang, dll)', multiplier: 0.85 },
  { value: 'kecil', label: 'Kota Kecil / Kabupaten', multiplier: 0.72 },
];

// Cost data per level [min, max] in thousands IDR
const biayaAsesmen: Record<string, [number, number]> = {
  '2': [800, 1500],
  '3': [1000, 1800],
  '4': [1500, 2500],
  '5': [1800, 3000],
  '6': [2500, 4000],
  '7': [3000, 5000],
  '8': [4500, 7000],
  '9': [6000, 10000],
};

const biayaPelatihan: Record<string, [number, number]> = {
  '2': [1500, 3500],
  '3': [2500, 5000],
  '4': [4000, 8000],
  '5': [6000, 12000],
  '6': [8000, 18000],
  '7': [15000, 28000],
  '8': [25000, 45000],
  '9': [35000, 60000],
};

const biayaTransportasi: Record<string, [number, number]> = {
  besar: [150, 500],
  menengah: [100, 300],
  kecil: [50, 200],
};

const DOKUMEN_MIN = 250;  // ribuan
const DOKUMEN_MAX = 450;
const TUK_MIN = 200;
const TUK_MAX = 500;

const fmt = (n: number) => {
  if (n >= 1000) return `Rp ${(n / 1000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`;
  return `Rp ${n.toLocaleString('id-ID')} rb`;
};

const fmtFull = (n: number) =>
  `Rp ${(n * 1000).toLocaleString('id-ID')}`;

type Range = { min: number; max: number };

function calcRange(min: number, max: number, multiplier: number): Range {
  return { min: Math.round(min * multiplier), max: Math.round(max * multiplier) };
}

// ─── UI atoms ─────────────────────────────────────────────────────────────────

function Select({
  label, value, onChange, options, disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-3 py-2.5 bg-slate-700/60 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">— Pilih —</option>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        onClick={() => onChange(!checked)}
        className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${checked ? 'bg-amber-500' : 'bg-slate-600'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </div>
      <span className="text-sm text-slate-300">{label}</span>
    </label>
  );
}

function RangeBar({ label, range, color, total }: { label: string; range: Range; color: string; total: number }) {
  const pct = total > 0 ? Math.round(((range.min + range.max) / 2 / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="text-white font-medium">{fmt(range.min)} – {fmt(range.max)}</span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(pct, 4)}%` }} />
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function BiayaSKKPage() {
  const [level, setLevel] = useState('');
  const [bidang, setBidang] = useState('');
  const [wilayah, setWilayah] = useState('');
  const [sudahPelatihan, setSudahPelatihan] = useState(false);
  const [perpanjangan, setPerpanjangan] = useState(false);

  const ready = level && bidang && wilayah;
  const w = wilayahOptions.find(o => o.value === wilayah);
  const multiplier = w?.multiplier ?? 1;

  // Cost ranges
  const asesmen = ready ? calcRange(...biayaAsesmen[level], multiplier) : null;
  const pelatihan = ready && !sudahPelatihan ? calcRange(...biayaPelatihan[level], multiplier) : null;
  const transport = ready ? calcRange(...biayaTransportasi[wilayah], 1) : null;
  const dokumen = ready ? calcRange(DOKUMEN_MIN, DOKUMEN_MAX, 1) : null;
  const tuk = ready ? calcRange(TUK_MIN, TUK_MAX, multiplier) : null;

  // Totals
  const totalMin = ready
    ? (asesmen!.min + (pelatihan?.min ?? 0) + transport!.min + dokumen!.min + tuk!.min)
    : 0;
  const totalMax = ready
    ? (asesmen!.max + (pelatihan?.max ?? 0) + transport!.max + dokumen!.max + tuk!.max)
    : 0;

  // Perpanjangan discount
  const surchargeNote = perpanjangan
    ? '⚠️ Perpanjangan SKK: biaya asesmen umumnya 60–80% dari biaya sertifikasi baru.'
    : null;

  const levelLabel = levelOptions.find(o => o.value === level)?.label ?? '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-10 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/20 text-amber-400 rounded-full text-sm font-medium mb-4">
            💰 Estimasi Biaya SKK 2025
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Kalkulator <span className="text-amber-400">Biaya SKK</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Perkiraan total biaya sertifikasi SKK berdasarkan jabatan, level, dan wilayah — dari pelatihan hingga biaya asesmen LSP.
          </p>
        </div>

        <div className="grid gap-6">

          {/* Form */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 space-y-5">
            <h2 className="text-white font-semibold text-lg">📋 Data Sertifikasi</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <Select
                label="Level / Jenjang SKK"
                value={level}
                onChange={setLevel}
                options={levelOptions}
              />
              <Select
                label="Bidang Keahlian"
                value={bidang}
                onChange={setBidang}
                options={bidangOptions}
              />
              <div className="sm:col-span-2">
                <Select
                  label="Wilayah / Kota"
                  value={wilayah}
                  onChange={setWilayah}
                  options={wilayahOptions}
                />
              </div>
            </div>

            <div className="border-t border-slate-700 pt-4 space-y-3">
              <p className="text-sm text-slate-400 font-medium">Kondisi Saat Ini</p>
              <Toggle
                label="Saya sudah punya sertifikat pelatihan / bimtek untuk jabatan ini"
                checked={sudahPelatihan}
                onChange={setSudahPelatihan}
              />
              <Toggle
                label="Ini untuk perpanjangan SKK (bukan sertifikasi baru)"
                checked={perpanjangan}
                onChange={setPerpanjangan}
              />
            </div>
          </div>

          {/* Result */}
          {ready && asesmen ? (
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 space-y-6">
              <div>
                <h2 className="text-white font-semibold text-lg mb-0.5">📊 Estimasi Biaya</h2>
                <p className="text-slate-400 text-sm">{levelLabel} · {w?.label.split('(')[0].trim()}</p>
              </div>

              {/* Grand total */}
              <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 rounded-xl p-5 text-center">
                <p className="text-slate-300 text-sm mb-1">Estimasi Total</p>
                <p className="text-3xl font-bold text-amber-400">
                  {fmt(totalMin)} – {fmt(totalMax)}
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  {fmtFull(totalMin)} – {fmtFull(totalMax)}
                </p>
              </div>

              {/* Breakdown */}
              <div className="space-y-3">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Rincian Komponen</p>

                {pelatihan && (
                  <RangeBar label="🎓 Pelatihan / Bimtek Pra-Sertifikasi" range={pelatihan} color="bg-blue-500" total={totalMax} />
                )}
                <RangeBar label="🏛️ Biaya Asesmen LSP" range={asesmen} color="bg-amber-500" total={totalMax} />
                <RangeBar label="📍 Biaya Fasilitasi TUK" range={tuk!} color="bg-purple-500" total={totalMax} />
                <RangeBar label="📄 Persiapan Dokumen (fotokopi, foto, materai, jilid)" range={dokumen!} color="bg-green-500" total={totalMax} />
                <RangeBar label="🚗 Transportasi ke TUK" range={transport!} color="bg-cyan-500" total={totalMax} />
              </div>

              {/* Discount note */}
              {sudahPelatihan && (
                <div className="flex gap-3 bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                  <span className="text-green-400 text-lg flex-shrink-0">✅</span>
                  <p className="text-green-300 text-sm">Biaya pelatihan tidak dihitung karena Anda sudah memiliki sertifikat pelatihan yang valid.</p>
                </div>
              )}
              {surchargeNote && (
                <div className="flex gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                  <span className="text-yellow-400 text-lg flex-shrink-0">⚠️</span>
                  <p className="text-yellow-300 text-sm">{surchargeNote} Estimasi di atas belum menyesuaikan diskon perpanjangan.</p>
                </div>
              )}

              {/* Detail table */}
              <div className="border border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-900/50">
                    <tr>
                      <th className="text-left px-4 py-2.5 text-slate-400 font-medium">Komponen</th>
                      <th className="text-right px-4 py-2.5 text-slate-400 font-medium">Min</th>
                      <th className="text-right px-4 py-2.5 text-slate-400 font-medium">Maks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {pelatihan && (
                      <tr>
                        <td className="px-4 py-2.5 text-slate-300">Pelatihan / Bimtek</td>
                        <td className="px-4 py-2.5 text-right text-white">{fmt(pelatihan.min)}</td>
                        <td className="px-4 py-2.5 text-right text-white">{fmt(pelatihan.max)}</td>
                      </tr>
                    )}
                    <tr>
                      <td className="px-4 py-2.5 text-slate-300">Biaya Asesmen LSP</td>
                      <td className="px-4 py-2.5 text-right text-white">{fmt(asesmen.min)}</td>
                      <td className="px-4 py-2.5 text-right text-white">{fmt(asesmen.max)}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 text-slate-300">Fasilitasi TUK</td>
                      <td className="px-4 py-2.5 text-right text-white">{fmt(tuk!.min)}</td>
                      <td className="px-4 py-2.5 text-right text-white">{fmt(tuk!.max)}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 text-slate-300">Persiapan Dokumen</td>
                      <td className="px-4 py-2.5 text-right text-white">{fmt(dokumen!.min)}</td>
                      <td className="px-4 py-2.5 text-right text-white">{fmt(dokumen!.max)}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 text-slate-300">Transportasi</td>
                      <td className="px-4 py-2.5 text-right text-white">{fmt(transport!.min)}</td>
                      <td className="px-4 py-2.5 text-right text-white">{fmt(transport!.max)}</td>
                    </tr>
                    <tr className="bg-amber-500/10 font-semibold">
                      <td className="px-4 py-3 text-amber-400">TOTAL ESTIMASI</td>
                      <td className="px-4 py-3 text-right text-amber-400">{fmt(totalMin)}</td>
                      <td className="px-4 py-3 text-right text-amber-400">{fmt(totalMax)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Disclaimer */}
              <p className="text-slate-500 text-xs">
                * Estimasi berdasarkan tarif LSP rata-rata nasional 2024–2025. Biaya aktual dapat berbeda tergantung LSP, TUK, dan kebijakan perusahaan. Cek langsung ke LSP yang ditunjuk BNSP untuk tarif resmi.
              </p>
            </div>
          ) : (
            <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-10 text-center text-slate-500">
              <div className="text-4xl mb-3">💰</div>
              <p>Lengkapi data di atas untuk melihat estimasi biaya</p>
            </div>
          )}

          {/* Tips */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 space-y-4">
            <h2 className="text-white font-semibold text-lg">💡 Tips Hemat Biaya SKK</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { icon: '🏢', title: 'Minta Subsidi Perusahaan', desc: 'Perusahaan BUJK wajib memiliki personil bersertifikasi. Minta employer menanggung biaya pelatihan & asesmen.' },
                { icon: '📦', title: 'Daftar Paket LSP', desc: 'Banyak LSP menawarkan paket bundling: pelatihan + asesmen + TUK dengan harga lebih hemat 20–30%.' },
                { icon: '🤝', title: 'Daftar Kolektif', desc: 'Biaya transportasi dan TUK bisa dibagi jika mendaftar bersama rekan satu perusahaan.' },
                { icon: '📅', title: 'Manfaatkan BIMTEK Gratis', desc: 'Kementerian PUPR dan Pemda sering menyelenggarakan pelatihan pra-sertifikasi bersubsidi.' },
                { icon: '📋', title: 'Siapkan Dokumen Sendiri', desc: 'Isi sendiri FR.APL.01 dan APL.02 menggunakan panduan AI di platform ini untuk hemat biaya jasa konsultan.' },
                { icon: '⏰', title: 'Perpanjang Sebelum Expired', desc: 'Biaya surveillance (18/36 bulan) lebih murah dari re-sertifikasi dari nol setelah SKK expired.' },
              ].map(t => (
                <div key={t.title} className="flex gap-3 p-4 bg-slate-700/40 rounded-xl">
                  <span className="text-2xl flex-shrink-0">{t.icon}</span>
                  <div>
                    <p className="text-white text-sm font-medium mb-0.5">{t.title}</p>
                    <p className="text-slate-400 text-xs">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA row */}
          <div className="grid sm:grid-cols-3 gap-3">
            <Link href="/sertifikasi" className="flex items-center gap-2 p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl hover:border-amber-500/40 transition-colors">
              <span className="text-xl">📋</span>
              <div>
                <p className="text-white text-sm font-medium">Cari Jabatan SKK</p>
                <p className="text-slate-500 text-xs">67+ jabatan dengan syarat</p>
              </div>
            </Link>
            <Link href="/diagnostik-kompetensi" className="flex items-center gap-2 p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl hover:border-amber-500/40 transition-colors">
              <span className="text-xl">🧠</span>
              <div>
                <p className="text-white text-sm font-medium">Diagnostik Kompetensi</p>
                <p className="text-slate-500 text-xs">Cek kelayakan SKK Anda</p>
              </div>
            </Link>
            <Link href="/pantau-skk" className="flex items-center gap-2 p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl hover:border-amber-500/40 transition-colors">
              <span className="text-xl">🗓️</span>
              <div>
                <p className="text-white text-sm font-medium">Pantau SKK</p>
                <p className="text-slate-500 text-xs">Tracker masa berlaku SKK</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
