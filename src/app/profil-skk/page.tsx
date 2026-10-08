import type { Metadata } from 'next';
import ProfessionalProfile from '@/components/ProfessionalProfile';

export const metadata: Metadata = {
  title: 'Profil Profesional SKK | SIAP SKK',
  description: 'Simpan profil profesional, SKK saat ini, dan target persiapan sertifikasi Anda.',
  openGraph: {
    title: 'Profil Profesional SKK | SIAP SKK',
    description: 'Simpan profil profesional, SKK saat ini, dan target persiapan sertifikasi Anda.',
  },
};

export default function ProfessionalProfilePage() {
  return <ProfessionalProfile />;
}
