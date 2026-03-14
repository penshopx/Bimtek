'use client';

import { useBookmarks } from './BookmarkProvider';

interface BookmarkButtonProps {
  id: string;
  type: 'module' | 'quiz' | 'article' | 'tool' | 'position' | 'solver';
  title: string;
  url: string;
}

export function BookmarkButton({ id, type, title, url }: BookmarkButtonProps) {
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const bookmarked = isBookmarked(id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (bookmarked) {
      removeBookmark(id);
    } else {
      addBookmark({ id, type, title, url });
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`p-2 rounded-lg transition-colors ${
        bookmarked 
          ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/30' 
          : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30'
      }`}
      title={bookmarked ? 'Hapus bookmark' : 'Tambah bookmark'}
    >
      <svg className="w-5 h-5" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    </button>
  );
}
