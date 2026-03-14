'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useTheme } from './ThemeProvider';

const navItems = [
  { href: '/', label: 'Beranda', icon: '🏠' },
  { href: '/knowledge-base', label: 'Knowledge Base', icon: '📚' },
  { href: '/bimtek', label: 'BIMTEK', icon: '🎓' },
  { href: '/quiz', label: 'Quiz', icon: '✍️' },
  { href: '/solver', label: 'Solver', icon: '🧮' },
  { href: '/tools', label: 'Tools', icon: '🔧' },
  { href: '/matrix', label: 'Matrix', icon: '🔗' },
  { href: '/sertifikasi', label: 'Sertifikasi', icon: '📋' },
  { href: '/certify', label: 'Certify', icon: '✅' },
  { href: '/chat', label: 'Chat', icon: '💬' },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-lg sticky top-0 z-50 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🏗️</span>
            <span className="font-bold text-xl bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              BimtekKita
            </span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-1">
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
          </div>

          <div className="flex items-center gap-2">
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
  );
}
