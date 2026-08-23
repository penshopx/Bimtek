'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { CertificateGenerator } from '@/components/CertificateGenerator';

interface Certificate {
  id: string;
  eventId: string;
  participantId: string;
  participantName: string;
  eventTitle: string;
  eventDate: string;
  instructorName: string;
  location: string;
  issuedAt: string;
}

export default function MyCertificatesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        fetchCertificates();
      } else {
        setLoading(false);
      }
    }
  }, [user, authLoading]);

  const fetchCertificates = async () => {
    try {
      const sessionId = typeof window !== 'undefined' ? localStorage.getItem('sessionId') : null;
      if (!sessionId) {
        setError('Sesi tidak ditemukan. Silakan masuk kembali.');
        setLoading(false);
        return;
      }
      const res = await fetch('/api/events?action=my-certificates', {
        headers: { 'x-session-id': sessionId },
      });
      if (!res.ok) {
        throw new Error('Gagal memuat sertifikat');
      }
      const data = await res.json();
      setCertificates(data);
    } catch (e) {
      setError('Terjadi kesalahan saat memuat sertifikat.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/dashboard"
            className="text-slate-400 hover:text-white transition-colors"
          >
            ← Dashboard
          </Link>
          <span className="text-slate-600">/</span>
          <h1 className="text-2xl font-bold text-white">🏅 Sertifikat Saya</h1>
        </div>

        {/* Auth guard */}
        {!authLoading && !user && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Masuk untuk melihat sertifikat
            </h2>
            <p className="text-slate-400 mb-6">
              Halaman ini hanya tersedia untuk pengguna yang sudah masuk.
            </p>
            <Link
              href="/login"
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium"
            >
              Masuk
            </Link>
          </div>
        )}

        {/* Loading */}
        {(authLoading || (user && loading)) && (
          <div className="text-center py-20">
            <div className="text-4xl mb-4 animate-pulse">🏅</div>
            <p className="text-slate-400">Memuat sertifikat…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
            <div className="text-3xl mb-2">⚠️</div>
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {user && !loading && !error && certificates.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📜</div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Belum ada sertifikat
            </h2>
            <p className="text-slate-400 mb-4 max-w-md mx-auto">
              Sertifikat hanya muncul di sini jika Anda <strong className="text-white">sudah masuk (login)</strong> saat mendaftar ke event offline.
            </p>
            <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
              Jika Anda mendaftar tanpa login, hubungi penyelenggara event untuk menautkan sertifikat Anda secara manual.
            </p>
            <Link
              href="/offline"
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium"
            >
              Lihat Event Offline
            </Link>
          </div>
        )}

        {/* Certificate grid */}
        {user && !loading && !error && certificates.length > 0 && (
          <>
            <p className="text-slate-400 mb-6">
              Anda memiliki <span className="text-white font-semibold">{certificates.length}</span> sertifikat.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-slate-800/60 border border-slate-700 hover:border-amber-500/50 rounded-2xl p-6 transition-all"
                >
                  {/* Gold badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-3xl">🏅</div>
                    <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full font-medium">
                      Terverifikasi
                    </span>
                  </div>

                  {/* Event title */}
                  <h3 className="text-white font-semibold text-lg leading-snug mb-3">
                    {cert.eventTitle}
                  </h3>

                  {/* Details */}
                  <div className="space-y-1.5 text-sm text-slate-400 mb-5">
                    <div className="flex items-center gap-2">
                      <span>👤</span>
                      <span>{cert.participantName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📅</span>
                      <span>{formatDate(cert.eventDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>👨‍🏫</span>
                      <span>{cert.instructorName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📍</span>
                      <span>{cert.location}</span>
                    </div>
                  </div>

                  {/* Certificate ID */}
                  <p className="text-xs text-slate-600 mb-4 font-mono truncate">
                    ID: {cert.id}
                  </p>

                  {/* Download button */}
                  <button
                    onClick={() => setSelectedCert(cert)}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium text-sm transition-colors"
                  >
                    🖨️ Unduh / Cetak PDF
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Certificate preview modal */}
      {selectedCert && (
        <CertificateGenerator
          certificate={selectedCert}
          onClose={() => setSelectedCert(null)}
        />
      )}
    </div>
  );
}
