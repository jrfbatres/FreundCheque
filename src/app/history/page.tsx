'use client';
import { useAppStore } from '@/store/useAppStore';
import { CheckCircle2, Clock, Check, XCircle, HelpCircle, Moon, Sun, ShieldAlert } from 'lucide-react';
import Image from 'next/image';

export default function HistoryPage() {
  const { theme, toggleTheme, scannedChecks } = useAppStore();

  const getStatusStyleAndIcon = (status: string) => {
    switch (status) {
      case 'Validado':
        return {
          bg: 'bg-emerald-100 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border border-emerald-500/20',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        };
      case 'Liquidado':
        return {
          bg: 'bg-blue-100 dark:bg-blue-950/20 text-blue-800 dark:text-blue-400 border border-blue-500/20',
          icon: <Check className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
        };
      case 'En tránsito':
        return {
          bg: 'bg-amber-100 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 border border-amber-500/20',
          icon: <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
        };
      case 'Rechazado':
        return {
          bg: 'bg-red-100 dark:bg-red-950/20 text-red-800 dark:text-red-400 border border-red-500/20',
          icon: <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
        };
      default:
        return {
          bg: 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-350',
          icon: <HelpCircle className="w-5 h-5 text-slate-500 shrink-0" />
        };
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] p-6 pb-24 relative max-w-md mx-auto animate-in fade-in duration-300">
      
      {/* Header Area */}
      <header className="flex justify-between items-center pt-4 mb-6">
        <div className="w-10" /> {/* Spacer */}
        <div className="relative w-28 h-10">
          <Image 
            src={theme === 'dark' ? '/logoFreundOscuro3.png' : '/logoFreund2.png'} 
            alt="Freund Logo" 
            fill
            sizes="112px"
            className="object-contain drop-shadow-md"
            priority
          />
        </div>
        <button 
          onClick={toggleTheme}
          className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:scale-105 active:scale-95 transition-all shadow-sm"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon className="w-5 h-5 text-slate-800" /> : <Sun className="w-5 h-5 text-amber-400" />}
        </button>
      </header>

      {/* Screen Title */}
      <section className="mb-8">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Historial de Cheques
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-normal">
          Cheques escaneados y validados en tiempo real mediante la aplicación.
        </p>
      </section>

      {/* Transactions List */}
      <section className="flex-1 space-y-3.5">
        {scannedChecks.map((check) => {
          const { bg, icon } = getStatusStyleAndIcon(check.status);
          return (
            <div 
              key={check.id}
              className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-850 p-4 rounded-2xl flex items-center justify-between shadow-sm hover:scale-[1.01] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bg}`}>
                  {icon}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                    {check.emitter}
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    {check.date} • {check.status}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-sm font-bold text-slate-900 dark:text-white">
                  {check.amount}
                </span>
                <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 mt-1 block">
                  #{check.numCheque}
                </span>
              </div>
            </div>
          );
        })}

        {scannedChecks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <ShieldAlert className="w-14 h-14 text-slate-300 dark:text-slate-650 mb-4" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No hay cheques registrados</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs leading-relaxed">
              Los cheques que escanees y valides en la aplicación aparecerán en esta lista de forma automática.
            </p>
          </div>
        )}
      </section>

    </div>
  );
}
