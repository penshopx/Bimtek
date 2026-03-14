'use client';

import { useState } from 'react';

export default function ToolsPage() {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">🔧 Tools</h1>
          <p className="text-lg text-slate-600">
            Kalkulator untuk perencanaan proyek konstruksi
          </p>
        </div>

        {!activeTool ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setActiveTool('rab')}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-left hover:shadow-lg hover:border-amber-300 transition-all"
            >
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-2xl font-semibold text-slate-800 mb-2">Kalkulator RAB</h3>
              <p className="text-slate-600">
                Rencana Anggaran Biaya untuk proyek konstruksi
              </p>
            </button>

            <button
              onClick={() => setActiveTool('mix')}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-left hover:shadow-lg hover:border-amber-300 transition-all"
            >
              <div className="text-5xl mb-4">🧱</div>
              <h3 className="text-2xl font-semibold text-slate-800 mb-2">Mix Design Calculator</h3>
              <p className="text-slate-600">
                Perencanaan campuran beton dengan metode SNI
              </p>
            </button>
          </div>
        ) : (
          <div>
            <button
              onClick={() => setActiveTool(null)}
              className="mb-4 text-amber-600 hover:text-amber-700 font-medium"
            >
              ← Kembali ke Tools
            </button>
            {activeTool === 'rab' && <RABCalculator />}
            {activeTool === 'mix' && <MixDesignCalculator />}
          </div>
        )}
      </div>
    </div>
  );
}

