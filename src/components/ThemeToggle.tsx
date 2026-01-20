'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
    );
  }

  return (
    <div className="flex items-center gap-1 p-1 bg-muted/50 border border-border rounded-xl backdrop-blur-sm">
      <button
        onClick={() => setTheme('light')}
        className={`p-2 rounded-lg transition-all ${
          theme === 'light'
            ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent/10'
        }`}
        title="Light Mode"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.364 17.636l-.707.707M17.636 17.636l-.707-.707M6.364 6.364l-.707-.707M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      <button
        onClick={() => setTheme('dark')}
        className={`p-2 rounded-lg transition-all ${
          theme === 'dark'
            ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent/10'
        }`}
        title="Dark Mode"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      </button>

      <button
        onClick={() => setTheme('system')}
        className={`p-2 rounded-lg transition-all ${
          theme === 'system'
            ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent/10'
        }`}
        title="System Preference"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </button>
    </div>
  );
}
