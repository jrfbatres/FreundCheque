'use client';
import { Home, Camera, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  // Hide BottomNav on capture screens
  if (pathname.includes('/capture')) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full h-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around items-center z-50 transition-colors">
      <Link href="/" className={`flex flex-col items-center gap-1 w-20 ${pathname === '/' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
        <Home className="w-6 h-6" />
        <span className="text-xs font-medium">Home</span>
      </Link>
      
      <Link href="/capture/front" className={`flex flex-col items-center gap-1 w-20 ${pathname.includes('/capture') ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
        <Camera className="w-6 h-6" />
        <span className="text-xs font-medium">Escanear</span>
      </Link>
      
      <Link href="/settings" className={`flex flex-col items-center gap-1 w-20 ${pathname === '/settings' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
        <Settings className="w-6 h-6" />
        <span className="text-xs font-medium">Configurar</span>
      </Link>
    </div>
  );
}