function RABCalculator() {
  const [items, setItems] = useState([{ name: '', volume: 0, unitPrice: 0 }]);
  const [overhead, setOverhead] = useState(15);
  const [profit, setProfit] = useState(10);
  const [tax, setTax] = useState(11);

  const addItem = () => {
    setItems([...items, { name: '', volume: 0, unitPrice: 0 }]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + item.volume * item.unitPrice, 0);
  const overheadAmount = subtotal * (overhead / 100);
  const profitAmount = (subtotal + overheadAmount) * (profit / 100);
  const beforeTax = subtotal + overheadAmount + profitAmount;
  const taxAmount = beforeTax * (tax / 100);
  const total = beforeTax + taxAmount;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">📊 Kalkulator RAB</h2>

      <div className="mb-6">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-slate-500 border-b">
              <th className="pb-2">Pekerjaan</th>
              <th className="pb-2">Volume</th>
              <th className="pb-2">Harga Satuan</th>
              <th className="pb-2">Jumlah</th>
              <th className="pb-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="py-2">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                    placeholder="Nama pekerjaan"
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </td>
                <td className="py-2">
                  <input
                    type="number"
                    value={item.volume}
                    onChange={(e) => updateItem(index, 'volume', Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </td>
                <td className="py-2">
                  <input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </td>
                <td className="py-2 font-semibold">
                  Rp {(item.volume * item.unitPrice).toLocaleString('id-ID')}
                </td>
                <td className="py-2">
                  <button
                    onClick={() => removeItem(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          onClick={addItem}
          className="mt-4 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
        >
          + Tambah Item
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Overhead (%)</label>
          <input
            type="number"
            value={overhead}
            onChange={(e) => setOverhead(Number(e.target.value))}
            className="w-full p-2 border border-slate-300 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Profit (%)</label>
          <input
            type="number"
            value={profit}
            onChange={(e) => setProfit(Number(e.target.value))}
            className="w-full p-2 border border-slate-300 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Pajak (%)</label>
          <input
            type="number"
            value={tax}
            onChange={(e) => setTax(Number(e.target.value))}
            className="w-full p-2 border border-slate-300 rounded"
          />
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl p-4 space-y-2">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span className="font-semibold">Rp {subtotal.toLocaleString('id-ID')}</span>
        </div>
        <div className="flex justify-between">
          <span>Overhead ({overhead}%):</span>
          <span className="font-semibold">Rp {overheadAmount.toLocaleString('id-ID')}</span>
        </div>
        <div className="flex justify-between">
          <span>Profit ({profit}%):</span>
          <span className="font-semibold">Rp {profitAmount.toLocaleString('id-ID')}</span>
        </div>
        <div className="flex justify-between">
          <span>Pajak ({tax}%):</span>
          <span className="font-semibold">Rp {taxAmount.toLocaleString('id-ID')}</span>
        </div>
        <div className="flex justify-between text-lg font-bold text-amber-600 pt-2 border-t">
          <span>TOTAL:</span>
          <span>Rp {total.toLocaleString('id-ID')}</span>
        </div>
      </div>
    </div>
  );
}

function MixDesignCalculator() {
  const [fc, setFc] = useState(25);
  const [slump, setSlump] = useState(120);
  const [aggMax, setAggMax] = useState(20);
  const [method, setMethod] = useState('SNI');
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
    let wc = 0.55;
    if (fc <= 20) wc = 0.60;
    else if (fc <= 25) wc = 0.55;
    else if (fc <= 30) wc = 0.50;
    else if (fc <= 40) wc = 0.45;
    else wc = 0.40;

    const slumpAdjustment = slump > 100 ? 0.03 : 0;
    wc = wc - slumpAdjustment;

    let cement = 325;
    if (fc > 25) cement = 325 + (fc - 25) * 4;
    
    const water = cement * wc;
    const FA = (1000 - water - cement / 3.15 - (cement * 0.5)) * 0.45;
    const CA = 1000 - water - cement / 3.15 - FA;

    setResult({
      wc: wc.toFixed(2),
      cement: Math.round(cement),
      water: Math.round(water),
      FA: Math.round(FA),
      CA: Math.round(CA),
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">🧱 Mix Design Calculator</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Kuat Tekan (MPa)</label>
          <input
            type="number"
            value={fc}
            onChange={(e) => setFc(Number(e.target.value))}
            className="w-full p-2 border border-slate-300 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Slump (mm)</label>
          <input
            type="number"
            value={slump}
            onChange={(e) => setSlump(Number(e.target.value))}
            className="w-full p-2 border border-slate-300 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Agregat Max (mm)</label>
          <input
            type="number"
            value={aggMax}
            onChange={(e) => setAggMax(Number(e.target.value))}
            className="w-full p-2 border border-slate-300 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Metode</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded"
          >
            <option value="SNI">SNI 7656:2012</option>
            <option value="ACI">ACI 211</option>
            <option value="DOE">DOE</option>
          </select>
        </div>
      </div>

      <button
        onClick={calculate}
        className="w-full py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 mb-6"
      >
        Hitung Mix Design
      </button>

      {result && (
        <div className="bg-slate-50 rounded-xl p-4">
          <h3 className="font-semibold text-slate-800 mb-4">Perbandingan Campuran per m³:</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white p-3 rounded-lg text-center">
              <div className="text-xs text-slate-500 mb-1">Semen</div>
              <div className="text-xl font-bold text-slate-800">{result.cement}</div>
              <div className="text-xs text-slate-400">kg</div>
            </div>
            <div className="bg-white p-3 rounded-lg text-center">
              <div className="text-xs text-slate-500 mb-1">Air</div>
              <div className="text-xl font-bold text-blue-600">{result.water}</div>
              <div className="text-xs text-slate-400">liter</div>
            </div>
            <div className="bg-white p-3 rounded-lg text-center">
              <div className="text-xs text-slate-500 mb-1">Pasir</div>
              <div className="text-xl font-bold text-amber-600">{result.FA}</div>
              <div className="text-xs text-slate-400">kg</div>
            </div>
            <div className="bg-white p-3 rounded-lg text-center">
              <div className="text-xs text-slate-500 mb-1">Batu Pecah</div>
              <div className="text-xl font-bold text-slate-700">{result.CA}</div>
              <div className="text-xs text-slate-400">kg</div>
            </div>
            <div className="bg-white p-3 rounded-lg text-center">
              <div className="text-xs text-slate-500 mb-1">W/C</div>
              <div className="text-xl font-bold text-green-600">{result.wc}</div>
              <div className="text-xs text-slate-400">ratio</div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-amber-50 rounded-lg text-sm text-amber-700">
            ⚠️ Hasil estimasi. Sesuaikan dengan kondisi material di lapangan dengan melakukan tes trial mix.
          </div>
        </div>
      )}
    </div>
  );
}
