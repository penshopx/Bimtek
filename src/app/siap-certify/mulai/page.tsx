import type { Metadata } from 'next';
import CertifyIntake from './CertifyIntake';

export const metadata: Metadata = {
  title: 'Mulai Analisis Kelayakan — SIAP CERTIFY',
  description:
    'Isi profil dan target SKK untuk menerima panduan awal serta checklist dokumen yang dipersonalisasi.',
  openGraph: {
    title: 'Mulai Analisis Kelayakan — SIAP CERTIFY',
    description: 'Isi profil dan target SKK untuk menerima panduan awal serta checklist dokumen yang dipersonalisasi.',
    type: 'website',
  },
};

export default function MulaiCertifyPage() {
  return <CertifyIntake />;
}
