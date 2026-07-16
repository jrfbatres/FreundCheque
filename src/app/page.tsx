'use client';
import { useAppStore } from '@/store/useAppStore';
import { Sun, Moon, PlusCircle, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const { theme, toggleTheme } = useAppStore();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-6 text-center animate-in fade-in duration-500 relative">
      
      {/* Theme Toggle Button */}
      <button 
        onClick={toggleTheme}
        aria-label="Alternar tema claro/oscuro"
        className="absolute top-6 right-6 p-3 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:scale-105 active:scale-95 transition-all shadow-md z-10"
      >
        {theme === 'light' ? (
          <Moon className="w-5 h-5 text-slate-800" />
        ) : (
          <Sun className="w-5 h-5 text-amber-400" />
        )}
      </button>

      <div className="w-full max-w-sm flex flex-col items-center gap-12">
        {/* Brand Logo */}
        <div className="relative w-64 h-24 transition-all duration-300 hover:scale-102">
          <Image 
            src={theme === 'dark' ? '/logoFreundOscuro3.png' : '/logoFreund2.png'} 
            alt="Freund Logo" 
            fill
            sizes="(max-w-768px) 100vw, 250px"
            className="object-contain drop-shadow-md"
            priority
          />
        </div>

        {/* Headline & Subtext */}
        <div className="space-y-4 max-w-xs mx-auto">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-2">
            Generación de Recibos
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            Gestione sus pagos con cheques de forma rápida, validada y segura.
          </p>
        </div>

        {/* Primary Action Button */}
        <Link 
          href="/capture/front"
          className="w-full max-w-xs flex items-center justify-center gap-3 bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-700 text-white px-8 py-5 rounded-2xl font-bold text-base shadow-lg shadow-blue-600/30 dark:shadow-blue-900/40 hover:-translate-y-1 active:translate-y-0 active:scale-98 transition-all duration-200 group"
        >
          <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          Generar Nuevo Recibo
        </Link>
      </div>

      {/* Decorative Brand Text */}
      <div className="absolute bottom-10 left-0 right-0 flex items-center justify-center gap-1.5 opacity-30 select-none">
        <Sparkles className="w-3 h-3 text-blue-500" />
        <span className="text-[9px] font-mono tracking-widest uppercase text-slate-800 dark:text-slate-200">
          Sello Digital Freund
        </span>
      </div>

    </div>
  );
}
