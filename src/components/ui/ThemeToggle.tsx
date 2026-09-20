'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme, ThemeMode } from '@/components/providers/ThemeProvider';

export function ThemeToggle({
  showLabel = false,
  className = '',
}: {
  showLabel?: boolean;
  className?: string;
}) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse ${className}`}
        aria-hidden="true"
      />
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative p-2 rounded-xl text-slate-500 hover:text-amber-500 dark:text-slate-400 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-transparent hover:border-slate-200 dark:hover:border-slate-700 flex items-center gap-2 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 ${className}`}
      title={isDark ? 'สลับเป็นโหมดสว่าง (Light mode)' : 'สลับเป็นโหมดมืด (Dark mode)'}
      aria-label={isDark ? 'สลับเป็นโหมดสว่าง' : 'สลับเป็นโหมดมืด'}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-5 h-5 text-amber-400 rotate-0 scale-100 transition-all duration-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]" />
        ) : (
          <Moon className="w-5 h-5 text-slate-600 rotate-0 scale-100 transition-all duration-300 hover:text-indigo-600" />
        )}
      </div>

      {showLabel && (
        <span className="text-xs font-semibold">
          {isDark ? 'โหมดมืด' : 'โหมดสว่าง'}
        </span>
      )}
    </button>
  );
}

export default ThemeToggle;
