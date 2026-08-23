'use client';

import { useState } from 'react';

// ─── Tool registry ────────────────────────────────────────────────────────────

const allTools = [
  { id: 'rab',     icon: '📊', name: 'Kalkulator RAB',          desc: 'Rencana Anggaran Biaya proyek dengan overhead, profit, dan pajak',    tag: 'Kalkulator' },
  { id: 'mix',     icon: '🧱', name: 'Mix Design Beton',         desc: 'Campuran beton per m³ metode SNI 7656:2012 / ACI 211',               tag: 'Kalkulator' },
  { id: 'tulangan',icon: '🔩', name: 'Kalkulator Tulangan',      desc: 'Kebutuhan berat besi tulangan berdasarkan diameter, jarak & panjang', tag: 'Kalkulator' },
  { id: 'gonogo',  icon: '✅', name: 'Go/No-Go Tender',          desc: 'Checklist kelayakan administrasi & teknis sebelum submit penawaran',  tag: 'Checklist'  },
  { id: 'k3',      icon: '🦺', name: 'Checklist K3 AI',          desc: 'Generate checklist K3 otomatis per tipe proyek dan fase pekerjaan',   tag: 'AI'         },
  { id: 'metode',  icon: '📋', name: 'Metode Pelaksanaan AI',    desc: 'Draft metode pelaksanaan pekerjaan otomatis berbasis SKKNI/SNI',     tag: 'AI'         },
  { id: 'risiko',  icon: '⚠️', name: 'Risk Register AI',         desc: 'Generate matriks risiko proyek dengan mitigasi per tipe pekerjaan',  tag: 'AI'         },
  { id: 'progres', icon: '📈', name: 'Laporan Progres AI',       desc: 'Buat laporan progres proyek ringkas siap kirim ke owner/manajemen',  tag: 'AI'         },
];

const tagColor: Record<string, string> = {
  Kalkulator: 'bg-blue-500/20 text-blue-400',
  Checklist:  'bg-green-500/20 text-green-400',
  AI:         'bg-amber-500/20 text-amber-400',
};

// ─── Shared helpers ───────────────────────────────────────────────────────────

const fmt = (n: number) => n.toLocaleString('id-ID');

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">{title}</h3>
      {children}
    </div>
  );
}

