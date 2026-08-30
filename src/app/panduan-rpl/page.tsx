'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type CheckerResult = {
  education: string;
  experience: string;
  score: number;
  recommendation: 'strong' | 'possible' | 'regular';
};

const stages = [
  { number: '01', title: 'Kenali jalur dan skema', body: 'Tentukan jabatan kerja dan unit kompetensi yang paling dekat dengan pekerjaan Anda. LSP akan membantu memvalidasi pilihan skema.', evidence: 'Riwayat pekerjaan, uraian jabatan, surat tugas' },
  { number: '02', title: 'Petakan pengalaman', body: 'Hubungkan aktivitas proyek yang pernah Anda lakukan dengan indikator kompetensi pada SKKNI.', evidence: 'Daftar proyek, logbook, laporan harian, gambar kerja' },
  { number: '03', title: 'Kumpulkan bukti', body: 'Susun bukti yang asli, relevan, terkini, dan dapat ditelusuri. Kualitas bukti lebih penting daripada jumlahnya.', evidence: 'Sertifikat pelatihan, foto proyek, produk kerja' },
  { number: '04', title: 'Ajukan asesmen RPL', body: 'Lengkapi formulir pendaftaran dan portofolio. Asesor meninjau kecukupan bukti sebelum menentukan metode asesmen.', evidence: 'FR.APL.01, FR.APL.02, portofolio terindeks' },
  { number: '05', title: 'Ikuti klarifikasi kompetensi', body: 'Ceritakan peran Anda dan tunjukkan cara kerja yang aman, bermutu, serta sesuai prosedur. Asesor dapat meminta demonstrasi tambahan.', evidence: 'Wawancara, demonstrasi, verifikasi pihak ketiga' },
  { number: '06', title: 'Terima keputusan dan tindak lanjut', body: 'Jika kompetensi terpenuhi, LSP memproses rekomendasi sertifikasi. Jika masih ada celah, Anda mendapat arahan untuk melengkapinya.', evidence: 'Berita acara, umpan balik asesor, rencana pemenuhan gap' },
];

const faqs = [
  ['Apakah RPL berarti saya pasti tidak perlu mengikuti asesmen?', 'Tidak. RPL mengakui pembelajaran dari pengalaman, bukan menghapus pembuktian kompetensi. Anda tetap perlu melalui proses asesmen dan menunjukkan bukti yang dapat diverifikasi.'],
  ['Siapa yang dapat mengajukan RPL?', 'Profesional konstruksi yang memiliki pengalaman kerja relevan dan bukti kompetensi untuk skema SKK yang dipilih. Keputusan akhir ada pada LSP dan asesor sesuai persyaratan skema.'],
  ['Apakah pengalaman kerja tanpa ijazah tetap bisa dipertimbangkan?', 'Bisa dipertimbangkan melalui jalur RPL, selama pengalaman tersebut relevan, dapat dibuktikan, dan memenuhi ketentuan skema. RPL bukan pengganti otomatis untuk semua persyaratan regulasi.'],
  ['Bukti apa yang paling kuat untuk RPL?', 'Bukti yang menunjukkan peran dan hasil kerja Anda secara langsung: laporan atau produk kerja, surat pengalaman, dokumentasi proyek, sertifikat pelatihan, serta verifikasi atasan atau pemberi kerja.'],
  ['Berapa tahun pengalaman yang dibutuhkan?', 'Tidak ada satu angka yang berlaku untuk semua jabatan. Kebutuhan bergantung pada jenjang KKNI, skema, dan ketentuan LSP. Gunakan pemeriksa di halaman ini sebagai orientasi awal, bukan keputusan resmi.'],
  ['Apa beda RPL dengan asesmen reguler?', 'Asesmen reguler biasanya dimulai dari jalur pendidikan atau pelatihan yang telah ditentukan. RPL memulai dari pengalaman dan bukti yang sudah dimiliki, lalu menguji kesetaraannya dengan unit kompetensi.'],
  ['Ke mana saya harus mendaftar?', 'Mulailah dari LSP konstruksi yang memiliki skema sesuai jabatan Anda. Minta konfirmasi tertulis mengenai penerimaan RPL, daftar dokumen, biaya, dan metode asesmen sebelum mengirimkan berkas.'],
  ['Bagaimana jika bukti saya belum lengkap?', 'Jangan mengarang atau menggandakan bukti. Tandai gap yang ada, minta surat verifikasi dari pihak yang berwenang, dan tanyakan kepada LSP apakah bukti tambahan atau pelatihan pemenuhan gap diperlukan.'],
];

