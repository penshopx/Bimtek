'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PROFESSIONAL_PROFILE_KEY, parseProfessionalProfile, profileContext } from '@/lib/professional-profile';

/** Display user-supplied profile context as plain text, never as an assessment result. */
export default function ProfileToolContext({ onUseContext }: { onUseContext?: (context: string) => void }) {
  const [context, setContext] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('profil') === '1') {
      try {
        setContext(profileContext(parseProfessionalProfile(localStorage.getItem(PROFESSIONAL_PROFILE_KEY))));
      } catch {
        setError('Profil lokal tidak dapat dibaca. Target dari tautan tetap dapat digunakan; periksa profil untuk mencoba lagi.');
      }
    } else {
      setContext(params.get('context') ?? '');
    }
  }, []);
  if (error) return <p role="status" className="mb-6 text-sm text-amber-200">{error}</p>;
  if (!context) return null;
  return (
    <aside className="mb-6 rounded-xl border border-blue-400/30 bg-blue-500/10 p-4 text-sm text-slate-200">
      <p className="font-semibold text-blue-300">Data dari Profil SKK</p>
      <p className="mt-2 break-words">{context}</p>
      <p className="mt-2 text-xs text-slate-300">Rincian profil dibaca dari penyimpanan browser, bukan dari URL.</p>
      {onUseContext && (
        <div className="mt-3">
          <button type="button" onClick={() => onUseContext(context)} className="rounded-lg border border-blue-300/50 px-3 py-2 font-semibold text-blue-200 hover:bg-blue-500/20">
            Masukkan profil ke pesan AI
          </button>
          <p className="mt-2 text-xs text-slate-300">Tinjau dan hapus rincian yang tidak ingin dibagikan. Data baru dikirim ke AI setelah Anda menekan Kirim.</p>
        </div>
      )}
      <Link href="/profil-skk" className="mt-2 inline-block text-blue-300 underline">Ubah profil</Link>
    </aside>
  );
}
