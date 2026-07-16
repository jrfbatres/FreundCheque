'use client';
import { Home, PlusCircle, History, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  // Hide BottomNav on capture screens except search-client
  if (pathname.includes('/capture') && !pathname.includes('/capture/search-client')) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full h-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around items-center z-50 transition-colors">
      <Link href="/" className={`flex flex-col items-center gap-1 w-20 ${pathname === '/' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-semibold uppercase tracking-wider">Inicio</span>
      </Link>
      
      <Link href="/capture/front" className={`flex flex-col items-center gap-1 w-20 ${pathname.includes('/capture') ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
        <PlusCircle className="w-5 h-5" />
        <span className="text-[10px] font-semibold uppercase tracking-wider">Abonar</span>
      </Link>
      
      <Link href="/history" className={`flex flex-col items-center gap-1 w-20 ${pathname === '/history' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
        <History className="w-5 h-5" />
        <span className="text-[10px] font-semibold uppercase tracking-wider">Historial</span>
      </Link>
      
      <Link href="/settings" className={`flex flex-col items-center gap-1 w-20 ${pathname === '/settings' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
        <Settings className="w-5 h-5" />
        <span className="text-[10px] font-semibold uppercase tracking-wider">Ajustes</span>
      </Link>
    </div>
  );
}
