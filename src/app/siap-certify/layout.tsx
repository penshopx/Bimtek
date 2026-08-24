import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SIAP CERTIFY — Pengurusan & Pendampingan Sertifikasi SKK',
  description:
    'Layanan SIAP CERTIFY membantu cek kelayakan, persiapan dokumen, pengajuan, persiapan uji kompetensi, dan monitoring sertifikasi SKK konstruksi.',
  openGraph: {
    title: 'SIAP CERTIFY — Pendampingan Sertifikasi SKK',
    description:
      'Dari cek kelayakan hingga dokumen siap, SIAP mendampingi proses sertifikasi SKK konstruksi secara terstruktur.',
    type: 'website',
  },
};

export default function SIAPCertifyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}