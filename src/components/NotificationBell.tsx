'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useNotifications, Notification } from './NotificationProvider';

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'achievement': return '🏆';
      default: return 'ℹ️';
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Baru';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}j`;
    return `${days}h`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-slate-700 transition-colors"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-amber-500 hover:text-amber-600"
              >
                Tandai semua dibaca
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <span className="text-4xl">🔔</span>
                <p className="mt-2">Tidak ada notification</p>
              </div>
            ) : (
              notifications.slice(0, 20).map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                    !notif.read ? 'bg-amber-50 dark:bg-amber-900/20' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <span className="text-xl">{getIcon(notif.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="font-medium text-slate-900 dark:text-white text-sm">{notif.title}</p>
                        <span className="text-xs text-slate-400">{getTimeAgo(notif.timestamp)}</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{notif.message}</p>
                      <div className="flex gap-2 mt-2">
                        {notif.link && (
                          <Link
                            href={notif.link}
                            onClick={() => markAsRead(notif.id)}
                            className="text-xs text-amber-500 hover:underline"
                          >
                            Lihat →
                          </Link>
                        )}
                        <button
                          onClick={() => removeNotification(notif.id)}
                          className="text-xs text-slate-400 hover:text-red-500"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 text-center">
              <button className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-white">
                Lihat semua notification →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
