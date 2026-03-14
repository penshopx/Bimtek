'use client';

import { useState } from 'react';

const solvers = [
  { id: 'beam', title: 'Beam Calculator', icon: '📐', description: 'Hitung momen, shear, dan deflection balok', category: 'Struktur' },
  { id: 'column', title: 'Column Calculator', icon: '🏛️', description: 'Analisis kolom tekan dan kombinasi beban', category: 'Struktur' },
  { id: 'foundation', title: 'Foundation Calculator', icon: '🏗️', description: 'Daya dukung dan dimensi pondasi', category: 'Struktur' },
  { id: 'concrete', title: 'Concrete Mix', icon: '🧱', description: 'Perbandingan campuran beton', category: 'Material' },
  { id: 'earthwork', title: 'Earthwork Volume', icon: '⛏️', description: 'Hitung volume galian dan timbunan', category: 'Proyek' },
  { id: 'ramp', title: 'Ramp Calculator', icon: '↗️', description: 'Perhitungan landai dan tangga', category: 'Arsitektur' },
];

export default function SolverPage() {
  const [selectedSolver, setSelectedSolver] = useState<string | null>(null);

  const renderSolver = () => {
    switch (selectedSolver) {
      case 'beam':
        return <BeamSolver />;
      case 'column':
        return <ColumnSolver />;
      case 'foundation':
        return <FoundationSolver />;
      case 'concrete':
        return <ConcreteMixSolver />;
      case 'earthwork':
        return <EarthworkSolver />;
      case 'ramp':
        return <RampSolver />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">🧮 Solver</h1>
          <p className="text-lg text-slate-600">
            Template perhitungan teknik sipil & manajemen proyek
          </p>
        </div>

        {!selectedSolver ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {solvers.map((solver) => (
              <button
                key={solver.id}
                onClick={() => setSelectedSolver(solver.id)}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-left hover:shadow-lg hover:border-amber-300 transition-all"
              >
                <div className="text-4xl mb-4">{solver.icon}</div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">{solver.title}</h3>
                <p className="text-slate-600">{solver.description}</p>
                <span className="inline-block mt-3 px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
                  {solver.category}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div>
            <button
              onClick={() => setSelectedSolver(null)}
              className="mb-4 text-amber-600 hover:text-amber-700 font-medium"
            >
              ← Kembali ke Solver
            </button>
            {renderSolver()}
          </div>
        )}
      </div>
    </div>
  );
}

function BeamSolver() {
  const [L, setL] = useState(6);
  const [w, setW] = useState(5);
  const [b, setB] = useState(0.3);
  const [h, setH] = useState(0.5);
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
    const I = (b * Math.pow(h, 3)) / 12;
    const Mmax = (w * Math.pow(L, 2)) / 8;
    const Smax = (b * Math.pow(h, 2)) / 6;
    const fv = (1.5 * w * L) / (2 * b * h);
    const deflection = (5 * w * Math.pow(L * 1000, 4)) / (384 * 25000 * I * Math.pow(100, 4));
    
    setResult({
      Mmax: Mmax.toFixed(2),
      fv: fv.toFixed(2),
      deflection: deflection.toFixed(2),
      I: I.toFixed(4),
      Smax: Smax.toFixed(4),
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">📐 Beam Calculator (Simple Beam)</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Panjang (m)</label>
          <input type="number" value={L} onChange={(e) => setL(Number(e.target.value))} className="w-full p-2 border border-slate-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Beban (kN/m)</label>
          <input type="number" value={w} onChange={(e) => setW(Number(e.target.value))} className="w-full p-2 border border-slate-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Lebar (m)</label>
          <input type="number" value={b} onChange={(e) => setB(Number(e.target.value))} className="w-full p-2 border border-slate-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Tinggi (m)</label>
          <input type="number" value={h} onChange={(e) => setH(Number(e.target.value))} className="w-full p-2 border border-slate-300 rounded-lg" />
        </div>
      </div>

      <button onClick={calculate} className="w-full py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 mb-6">
        Hitung
      </button>

      {result && (
        <div className="bg-slate-50 rounded-xl p-4">
          <h3 className="font-semibold text-slate-800 mb-3">Hasil:</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-slate-500">Momen Maksimum:</span> <span className="font-semibold">{result.Mmax} kN.m</span></div>
            <div><span className="text-slate-500">Shear Force:</span> <span className="font-semibold">{result.fv} MPa</span></div>
            <div><span className="text-slate-500">Deflection:</span> <span className="font-semibold">{result.deflection} mm</span></div>
            <div><span className="text-slate-500">Inersia (I):</span> <span className="font-semibold">{result.I} m⁴</span></div>
            <div><span className="text-slate-500">Section Modulus:</span> <span className="font-semibold">{result.Smax} m³</span></div>
          </div>
        </div>
      )}
    </div>
  );
}

function ColumnSolver() {
  const [P, setP] = useState(1000);
  const [b, setB] = useState(0.4);
  const [h, setH] = useState(0.4);
  const [L, setL] = useState(3);
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
    const A = b * h;
    const fc = (P * 1000) / (A * 10000);
    const slenderness = L / Math.min(b, h);
    const criticalLoad = (Math.PI * Math.PI * 200000 * (b * h * Math.pow(h, 3) / 12)) / Math.pow(L * 1000, 2);
    
    setResult({
      fc: fc.toFixed(2),
      slenderness: slenderness.toFixed(2),
      criticalLoad: (criticalLoad / 1000).toFixed(2),
      A: A.toFixed(4),
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">🏛️ Column Calculator</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Beban P (kN)</label>
          <input type="number" value={P} onChange={(e) => setP(Number(e.target.value))} className="w-full p-2 border border-slate-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Lebar b (m)</label>
          <input type="number" value={b} onChange={(e) => setB(Number(e.target.value))} className="w-full p-2 border border-slate-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Tinggi h (m)</label>
          <input type="number" value={h} onChange={(e) => setH(Number(e.target.value))} className="w-full p-2 border border-slate-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Panjang (m)</label>
          <input type="number" value={L} onChange={(e) => setL(Number(e.target.value))} className="w-full p-2 border border-slate-300 rounded-lg" />
        </div>
      </div>

      <button onClick={calculate} className="w-full py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 mb-6">
        Hitung
      </button>

      {result && (
        <div className="bg-slate-50 rounded-xl p-4">
          <h3 className="font-semibold text-slate-800 mb-3">Hasil:</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-slate-500">Tegangan:</span> <span className="font-semibold">{result.fc} MPa</span></div>
            <div><span className="text-slate-500">Slenderness:</span> <span className="font-semibold">{result.slenderness}</span></div>
            <div><span className="text-slate-500">Luas Penampang:</span> <span className="font-semibold">{result.A} m²</span></div>
            <div><span className="text-slate-500">Beban Kritis:</span> <span className="font-semibold">{result.criticalLoad} kN</span></div>
          </div>
        </div>
      )}
    </div>
  );
}

function FoundationSolver() {
  const [P, setP] = useState(500);
  const [q, setQ] = useState(150);
  const [FS, setFS] = useState(3);
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
    const qult = q * FS;
    const A = (P * 1000) / qult;
    const side = Math.sqrt(A);
    
    setResult({
      qult: qult,
      A: A.toFixed(3),
      side: side.toFixed(2),
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">🏗️ Foundation Calculator</h2>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Beban (kN)</label>
          <input type="number" value={P} onChange={(e) => setP(Number(e.target.value))} className="w-full p-2 border border-slate-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Daya Dukung (kN/m²)</label>
          <input type="number" value={q} onChange={(e) => setQ(Number(e.target.value))} className="w-full p-2 border border-slate-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Faktor Keamanan</label>
          <input type="number" value={FS} onChange={(e) => setFS(Number(e.target.value))} className="w-full p-2 border border-slate-300 rounded-lg" />
        </div>
      </div>

      <button onClick={calculate} className="w-full py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 mb-6">
        Hitung
      </button>

      {result && (
        <div className="bg-slate-50 rounded-xl p-4">
          <h3 className="font-semibold text-slate-800 mb-3">Hasil:</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div><span className="text-slate-500">qu izin:</span> <span className="font-semibold">{result.qult} kN/m²</span></div>
            <div><span className="text-slate-500">Luas:</span> <span className="font-semibold">{result.A} m²</span></div>
            <div><span className="text-slate-500">Sisi:</span> <span className="font-semibold">{result.side} m</span></div>
          </div>
        </div>
      )}
    </div>
  );
}

function ConcreteMixSolver() {
  const [fc, setFc] = useState(25);
  const [slump, setSlump] = useState(100);
  const [aggMax, setAggMax] = useState(20);
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
    const wc = 0.55 - (0.008 * (fc - 25));
    const cement = 325 + (fc - 25) * 3;
    const water = cement * wc;
    const fineAgg = 0.45 * (1000 - water - cement / 3.15);
    const coarseAgg = 1000 - water - cement / 3.15 - fineAgg;
    
    setResult({
      wc: wc.toFixed(2),
      cement: Math.round(cement),
      water: Math.round(water),
      fineAgg: Math.round(fineAgg),
      coarseAgg: Math.round(coarseAgg),
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">🧱 Concrete Mix Design</h2>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Kuat Tekan (MPa)</label>
          <input type="number" value={fc} onChange={(e) => setFc(Number(e.target.value))} className="w-full p-2 border border-slate-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Slump (mm)</label>
          <input type="number" value={slump} onChange={(e) => setSlump(Number(e.target.value))} className="w-full p-2 border border-slate-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Agregat Max (mm)</label>
          <input type="number" value={aggMax} onChange={(e) => setAggMax(Number(e.target.value))} className="w-full p-2 border border-slate-300 rounded-lg" />
        </div>
      </div>

      <button onClick={calculate} className="w-full py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 mb-6">
        Hitung Mix Design
      </button>

      {result && (
        <div className="bg-slate-50 rounded-xl p-4">
          <h3 className="font-semibold text-slate-800 mb-3">Perbandingan per m³:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div><span className="text-slate-500">Semen:</span> <span className="font-semibold">{result.cement} kg</span></div>
            <div><span className="text-slate-500">Air:</span> <span className="font-semibold">{result.water} liter</span></div>
            <div><span className="text-slate-500">W/C:</span> <span className="font-semibold">{result.wc}</span></div>
            <div><span className="text-slate-500">Pasir:</span> <span className="font-semibold">{result.fineAgg} kg</span></div>
            <div><span className="text-slate-500">Batu pecah:</span> <span className="font-semibold">{result.coarseAgg} kg</span></div>
          </div>
        </div>
      )}
    </div>
  );
}

function EarthworkSolver() {
  const [A1, setA1] = useState(100);
  const [A2, setA2] = useState(150);
  const [d, setD] = useState(2);
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
    const V = ((A1 + A2) / 2) * d;
    const cut = A1 * d * 1/3;
    const fill = A2 * d * 2/3;
    
    setResult({
      V: V.toFixed(2),
      cut: cut.toFixed(2),
      fill: fill.toFixed(2),
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">⛏️ Earthwork Volume (Average End Area)</h2>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Luas Awal (m²)</label>
          <input type="number" value={A1} onChange={(e) => setA1(Number(e.target.value))} className="w-full p-2 border border-slate-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Luas Akhir (m²)</label>
          <input type="number" value={A2} onChange={(e) => setA2(Number(e.target.value))} className="w-full p-2 border border-slate-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Jarak (m)</label>
          <input type="number" value={d} onChange={(e) => setD(Number(e.target.value))} className="w-full p-2 border border-slate-300 rounded-lg" />
        </div>
      </div>

      <button onClick={calculate} className="w-full py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 mb-6">
        Hitung Volume
      </button>

      {result && (
        <div className="bg-slate-50 rounded-xl p-4">
          <h3 className="font-semibold text-slate-800 mb-3">Hasil:</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div><span className="text-slate-500">Volume Total:</span> <span className="font-semibold">{result.V} m³</span></div>
            <div><span className="text-slate-500">Galian:</span> <span className="font-semibold">{result.cut} m³</span></div>
            <div><span className="text-slate-500">Timbunan:</span> <span className="font-semibold">{result.fill} m³</span></div>
          </div>
        </div>
      )}
    </div>
  );
}

function RampSolver() {
  const [H, setH] = useState(3);
  const [L, setL] = useState(30);
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
    const slope = (H / L) * 100;
    const angle = Math.atan(H / L) * (180 / Math.PI);
    const r = L / H;
    
    setResult({
      slope: slope.toFixed(2),
      angle: angle.toFixed(1),
      r: r.toFixed(1),
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">↗️ Ramp Calculator</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Ketinggian (m)</label>
          <input type="number" value={H} onChange={(e) => setH(Number(e.target.value))} className="w-full p-2 border border-slate-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Panjang Horizontal (m)</label>
          <input type="number" value={L} onChange={(e) => setL(Number(e.target.value))} className="w-full p-2 border border-slate-300 rounded-lg" />
        </div>
      </div>

      <button onClick={calculate} className="w-full py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 mb-6">
        Hitung
      </button>

      {result && (
        <div className="bg-slate-50 rounded-xl p-4">
          <h3 className="font-semibold text-slate-800 mb-3">Hasil:</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div><span className="text-slate-500">Kemiringan:</span> <span className="font-semibold">{result.slope}%</span></div>
            <div><span className="text-slate-500">Sudut:</span> <span className="font-semibold">{result.angle}°</span></div>
            <div><span className="text-slate-500">Rasio:</span> <span className="font-semibold">1:{result.r}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}
