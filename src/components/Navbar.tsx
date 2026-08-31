'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from './ThemeProvider';
import { SearchModal, SearchButton } from './Search';
import { useAuth } from './AuthProvider';
import { NotificationBell } from './NotificationBell';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/', label: 'Beranda', icon: '🏠' },
  { href: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
  { href: '/agentic-chat', label: 'AI SIAP SKK', icon: '🤖' },
  { href: '/chatbot-builder', label: 'Chatbot Builder', icon: '🛠️' },
  { href: '/offline', label: 'Bimtek Offline', icon: '📍' },
  { href: '/knowledge-base', label: 'Knowledge Base', icon: '📚' },
  { href: '/bimtek', label: 'BIMTEK', icon: '🎓' },
  { href: '/quiz', label: 'Quiz', icon: '✍️' },
  { href: '/skk', label: 'SKK Hub', icon: '🏗️' },
  { href: '/pantau-skk', label: 'Pantau SKK', icon: '🗓️' },
  { href: '/biaya-skk', label: 'Biaya SKK', icon: '💰' },
  { href: '/hari-h', label: 'Hari-H Asesmen', icon: '📅' },
  { href: '/rencana-belajar', label: 'Rencana Belajar', icon: '📅' },
  { href: '/glosarium', label: 'Glosarium SKK', icon: '📖' },
  { href: '/faq-skk', label: 'FAQ SKK', icon: '❓' },
  { href: '/tips-lolos', label: 'Tips Lolos', icon: '🏆' },
  { href: '/panduan-ajj', label: 'Panduan AJJ', icon: '📡' },
  { href: '/panduan-rpl', label: 'Panduan RPL', icon: 'RPL' },
  { href: '/menjadi-asesor', label: 'Menjadi Asesor', icon: '🎖️' },
  { href: '/siap-index', label: 'SIAP Index', icon: '🧭' },
  { href: '/timeline-skk', label: 'Timeline SKK', icon: '🗺️' },
  { href: '/karir-skk', label: 'Karir SKK', icon: '🎯' },
  { href: '/direktori-lsp', label: 'Direktori LSP', icon: '🏛️' },
  { href: '/komunitas-skk', label: 'Komunitas SKK', icon: '🤝' },
  { href: '/siap-certify', label: 'SIAP Certify', icon: '🏛️' },
  { href: '/skk-coach', label: 'SKK Coach', icon: '💼' },
  { href: '/klinik-uji-kompetensi', label: 'Klinik SKK', icon: '🏥' },
  { href: '/mock-asesmen', label: 'Mock Asesmen', icon: '🎯' },
  { href: '/simulator-wawancara', label: 'Simulator Wawancara', icon: '🎙️' },
  { href: '/diagnostik-kompetensi', label: 'Diagnostik SKK', icon: '🧠' },
  { href: '/solver', label: 'Solver', icon: '🧮' },
  { href: '/tools', label: 'Tools', icon: '🔧' },
  { href: '/apl02-generator', label: 'Generator APL.02', icon: '📝' },
  { href: '/iso-generator', label: 'ISO Generator', icon: '📄' },
  { href: '/matrix', label: 'Matrix', icon: '🔗' },
  { href: '/pkb', label: 'Tracker PKB', icon: '📈' },
  { href: '/dokumen', label: 'Persiapan Dokumen', icon: '📄' },
  { href: '/prosedur', label: 'Prosedur UJK', icon: '📋' },
  { href: '/sertifikasi', label: 'Sertifikasi', icon: '📋' },
  { href: '/certify', label: 'Certify', icon: '✅' },
  { href: '/chat', label: 'Expert Chat', icon: '💬' },
  { href: '/calendar', label: 'Calendar', icon: '📅' },
  { href: '/achievements', label: 'Achievements', icon: '🏆' },
  { href: '/activity', label: 'Activity', icon: '📝' },
  { href: '/bookmarks', label: 'Bookmarks', icon: '🔖' },
  { href: '/shortcuts', label: 'Shortcuts', icon: '⌨️' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
  { href: '/profile', label: 'Profile', icon: '👤' },
];

const primaryNavHrefs = new Set([
  '/dashboard',
  '/',
  '/agentic-chat',
  '/bimtek',
  '/quiz',
  '/skk',
]);

const primaryNavItems = navItems.filter((item) => primaryNavHrefs.has(item.href));
const secondaryNavItems = navItems.filter((item) => !primaryNavHrefs.has(item.href));

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-lg sticky top-0 z-50 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2 shrink-0 group">
              <span className="text-2xl">🏗️</span>
              <div className="flex flex-col leading-none whitespace-nowrap">
                <span className="font-extrabold text-xl tracking-wide bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  SIAP SKK
                </span>
                <span className="text-[9px] text-slate-500 font-medium tracking-widest uppercase hidden lg:block">
                  Sistem Intensif Asistensi Pra-Uji
                </span>
              </div>
            </Link>
            
            <div className="hidden xl:flex min-w-0 items-center gap-1">
              <SearchButton onClick={() => setSearchOpen(true)} />
              {primaryNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`whitespace-nowrap rounded-lg px-2 py-2 text-xs font-medium transition-all duration-200 2xl:px-3 2xl:text-sm ${
                    pathname === item.href
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
              <details className="group relative">
                <summary className="flex cursor-pointer list-none items-center gap-1 whitespace-nowrap rounded-lg px-2 py-2 text-xs font-medium text-slate-300 transition-all hover:bg-slate-700 hover:text-white 2xl:px-3 2xl:text-sm">
                  <span>☰</span>
                  Menu Lainnya
                  <span className="text-[10px] transition-transform group-open:rotate-180">▼</span>
                </summary>
                <div className="absolute right-0 top-full z-50 mt-2 grid max-h-[72vh] w-[34rem] grid-cols-2 gap-1 overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-3 shadow-2xl">
                  {secondaryNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={(event) => event.currentTarget.closest('details')?.removeAttribute('open')}
                      className={`flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                        pathname === item.href
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span className="mr-2 w-6 text-center">{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </details>
              <button
                onClick={toggleTheme}
                className="ml-1 rounded-lg bg-slate-700 px-2 py-2 text-sm font-medium transition-all hover:bg-slate-600"
                title={theme === 'light' ? 'Dark mode' : 'Light mode'}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
              {user ? (
                <>
                  {user.role === 'admin' && (
                    <Link href="/admin" className="ml-2 px-3 py-2 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30">
                      ⚙️ Admin
                    </Link>
                  )}
                  <Link href="/profile" className="ml-2 px-3 py-2 rounded-lg text-sm font-medium bg-amber-500/20 text-amber-400">
                    👤 {user.name}
                  </Link>
                  <button
                    onClick={() => { logout(); router.push('/'); }}
                    className="ml-2 px-3 py-2 rounded-lg text-sm font-medium bg-slate-700 hover:bg-red-500/20 hover:text-red-400 transition-all"
                  >
                    Keluar
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="ml-2 px-3 py-2 rounded-lg text-sm font-medium bg-slate-700 hover:bg-slate-600">
                    Masuk
                  </Link>
                  <Link href="/register" className="ml-2 px-3 py-2 rounded-lg text-sm font-medium bg-amber-500 hover:bg-amber-600">
                    Daftar
                  </Link>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <NotificationBell />
              <button
                onClick={() => setSearchOpen(true)}
                className="xl:hidden p-2 rounded-lg hover:bg-slate-700"
                title="Cari"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button
                onClick={toggleTheme}
                className="xl:hidden p-2 rounded-lg hover:bg-slate-700"
                title={theme === 'light' ? 'Dark mode' : 'Light mode'}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
              <button
                className="xl:hidden p-2 rounded-lg hover:bg-slate-700"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
                aria-expanded={mobileOpen}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div className="xl:hidden bg-slate-800 border-t border-slate-700">
            <div className="px-2 py-3 space-y-1 max-h-[70vh] overflow-y-auto">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-base font-medium ${
                    pathname === item.href
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
