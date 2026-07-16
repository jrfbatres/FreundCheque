'use client';
import { useState } from 'react';
import { useAppStore, ScannedCheck } from '@/store/useAppStore';
import { CheckCircle2, Clock, Check, XCircle, Search, HelpCircle, Moon, Sun, ShieldAlert } from 'lucide-react';
import Image from 'next/image';

const INITIAL_MOCK_CHECKS: Record<string, ScannedCheck[]> = {
  current: [
    { id: 'mock-1', emitter: 'Corporativo Global S.A.', amount: '$1,250.00', date: '24 Nov, 2026', status: 'Validado', numCheque: 'CH-9921', icon: 'check_circle' },
    { id: 'mock-2', emitter: 'Ferretería El Sol', amount: '$845.30', date: '22 Nov, 2026', status: 'En tránsito', numCheque: 'CH-8842', icon: 'payments' },
    { id: 'mock-3', emitter: 'Inversiones Atlas', amount: '$2,100.00', date: '20 Nov, 2026', status: 'Liquidado', numCheque: 'CH-7710', icon: 'verified' },
    { id: 'mock-4', emitter: 'Distribuidora Norte', amount: '$412.00', date: '20 Nov, 2026', status: 'Validado', numCheque: 'CH-3329', icon: 'check_circle' }
  ],
  prev1: [
    { id: 'mock-5', emitter: 'Supermercados Freund', amount: '$3,200.00', date: '18 Nov, 2026', status: 'Validado', numCheque: 'CH-1122', icon: 'check_circle' },
    { id: 'mock-6', emitter: 'Logística Express', amount: '$120.00', date: '15 Nov, 2026', status: 'Liquidado', numCheque: 'CH-1123', icon: 'verified' }
  ],
  prev2: [
    { id: 'mock-7', emitter: 'Manufactura Industrial', amount: '$9,000.00', date: '09 Nov, 2026', status: 'Validado', numCheque: 'CH-0051', icon: 'check_circle' },
    { id: 'mock-8', emitter: 'Taller Hermanos', amount: '$50.00', date: '07 Nov, 2026', status: 'Rechazado', numCheque: 'CH-0052', icon: 'error' }
  ]
};

export default function HistoryPage() {
  const { theme, toggleTheme, scannedChecks } = useAppStore();
  const [activeTab, setActiveTab] = useState<'current' | 'prev1' | 'prev2'>('current');

  // Merge dynamic scannedChecks into the current week tab
  const getChecksForTab = () => {
    if (activeTab === 'current') {
      return [...scannedChecks, ...INITIAL_MOCK_CHECKS.current];
    }
    return INITIAL_MOCK_CHECKS[activeTab];
  };

  const currentList = getChecksForTab();

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
        >
          {theme === 'light' ? <Moon className="w-5 h-5 text-slate-800" /> : <Sun className="w-5 h-5 text-amber-400" />}
        </button>
      </header>

      {/* Screen Title */}
      <section className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Historial de Cheques
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-normal">
          Revisa tus depósitos recientes y estados de validación automática.
        </p>
      </section>

      {/* Weekly Filter Selector */}
      <section className="mb-6 overflow-hidden">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          
          <button 
            onClick={() => setActiveTab('current')}
            className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-left transition-all ${
              activeTab === 'current'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-850'
            }`}
          >
            <span className="block text-[8px] font-bold tracking-wider uppercase opacity-85">Esta Semana</span>
            <span className="block text-xs font-bold whitespace-nowrap mt-0.5">20 - 26 Nov</span>
          </button>

          <button 
            onClick={() => setActiveTab('prev1')}
            className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-left transition-all ${
              activeTab === 'prev1'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-850'
            }`}
          >
            <span className="block text-[8px] font-bold tracking-wider uppercase opacity-85">Anterior</span>
            <span className="block text-xs font-bold whitespace-nowrap mt-0.5">13 - 19 Nov</span>
          </button>

          <button 
            onClick={() => setActiveTab('prev2')}
            className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-left transition-all ${
              activeTab === 'prev2'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-850'
            }`}
          >
            <span className="block text-[8px] font-bold tracking-wider uppercase opacity-85">Hace 2 Semanas</span>
            <span className="block text-xs font-bold whitespace-nowrap mt-0.5">06 - 12 Nov</span>
          </button>

        </div>
      </section>

      {/* Transactions List */}
      <section className="flex-1 space-y-3.5">
        {currentList.map((check) => {
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

        {currentList.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center opacity-65">
            <ShieldAlert className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No se encontraron cheques para este período.
            </p>
          </div>
        )}
      </section>

    </div>
  );
}