function ResultBox({ children }: { children: React.ReactNode }) {
  return <div className="mt-5 p-4 bg-slate-900/60 border border-slate-700 rounded-xl space-y-2">{children}</div>;
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between text-sm ${bold ? 'font-bold text-white border-t border-slate-700 pt-2' : 'text-slate-300'}`}>
      <span>{label}</span><span>{value}</span>
    </div>
  );
}

// ─── 1. RAB Calculator ────────────────────────────────────────────────────────

function RABCalculator() {
  const [items, setItems] = useState([{ name: '', volume: 0, unitPrice: 0 }]);
  const [overhead, setOverhead] = useState(15);
  const [profit, setProfit] = useState(10);
  const [tax, setTax] = useState(11);

  const update = (i: number, f: string, v: any) => {
    const n = [...items]; (n[i] as any)[f] = v; setItems(n);
  };

  const subtotal = items.reduce((s, it) => s + it.volume * it.unitPrice, 0);
  const oh = subtotal * overhead / 100;
  const pf = (subtotal + oh) * profit / 100;
  const bt = subtotal + oh + pf;
  const tx = bt * tax / 100;
  const total = bt + tx;

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-slate-400 border-b border-slate-700">
            <th className="text-left pb-2">Pekerjaan</th>
            <th className="text-left pb-2 w-28">Volume</th>
            <th className="text-left pb-2 w-36">Harga Satuan</th>
            <th className="text-left pb-2 w-32">Jumlah</th>
            <th className="w-8"/>
          </tr></thead>
          <tbody>{items.map((it, i) => (
            <tr key={i} className="border-b border-slate-800">
              <td className="py-1.5 pr-2"><input type="text" value={it.name} onChange={e => update(i,'name',e.target.value)} placeholder="Nama pekerjaan" className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white text-sm outline-none focus:border-amber-500"/></td>
              <td className="py-1.5 pr-2"><input type="number" value={it.volume} onChange={e => update(i,'volume',+e.target.value)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white text-sm outline-none focus:border-amber-500"/></td>
              <td className="py-1.5 pr-2"><input type="number" value={it.unitPrice} onChange={e => update(i,'unitPrice',+e.target.value)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white text-sm outline-none focus:border-amber-500"/></td>
              <td className="py-1.5 text-amber-400 font-medium text-sm">Rp {fmt(it.volume * it.unitPrice)}</td>
              <td className="py-1.5"><button onClick={() => setItems(items.filter((_,j)=>j!==i))} className="text-slate-600 hover:text-red-400 text-sm">✕</button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <button onClick={() => setItems([...items,{name:'',volume:0,unitPrice:0}])} className="text-sm text-amber-400 hover:text-amber-300">+ Tambah Item</button>

      <div className="grid grid-cols-3 gap-3">
        {[['Overhead (%)', overhead, setOverhead],['Profit (%)', profit, setProfit],['Pajak (%)', tax, setTax]].map(([l,v,fn]:any) => (
          <div key={l}><label className="block text-slate-400 text-xs mb-1">{l}</label>
          <input type="number" value={v} onChange={e=>fn(+e.target.value)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white text-sm outline-none focus:border-amber-500"/></div>
        ))}
      </div>

      <ResultBox>
        <Row label="Subtotal" value={`Rp ${fmt(subtotal)}`}/>
        <Row label={`Overhead (${overhead}%)`} value={`Rp ${fmt(oh)}`}/>
        <Row label={`Profit (${profit}%)`} value={`Rp ${fmt(pf)}`}/>
        <Row label={`Pajak PPN (${tax}%)`} value={`Rp ${fmt(tx)}`}/>
        <Row label="TOTAL" value={`Rp ${fmt(total)}`} bold/>
      </ResultBox>
    </div>
  );
}

// ─── 2. Mix Design ────────────────────────────────────────────────────────────

function MixDesignCalculator() {
  const [fc, setFc] = useState(25);
  const [slump, setSlump] = useState(120);
  const [result, setResult] = useState<any>(null);

  const calc = () => {
    let wc = fc<=20?0.60:fc<=25?0.55:fc<=30?0.50:fc<=40?0.45:0.40;
    if (slump > 100) wc -= 0.03;
    const cement = 325 + Math.max(0,(fc-25)*4);
    const water = cement * wc;
    const FA = (1000 - water - cement/3.15 - cement*0.5) * 0.45;
    const CA = 1000 - water - cement/3.15 - FA;
    setResult({ wc:wc.toFixed(2), cement:Math.round(cement), water:Math.round(water), FA:Math.round(FA), CA:Math.round(CA) });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[['Kuat Tekan fc (MPa)', fc, setFc],['Slump (mm)', slump, setSlump]].map(([l,v,fn]:any) => (
          <div key={l}><label className="block text-slate-400 text-xs mb-1">{l}</label>
          <input type="number" value={v} onChange={e=>fn(+e.target.value)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white outline-none focus:border-amber-500"/></div>
        ))}
      </div>
      <button onClick={calc} className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors">Hitung Mix Design</button>
      {result && (
        <ResultBox>
          <div className="grid grid-cols-5 gap-2 text-center">
            {[['Semen','cement','kg','text-white'],['Air','water','liter','text-blue-400'],['Pasir','FA','kg','text-amber-400'],['Batu Pecah','CA','kg','text-slate-300'],['W/C','wc','','text-green-400']].map(([l,k,u,c]:any)=>(
              <div key={l} className="bg-slate-700/50 rounded-lg p-2">
                <div className="text-slate-400 text-xs mb-1">{l}</div>
                <div className={`text-lg font-bold ${c}`}>{result[k]}</div>
                {u && <div className="text-slate-500 text-xs">{u}</div>}
              </div>
            ))}
          </div>
          <p className="text-amber-400 text-xs mt-2">⚠️ Estimasi — sesuaikan dengan trial mix di lapangan (SNI 7656:2012)</p>
        </ResultBox>
      )}
    </div>
  );
}

// ─── 3. Tulangan Calculator ────────────────────────────────────────────────────

function TulanganCalculator() {
  const [dia, setDia] = useState(12);
  const [jarak, setJarak] = useState(150);
  const [panjang, setPanjang] = useState(6);
  const [lebar, setLebar] = useState(1);
  const [harga, setHarga] = useState(15000);
  const [result, setResult] = useState<any>(null);

  const beratPerM: Record<number,number> = {6:0.222,8:0.395,10:0.617,12:0.888,13:1.042,16:1.578,19:2.226,22:2.984,25:3.853,32:6.313};

  const calc = () => {
    const bpm = beratPerM[dia] ?? (Math.PI/4 * (dia/1000)**2 * 7850);
    const jmlBatang = Math.ceil((lebar * 1000) / jarak) + 1;
    const totalPanjang = jmlBatang * panjang;
    const berat = totalPanjang * bpm;
    const biaya = berat * harga;
    setResult({ jmlBatang, totalPanjang: totalPanjang.toFixed(1), berat: berat.toFixed(1), biaya: Math.round(biaya), bpm: bpm.toFixed(3) });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-slate-400 text-xs mb-1">Diameter (mm)</label>
          <select value={dia} onChange={e=>setDia(+e.target.value)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white outline-none focus:border-amber-500">
            {[6,8,10,12,13,16,19,22,25,32].map(d=><option key={d} value={d}>D{d}</option>)}
          </select>
        </div>
        {[['Jarak (mm)',jarak,setJarak],['Panjang batang (m)',panjang,setPanjang],['Lebar bidang (m)',lebar,setLebar],['Harga/kg (Rp)',harga,setHarga]].map(([l,v,fn]:any)=>(
          <div key={l}><label className="block text-slate-400 text-xs mb-1">{l}</label>
          <input type="number" value={v} onChange={e=>fn(+e.target.value)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white outline-none focus:border-amber-500"/></div>
        ))}
      </div>
      <button onClick={calc} className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors">Hitung Tulangan</button>
      {result && (
        <ResultBox>
          <Row label={`Berat per m (D${dia})`} value={`${result.bpm} kg/m`}/>
          <Row label="Jumlah batang" value={`${result.jmlBatang} batang`}/>
          <Row label="Total panjang" value={`${result.totalPanjang} m`}/>
          <Row label="Total berat" value={`${result.berat} kg`}/>
          <Row label="Estimasi biaya" value={`Rp ${fmt(result.biaya)}`} bold/>
        </ResultBox>
      )}
    </div>
  );
}

// ─── 4. Go/No-Go Tender ───────────────────────────────────────────────────────

const gonogoItems = [
  { cat: '📁 Dokumen Administrasi', items: ['Akta pendirian + perubahannya tersedia','NIB/SIUJK masih berlaku','NPWP perusahaan aktif','SKT/SBU sesuai subklasifikasi proyek','PKP aktif (jika nilai tender > Rp 4,8M)','Rekening koran 3 bulan terakhir tersedia','Neraca keuangan 2 tahun terakhir ada'] },
  { cat: '🏗️ Teknis & Kompetensi', items: ['SKK personil kunci (PJBU, PJT) aktif dan tidak expired','Pengalaman sejenis ≥ 1 proyek terdokumentasi','Peralatan utama tersedia atau dapat disewa','Metode pelaksanaan bisa disusun','Tenaga ahli/terampil tersedia','Kapasitas produksi/pelaksanaan cukup'] },
  { cat: '🦺 K3 & Lingkungan', items: ['Rencana K3 Konstruksi bisa disusun','Ahli K3 Konstruksi tersedia','AMDAL/UKL-UPL sesuai jika dipersyaratkan','APD dan SOP keselamatan sudah ada'] },
  { cat: '💰 Keuangan & Risiko', items: ['Modal kerja cukup untuk 2 bulan pelaksanaan','Cashflow positif 3 bulan terakhir','Tidak ada proyek lain yang menyerap kapasitas penuh','Margin keuntungan minimal 5% setelah overhead & pajak','Tidak ada sengketa/gugatan aktif pada perusahaan'] },
];

function GoNoGoTool() {
  const [checked, setChecked] = useState<Record<string,boolean>>({});
  const toggle = (k: string) => setChecked(p => ({ ...p, [k]: !p[k] }));

  const total = gonogoItems.reduce((s,c) => s + c.items.length, 0);
  const done = Object.values(checked).filter(Boolean).length;
  const pct = Math.round((done / total) * 100);
  const verdict = pct >= 90 ? { text: '✅ GO — Siap Submit', color: 'text-green-400', bg: 'bg-green-500/20 border-green-500/40' }
    : pct >= 70 ? { text: '⚠️ CONDITIONAL — Review dulu', color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/40' }
    : { text: '❌ NO-GO — Belum siap', color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/40' };

  return (
    <div className="space-y-5">
      {/* Score bar */}
      <div className={`p-4 rounded-xl border ${verdict.bg}`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`font-bold ${verdict.color}`}>{verdict.text}</span>
          <span className={`text-sm font-semibold ${verdict.color}`}>{done}/{total} ({pct}%)</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full">
          <div className="h-2 rounded-full bg-current transition-all" style={{ width:`${pct}%`, color: pct>=90?'#22c55e':pct>=70?'#f59e0b':'#ef4444' }} />
        </div>
      </div>
      {gonogoItems.map(cat => (
        <div key={cat.cat}>
          <div className="text-slate-300 font-medium text-sm mb-2">{cat.cat}</div>
          <div className="space-y-1.5">
            {cat.items.map(item => (
              <label key={item} className="flex items-start gap-2.5 cursor-pointer group">
                <input type="checkbox" checked={!!checked[item]} onChange={() => toggle(item)}
                  className="mt-0.5 w-4 h-4 rounded accent-amber-500 shrink-0"/>
                <span className={`text-sm transition-colors ${checked[item] ? 'text-slate-500 line-through' : 'text-slate-300 group-hover:text-white'}`}>{item}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
      <button onClick={() => setChecked({})} className="text-xs text-slate-500 hover:text-slate-400">Reset checklist</button>
    </div>
  );
}

// ─── 5. K3 Checklist AI ───────────────────────────────────────────────────────

function K3ChecklistTool() {
  const [proyekTipe, setProyekTipe] = useState('');
  const [fase, setFase] = useState('');
  const [lingkup, setLingkup] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const generate = async () => {
    if (!proyekTipe || !fase) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch('/api/tools', { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ action:'k3', proyekTipe, fase, lingkup }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch(e:any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-slate-400 text-xs mb-1">Tipe Proyek *</label>
          <select value={proyekTipe} onChange={e=>setProyekTipe(e.target.value)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white outline-none focus:border-amber-500">
            <option value="">Pilih tipe proyek…</option>
            {['Gedung Bertingkat','Jalan Raya','Jembatan','Irigasi/Bendungan','Instalasi MEP','Renovasi Gedung','Dermaga/Pelabuhan'].map(t=><option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-slate-400 text-xs mb-1">Fase Pekerjaan *</label>
          <select value={fase} onChange={e=>setFase(e.target.value)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white outline-none focus:border-amber-500">
            <option value="">Pilih fase…</option>
            {['Persiapan & Mobilisasi','Pekerjaan Tanah & Pondasi','Struktur Bawah','Struktur Atas','Finishing & Arsitektur','MEP & Utilitas','Demobilisasi'].map(f=><option key={f}>{f}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-slate-400 text-xs mb-1">Lingkup pekerjaan spesifik (opsional)</label>
        <input type="text" value={lingkup} onChange={e=>setLingkup(e.target.value)} placeholder="Contoh: pengecoran kolom lantai 5, pemasangan bekisting"
          className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white outline-none focus:border-amber-500 text-sm"/>
      </div>
      <button onClick={generate} disabled={!proyekTipe||!fase||loading}
        className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-medium transition-colors">
        {loading ? '🧠 AI membuat checklist…' : '🦺 Generate Checklist K3'}
      </button>
      {error && <p className="text-red-400 text-sm">⚠️ {error}</p>}
      {result && (
        <div className="space-y-4">
          {result.kategori?.map((k:any) => (
            <div key={k.nama}>
              <div className="text-amber-400 font-medium text-sm mb-2">📌 {k.nama}</div>
              <ul className="space-y-1">
                {k.items?.map((item:string,i:number) => (
                  <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                    <span className="text-slate-600 mt-0.5">□</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {result.risikoPrioritas?.length > 0 && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="text-red-400 font-medium text-sm mb-1">🔴 Risiko Prioritas</div>
              {result.risikoPrioritas.map((r:string,i:number)=><p key={i} className="text-slate-300 text-sm">• {r}</p>)}
            </div>
          )}
          {result.dokumenWajib?.length > 0 && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="text-blue-400 font-medium text-sm mb-1">📄 Dokumen Wajib K3</div>
              {result.dokumenWajib.map((d:string,i:number)=><p key={i} className="text-slate-300 text-sm">• {d}</p>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── 6. Metode Pelaksanaan AI ─────────────────────────────────────────────────

function MetodePelaksanaanTool() {
  const [namaItem, setNamaItem] = useState('');
  const [tipeStruktur, setTipeStruktur] = useState('');
  const [spesifikasi, setSpesifikasi] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const generate = async () => {
    if (!namaItem) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch('/api/tools', { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ action:'metode', namaItem, tipeStruktur, spesifikasi }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch(e:any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-slate-400 text-xs mb-1">Nama pekerjaan *</label>
        <input type="text" value={namaItem} onChange={e=>setNamaItem(e.target.value)}
          placeholder="Contoh: Pengecoran kolom beton K-300, Pemasangan baja WF, Galian tanah keras"
          className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white outline-none focus:border-amber-500 text-sm"/>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-slate-400 text-xs mb-1">Tipe struktur</label>
          <select value={tipeStruktur} onChange={e=>setTipeStruktur(e.target.value)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white outline-none focus:border-amber-500">
            <option value="">Pilih (opsional)…</option>
            {['Beton Bertulang','Baja','Kayu','Pasangan Bata','Precast','Komposit'].map(t=><option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-slate-400 text-xs mb-1">Spesifikasi / mutu</label>
          <input type="text" value={spesifikasi} onChange={e=>setSpesifikasi(e.target.value)} placeholder="Contoh: fc'25 MPa, slump 10-12cm"
            className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white outline-none focus:border-amber-500 text-sm"/>
        </div>
      </div>
      <button onClick={generate} disabled={!namaItem||loading}
        className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-medium transition-colors">
        {loading ? '🧠 AI menyusun metode…' : '📋 Generate Metode Pelaksanaan'}
      </button>
      {error && <p className="text-red-400 text-sm">⚠️ {error}</p>}
      {result && (
        <div className="space-y-4">
          {result.uraianPekerjaan && <p className="text-slate-300 text-sm bg-slate-700/40 p-3 rounded-lg">{result.uraianPekerjaan}</p>}
          {[
            ['👷 Tenaga Kerja', result.tenagaKerja, 'text-blue-300'],
            ['🔧 Peralatan', result.peralatan, 'text-purple-300'],
            ['🧱 Material', result.material, 'text-amber-300'],
          ].map(([l,arr,c]:any) => arr?.length > 0 && (
            <div key={l}><div className={`font-medium text-sm mb-1 ${c}`}>{l}</div>
            <div className="flex flex-wrap gap-1.5">{arr.map((x:string,i:number)=><span key={i} className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded text-xs">{x}</span>)}</div></div>
          ))}
          {result.langkahPelaksanaan?.length > 0 && (
            <div>
              <div className="text-green-400 font-medium text-sm mb-2">📝 Langkah Pelaksanaan</div>
              <ol className="space-y-1.5">
                {result.langkahPelaksanaan.map((l:string,i:number)=>(
                  <li key={i} className="flex gap-2 text-sm text-slate-300">
                    <span className="w-5 h-5 bg-amber-500/20 text-amber-400 rounded text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">{i+1}</span>
                    <span>{l.replace(/^\d+\.\s*/,'')}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-3">
            {result.qcPoints?.length > 0 && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="text-blue-400 text-sm font-medium mb-1">✅ Quality Control</div>
                {result.qcPoints.map((q:string,i:number)=><p key={i} className="text-slate-300 text-xs">• {q}</p>)}
              </div>
            )}
            {result.k3Points?.length > 0 && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <div className="text-amber-400 text-sm font-medium mb-1">🦺 K3 Points</div>
                {result.k3Points.map((k:string,i:number)=><p key={i} className="text-slate-300 text-xs">• {k}</p>)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 7. Risk Register AI ──────────────────────────────────────────────────────

const levelColor: Record<string,string> = { tinggi:'text-red-400 bg-red-500/20', sedang:'text-amber-400 bg-amber-500/20', rendah:'text-green-400 bg-green-500/20' };

function RisikoTool() {
  const [proyekTipe, setProyekTipe] = useState('');
  const [nilai, setNilai] = useState('');
  const [durasi, setDurasi] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const generate = async () => {
    if (!proyekTipe) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch('/api/tools', { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ action:'risiko', proyekTipe, nilai, durasi }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch(e:any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-slate-400 text-xs mb-1">Tipe Proyek *</label>
          <select value={proyekTipe} onChange={e=>setProyekTipe(e.target.value)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white outline-none focus:border-amber-500">
            <option value="">Pilih…</option>
            {['Gedung','Jalan','Jembatan','Irigasi','MEP','Renovasi'].map(t=><option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-slate-400 text-xs mb-1">Nilai Kontrak</label>
          <input type="text" value={nilai} onChange={e=>setNilai(e.target.value)} placeholder="Contoh: Rp 5 Miliar"
            className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white outline-none focus:border-amber-500 text-sm"/>
        </div>
        <div>
          <label className="block text-slate-400 text-xs mb-1">Durasi</label>
          <input type="text" value={durasi} onChange={e=>setDurasi(e.target.value)} placeholder="Contoh: 8 bulan"
            className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white outline-none focus:border-amber-500 text-sm"/>
        </div>
      </div>
      <button onClick={generate} disabled={!proyekTipe||loading}
        className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-medium transition-colors">
        {loading ? '🧠 AI membuat risk register…' : '⚠️ Generate Risk Register'}
      </button>
      {error && <p className="text-red-400 text-sm">⚠️ {error}</p>}
      {result?.risiko?.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="text-slate-400 border-b border-slate-700">
              {['ID','Uraian','Kategori','Dampak','Prob.','Level','Mitigasi','PIC'].map(h=><th key={h} className="text-left py-2 pr-3">{h}</th>)}
            </tr></thead>
            <tbody>
              {result.risiko.map((r:any) => (
                <tr key={r.id} className="border-b border-slate-800/60">
                  <td className="py-2 pr-3 text-slate-500 font-mono">{r.id}</td>
                  <td className="py-2 pr-3 text-slate-300 max-w-[14rem]">{r.uraian}</td>
                  <td className="py-2 pr-3 text-slate-400">{r.kategori}</td>
                  <td className="py-2 pr-3"><span className={`px-1.5 py-0.5 rounded text-xs ${levelColor[r.dampak]??'text-slate-400'}`}>{r.dampak}</span></td>
                  <td className="py-2 pr-3"><span className={`px-1.5 py-0.5 rounded text-xs ${levelColor[r.probabilitas]??'text-slate-400'}`}>{r.probabilitas}</span></td>
                  <td className="py-2 pr-3"><span className={`px-1.5 py-0.5 rounded text-xs font-bold ${levelColor[r.levelRisiko]??'text-slate-400'}`}>{r.levelRisiko}</span></td>
                  <td className="py-2 pr-3 text-slate-400 max-w-[12rem]">{r.mitigasi}</td>
                  <td className="py-2 text-slate-500">{r.pemilik}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── 8. Laporan Progres AI ────────────────────────────────────────────────────

function ProgresTool() {
  const [namaProyek, setNamaProyek] = useState('');
  const [periode, setPeriode] = useState('');
  const [persen, setPersen] = useState(0);
  const [catatan, setCatatan] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const generate = async () => {
    if (!namaProyek || !periode) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch('/api/tools', { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ action:'progres', namaProyek, periode, persen, catatan }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch(e:any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-slate-400 text-xs mb-1">Nama Proyek *</label>
          <input type="text" value={namaProyek} onChange={e=>setNamaProyek(e.target.value)} placeholder="Contoh: Pembangunan Gedung Kantor 8 Lt"
            className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white outline-none focus:border-amber-500 text-sm"/>
        </div>
        <div>
          <label className="block text-slate-400 text-xs mb-1">Periode laporan *</label>
          <input type="text" value={periode} onChange={e=>setPeriode(e.target.value)} placeholder="Contoh: Minggu ke-8 (12–18 Agustus 2025)"
            className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white outline-none focus:border-amber-500 text-sm"/>
        </div>
      </div>
      <div>
        <label className="block text-slate-400 text-xs mb-1">Progres fisik: <span className="text-amber-400 font-bold">{persen}%</span></label>
        <input type="range" min={0} max={100} value={persen} onChange={e=>setPersen(+e.target.value)} className="w-full accent-amber-500"/>
      </div>
      <div>
        <label className="block text-slate-400 text-xs mb-1">Catatan lapangan (opsional)</label>
        <textarea value={catatan} onChange={e=>setCatatan(e.target.value)} rows={2}
          placeholder="Kendala, pekerjaan yang selesai, pekerjaan berikutnya…"
          className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white outline-none focus:border-amber-500 text-sm resize-none"/>
      </div>
      <button onClick={generate} disabled={!namaProyek||!periode||loading}
        className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-medium transition-colors">
        {loading ? '🧠 AI menyusun laporan…' : '📈 Generate Laporan Progres'}
      </button>
      {error && <p className="text-red-400 text-sm">⚠️ {error}</p>}
      {result && (
        <div className="space-y-3">
          <div className="p-4 bg-slate-700/40 rounded-xl">
            <div className="text-white font-bold mb-1">{result.judulLaporan}</div>
            <p className="text-slate-300 text-sm">{result.ringkasanEksekutif}</p>
          </div>
          {result.pencapaianPeriodeIni?.length > 0 && (
            <div>
              <div className="text-green-400 font-medium text-sm mb-1">✅ Pencapaian Periode Ini</div>
              {result.pencapaianPeriodeIni.map((p:string,i:number)=><p key={i} className="text-slate-300 text-sm">• {p}</p>)}
            </div>
          )}
          {result.kendalaDanSolusi?.length > 0 && (
            <div>
              <div className="text-amber-400 font-medium text-sm mb-1">⚠️ Kendala & Solusi</div>
              {result.kendalaDanSolusi.map((k:any,i:number)=>(
                <div key={i} className="text-sm text-slate-300 mb-1">
                  <span className="text-red-400">Kendala:</span> {k.kendala} → <span className="text-green-400">Solusi:</span> {k.solusi}
                </div>
              ))}
            </div>
          )}
          {result.rencanaMingguDepan?.length > 0 && (
            <div>
              <div className="text-blue-400 font-medium text-sm mb-1">📅 Rencana Minggu Depan</div>
              {result.rencanaMingguDepan.map((r:string,i:number)=><p key={i} className="text-slate-300 text-sm">• {r}</p>)}
            </div>
          )}
          {result.catatanPenting && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-sm">
              📌 {result.catatanPenting}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const toolComponents: Record<string, React.ReactNode> = {
  rab:      <RABCalculator />,
  mix:      <MixDesignCalculator />,
  tulangan: <TulanganCalculator />,
  gonogo:   <GoNoGoTool />,
  k3:       <K3ChecklistTool />,
  metode:   <MetodePelaksanaanTool />,
  risiko:   <RisikoTool />,
  progres:  <ProgresTool />,
};

export default function ToolsPage() {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [filter, setFilter] = useState('Semua');
  const tags = ['Semua', 'Kalkulator', 'Checklist', 'AI'];
  const visible = filter === 'Semua' ? allTools : allTools.filter(t => t.tag === filter);
  const active = allTools.find(t => t.id === activeTool);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">

        {!activeTool ? (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/20 text-amber-400 rounded-full text-sm font-medium mb-4">
                🔧 8 Tools Konstruksi & SKK
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Mini Apps Konstruksi</h1>
              <p className="text-slate-400">Kalkulator, checklist, dan generator dokumen berbasis AI untuk praktik konstruksi sehari-hari</p>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 justify-center mb-6">
              {tags.map(t => (
                <button key={t} onClick={() => setFilter(t)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${filter===t ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'}`}>
                  {t}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {visible.map(tool => (
                <button key={tool.id} onClick={() => setActiveTool(tool.id)}
                  className="bg-slate-800/60 border border-slate-700 hover:border-amber-500/50 hover:bg-slate-800 rounded-2xl p-5 text-left transition-all group">
                  <div className="text-3xl mb-3">{tool.icon}</div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="font-semibold text-white text-sm group-hover:text-amber-400 transition-colors">{tool.name}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${tagColor[tool.tag]}`}>{tool.tag}</span>
                  </div>
                  <div className="text-slate-400 text-xs leading-relaxed">{tool.desc}</div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="max-w-4xl mx-auto">
            <button onClick={() => setActiveTool(null)} className="mb-5 flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors text-sm">
              ← Kembali ke Tools
            </button>
            <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700">
                <span className="text-3xl">{active?.icon}</span>
                <div>
                  <h2 className="text-xl font-bold text-white">{active?.name}</h2>
                  <p className="text-slate-400 text-sm">{active?.desc}</p>
                </div>
                <span className={`ml-auto text-xs px-3 py-1 rounded-full ${tagColor[active?.tag??'']}`}>{active?.tag}</span>
              </div>
              {toolComponents[activeTool]}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
