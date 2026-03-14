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
  { href: '/agentic-chat', label: 'Agentic AI', icon: '🤖' },
  { href: '/chatbot-builder', label: 'Chatbot Builder', icon: '🛠️' },
  { href: '/offline', label: 'Bimtek Offline', icon: '📍' },
  { href: '/knowledge-base', label: 'Knowledge Base', icon: '📚' },
  { href: '/bimtek', label: 'BIMTEK', icon: '🎓' },
  { href: '/quiz', label: 'Quiz', icon: '✍️' },
  { href: '/solver', label: 'Solver', icon: '🧮' },
  { href: '/tools', label: 'Tools', icon: '🔧' },
  { href: '/iso-generator', label: 'ISO Generator', icon: '📄' },
  { href: '/matrix', label: 'Matrix', icon: '🔗' },
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
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl">🏗️</span>
              <span className="font-bold text-xl bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                BimtekKita
              </span>
            </Link>
            
            <div className="hidden lg:flex items-center space-x-1">
              <SearchButton onClick={() => setSearchOpen(true)} />
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    pathname === item.href
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
              <button
                onClick={toggleTheme}
                className="ml-2 px-3 py-2 rounded-lg text-sm font-medium bg-slate-700 hover:bg-slate-600 transition-all"
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
                className="lg:hidden p-2 rounded-lg hover:bg-slate-700"
                title="Cari"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button
                onClick={toggleTheme}
                className="md:hidden p-2 rounded-lg hover:bg-slate-700"
                title={theme === 'light' ? 'Dark mode' : 'Light mode'}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
              <button
                className="md:hidden p-2 rounded-lg hover:bg-slate-700"
                onClick={() => setMobileOpen(!mobileOpen)}
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
          <div className="md:hidden bg-slate-800 border-t border-slate-700">
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