const evidenceTypes = ['Portofolio produk kerja', 'Surat pengalaman kerja', 'Dokumentasi proyek', 'Sertifikat pelatihan', 'Logbook atau laporan', 'Verifikasi pihak ketiga'];

const experienceLabels: Record<string, string> = {
  '0': 'kurang dari 2 tahun pengalaman relevan',
  '3': '2–4 tahun pengalaman relevan',
  '5': '5–9 tahun pengalaman relevan',
  '10': '10 tahun atau lebih pengalaman relevan',
};

export default function PanduanRplPage() {
  const [education, setEducation] = useState('');
  const [experience, setExperience] = useState('');
  const [result, setResult] = useState<CheckerResult | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('siapskk_rpl_checker');
      if (saved) {
        const parsed = JSON.parse(saved) as CheckerResult;
        setEducation(parsed.education);
        setExperience(parsed.experience);
        setResult(parsed);
      }
    } catch {
      // Prefer a usable checker when storage is unavailable.
    }
  }, []);

  const checkEligibility = () => {
    if (!education || !experience) return;
    const years = Number(experience);
    const score = (education === 'nonformal' ? 2 : education === 'sma' ? 1 : 0) + (years >= 10 ? 2 : years >= 5 ? 1 : 0);
    const recommendation: CheckerResult['recommendation'] = score >= 3 ? 'strong' : score >= 1 ? 'possible' : 'regular';
    const next = { education, experience, score, recommendation };
    setResult(next);
    try {
      window.localStorage.setItem('siapskk_rpl_checker', JSON.stringify(next));
    } catch {
      // The recommendation remains useful even when browser storage is unavailable.
    }
  };

  return (
    <div className="min-h-[100dvh] overflow-hidden bg-[#0b1220] text-slate-100">
      <section className="relative border-b border-slate-800/80">
        <div className="absolute -right-24 -top-32 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" aria-hidden="true" />
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 lg:px-8 lg:pb-24 lg:pt-20">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
              Panduan jalur pengalaman
            </p>
            <h1 className="max-w-4xl text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-6xl">
              Pengalaman Anda punya nilai. <span className="text-amber-400">Buktikan lewat RPL.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
              Rekognisi Pembelajaran Lampau membantu profesional konstruksi mengajukan SKK berdasarkan kompetensi yang dibangun dari pengalaman kerja, pelatihan, dan pembelajaran mandiri—bukan hanya ijazah.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#cek-rpl" className="inline-flex items-center justify-center rounded-xl bg-amber-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-[#0b1220]" data-testid="link-cek-rpl">
                Cek kemungkinan jalur RPL
              </a>
              <a href="#alur" className="inline-flex items-center justify-center rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-200 transition hover:border-amber-400/60 hover:text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300" data-testid="link-lihat-alur">
                Lihat alur pengajuan
              </a>
            </div>
          </div>
          <div className="mt-14 grid gap-3 border-t border-slate-800 pt-6 sm:grid-cols-3">
            {[
              ['01', 'Berbasis bukti', 'Yang dinilai adalah kompetensinya.'],
              ['02', 'Tetap terverifikasi', 'Asesor memastikan bukti Anda sah.'],
              ['03', 'Sesuai skema', 'Persyaratan mengikuti jabatan kerja.'],
            ].map(([num, title, body]) => (
              <div key={num} className="flex gap-3 rounded-xl bg-slate-900/50 p-3">
                <span className="font-mono text-sm text-amber-400">{num}</span>
                <div><p className="font-semibold text-white">{title}</p><p className="mt-1 text-sm text-slate-500">{body}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <section className="grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-400">Apa itu RPL?</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">Jalur yang mengakui cara Anda belajar di lapangan.</h2>
            <p className="mt-5 leading-8 text-slate-400">Kompetensi dapat tumbuh dari mengelola proyek, memimpin tim, menyelesaikan masalah teknis, atau mengikuti pelatihan. Dalam RPL, pengalaman itu dipetakan ke unit kompetensi SKKNI lalu dinilai secara terstruktur.</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {evidenceTypes.map((item, index) => <div key={item} className="rounded-lg border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-300"><span className="mr-2 font-mono text-amber-400">0{index + 1}</span>{item}</div>)}
            </div>
          </div>
          <aside className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.07] p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-300">Penting untuk dipahami</p>
            <p className="mt-4 text-xl font-semibold leading-8 text-white">RPL bukan jalan pintas. Ini jalan yang berbeda untuk menunjukkan standar yang sama.</p>
            <p className="mt-4 text-sm leading-7 text-slate-400">LSP dan asesor tetap memeriksa keaslian, relevansi, kecukupan, dan kemutakhiran bukti sebelum memutuskan hasil asesmen.</p>
          </aside>
        </section>

        <section className="mt-20" aria-labelledby="siapa-title">
          <div className="mb-7 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-400">Apakah ini jalur Anda?</p>
            <h2 id="siapa-title" className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">RPL cocok untuk profesional yang kompetensinya sudah terbentuk.</h2>
            <p className="mt-4 leading-7 text-slate-400">Anda tidak harus memiliki profil yang sempurna untuk mulai bertanya ke LSP. Yang penting, pengalaman tersebut berkaitan dengan jabatan yang dituju dan dapat ditunjukkan secara jujur.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              ['Punya jam terbang', 'Bekerja di proyek konstruksi, memimpin tim, atau menjalankan tanggung jawab teknis yang relevan.'],
              ['Pendidikan belum sesuai', 'Ijazah formal belum memenuhi jalur reguler, atau pembelajaran Anda lebih banyak terbentuk dari lapangan dan pelatihan.'],
              ['Siap menunjukkan bukti', 'Memiliki portofolio, surat pengalaman, atau pihak yang dapat memverifikasi pekerjaan dan hasil kerja Anda.'],
            ].map(([title, body], index) => (
              <article key={title} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6">
                <span className="font-mono text-sm text-amber-400">0{index + 1}</span>
                <h3 className="mt-4 font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-400">{body}</p>
              </article>
            ))}
          </div>
          <p className="mt-4 text-xs leading-6 text-slate-500">Catatan: kecocokan awal bukan persetujuan pendaftaran. LSP dan asesor akan menetapkan persyaratan akhir berdasarkan skema sertifikasi yang dipilih.</p>
        </section>

        <section className="mt-20" aria-labelledby="bandingkan">
          <div className="mb-7"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-400">Pilih jalur yang tepat</p><h2 id="bandingkan" className="mt-3 text-3xl font-bold text-white">RPL atau asesmen reguler?</h2></div>
          <div className="overflow-hidden rounded-2xl border border-slate-800">
            <div className="grid grid-cols-[1fr_1fr_1fr] bg-slate-900 text-xs font-semibold uppercase tracking-wider text-slate-500"><div className="p-4 sm:p-5">Aspek</div><div className="border-l border-slate-800 p-4 text-amber-300 sm:p-5">RPL</div><div className="border-l border-slate-800 p-4 sm:p-5">Reguler</div></div>
            {[
              ['Titik awal', 'Pengalaman dan bukti yang sudah dimiliki', 'Pendidikan atau pelatihan yang dipersyaratkan'],
              ['Fokus persiapan', 'Memetakan portofolio ke unit kompetensi', 'Mengikuti pembelajaran dan menyiapkan asesmen'],
              ['Proses penilaian', 'Verifikasi bukti lalu klarifikasi atau demonstrasi', 'Asesmen sesuai metode pada skema'],
              ['Cocok untuk', 'Profesional berpengalaman dengan bukti kerja', 'Kandidat yang baru membangun kompetensi'],
            ].map(([aspect, rpl, regular]) => <div key={aspect} className="grid grid-cols-[1fr_1fr_1fr] border-t border-slate-800 bg-[#101a2b] text-sm"><div className="p-4 font-medium text-slate-300 sm:p-5">{aspect}</div><div className="border-l border-slate-800 p-4 leading-6 text-slate-400 sm:p-5">{rpl}</div><div className="border-l border-slate-800 p-4 leading-6 text-slate-400 sm:p-5">{regular}</div></div>)}
          </div>
        </section>

        <section id="alur" className="mt-20 scroll-mt-24" aria-labelledby="alur-title">
          <div className="mb-8 max-w-2xl"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-400">Dari pengalaman menuju SKK</p><h2 id="alur-title" className="mt-3 text-3xl font-bold text-white">Enam tahap yang perlu Anda siapkan.</h2></div>
          <div className="grid gap-3 md:grid-cols-2">
            {stages.map((stage) => <article key={stage.number} className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-amber-400/40 sm:p-6"><div className="flex gap-4"><span className="font-mono text-sm text-amber-400">{stage.number}</span><div><h3 className="font-semibold text-white">{stage.title}</h3><p className="mt-2 text-sm leading-7 text-slate-400">{stage.body}</p><p className="mt-4 border-l-2 border-amber-400/40 pl-3 text-xs leading-5 text-slate-500"><span className="font-semibold text-slate-300">Contoh bukti:</span> {stage.evidence}</p></div></div></article>)}
          </div>
        </section>

        <section id="cek-rpl" className="mt-20 scroll-mt-24 rounded-3xl border border-amber-400/25 bg-gradient-to-br from-[#172238] to-[#101a2b] p-6 sm:p-10" aria-labelledby="checker-title">
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
            <div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-400">Pemeriksa awal</p><h2 id="checker-title" className="mt-3 text-3xl font-bold text-white">Apakah RPL relevan untuk saya?</h2><p className="mt-4 text-sm leading-7 text-slate-400">Jawab dua pertanyaan ini untuk mendapat arah awal. Hasil tersimpan di perangkat Anda dan bukan keputusan resmi LSP.</p></div>
            <div>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-200">Pendidikan terakhir<select value={education} onChange={(event) => { setEducation(event.target.value); setResult(null); }} className="mt-2 w-full rounded-xl border border-slate-700 bg-[#0b1220] px-4 py-3 text-sm text-white outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20" data-testid="select-pendidikan"><option value="">Pilih pendidikan</option><option value="sma">SMA/SMK atau setara</option><option value="nonformal">Pelatihan/nonformal</option><option value="diploma">Diploma atau sarjana</option></select></label>
                <label className="text-sm font-medium text-slate-200">Pengalaman relevan<select value={experience} onChange={(event) => { setExperience(event.target.value); setResult(null); }} className="mt-2 w-full rounded-xl border border-slate-700 bg-[#0b1220] px-4 py-3 text-sm text-white outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20" data-testid="select-pengalaman"><option value="">Pilih durasi</option><option value="0">Kurang dari 2 tahun</option><option value="3">2–4 tahun</option><option value="5">5–9 tahun</option><option value="10">10 tahun atau lebih</option></select></label>
              </div>
              <button onClick={checkEligibility} disabled={!education || !experience} className="mt-6 w-full rounded-xl bg-amber-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40" data-testid="button-periksa-rpl">Lihat rekomendasi saya</button>
              {result && <div className="mt-6 rounded-2xl border border-slate-700 bg-[#0b1220]/80 p-5" role="status" data-testid="status-rekomendasi"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-400">Rekomendasi awal</p><h3 className="mt-2 text-xl font-semibold text-white">{result.recommendation === 'strong' ? 'RPL layak Anda eksplorasi lebih dulu' : result.recommendation === 'possible' ? 'RPL mungkin sesuai dengan profil Anda' : 'Mulai dengan cek persyaratan skema reguler'}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{result.recommendation === 'regular' ? `Dengan ${experienceLabels[result.experience] ?? 'pengalaman relevan'}, bangun dulu bukti kompetensi dan konfirmasi persyaratan pendidikan pada skema yang dituju.` : 'Langkah berikutnya: pilih jabatan SKK, siapkan daftar bukti, lalu konfirmasi penerimaan jalur RPL kepada LSP yang memiliki skema tersebut.'}</p><Link href="/direktori-lsp" className="mt-4 inline-flex text-sm font-semibold text-amber-300 underline decoration-amber-400/40 underline-offset-4 hover:text-amber-200" data-testid="link-cari-lsp">Cari LSP dan cek skema yang tersedia</Link></div>}
            </div>
          </div>
        </section>

        <section className="mt-20" aria-labelledby="faq-title">
          <div className="mb-7"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-400">Pertanyaan umum</p><h2 id="faq-title" className="mt-3 text-3xl font-bold text-white">Sebelum mengajukan RPL.</h2></div>
          <div className="divide-y divide-slate-800 rounded-2xl border border-slate-800 bg-slate-900/50">
            {faqs.map(([question, answer], index) => <div key={question}><button onClick={() => setOpenFaq(openFaq === index ? null : index)} className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left font-semibold text-slate-200 hover:text-amber-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-400 sm:px-6" aria-expanded={openFaq === index} aria-controls={`faq-answer-${index}`} data-testid={`button-faq-${index}`}><span>{question}</span><span className="font-mono text-xl font-normal text-amber-400" aria-hidden="true">{openFaq === index ? '−' : '+'}</span></button>{openFaq === index && <div id={`faq-answer-${index}`} className="px-5 pb-5 text-sm leading-7 text-slate-400 sm:px-6 sm:pb-6">{answer}</div>}</div>)}
          </div>
        </section>

        <div className="mt-16 flex flex-col items-start justify-between gap-5 border-t border-slate-800 pt-8 sm:flex-row sm:items-center"><p className="max-w-xl text-sm leading-6 text-slate-500">Persyaratan dapat berbeda menurut skema dan LSP. Selalu minta konfirmasi terbaru sebelum menyiapkan biaya atau mengirim dokumen.</p><Link href="/skk" className="shrink-0 rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 hover:border-amber-400/60 hover:text-amber-300" data-testid="link-kembali-skk">Kembali ke SKK Hub</Link></div>
      </main>
    </div>
  );
}