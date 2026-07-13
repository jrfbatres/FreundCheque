'use client';
import { useAppStore } from '@/store/useAppStore';
import { Sun, Moon, ScanLine } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const { theme, toggleTheme } = useAppStore();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-6 text-center animate-in fade-in zoom-in duration-500">
      
      <button 
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 rounded-full bg-slate-100 dark:bg-slate-800 hover:scale-105 transition-all shadow-sm"
      >
        {theme === 'light' ? <Moon className="w-6 h-6 text-slate-800" /> : <Sun className="w-6 h-6 text-amber-400" />}
      </button>

      <div className="mb-12">
        <Image 
          src={theme === 'dark' ? '/logoFreundOscuro3.png' : '/logoFreund2.png'} 
          alt="Freund Logo" 
          width={250} 
          height={80}
          className="object-contain drop-shadow-md"
          priority
        />
      </div>

      <h1 className="text-3xl font-bold mb-4 tracking-tight">Captura Inteligente</h1>
      <p className="text-slate-600 dark:text-slate-400 max-w-xs mx-auto mb-12 text-sm leading-relaxed">
        Posiciona tu dispositivo sobre el cheque para realizar una captura rápida, validada y segura.
      </p>

      <Link 
        href="/capture/front"
        className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg shadow-blue-600/30 dark:shadow-blue-900/50 transition-all hover:-translate-y-1 active:translate-y-0"
      >
        <ScanLine className="w-6 h-6" />
        Iniciar Captura
      </Link>

    </div>
  );
}
