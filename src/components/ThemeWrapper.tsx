'use client';
import { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const theme = useAppStore((state) => state.theme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Avoid hydration mismatch by rendering without theme class first, or just assuming light/dark
    return <div className="min-h-screen bg-slate-900">{children}</div>;
  }

  return (
    <div className={theme}>
      <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 pb-16">
        {children}
      </div>
    </div>
  );
}
