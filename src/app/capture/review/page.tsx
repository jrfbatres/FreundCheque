"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { CheckCircle2, X } from 'lucide-react';
import Image from 'next/image';

export default function ReviewCapture() {
  const router = useRouter();
  const { frontImageBase64, theme } = useAppStore();

  useEffect(() => {
    // Si no hay imagen, regresamos a la cámara
    if (!frontImageBase64) {
      router.push('/capture/front');
    }
  }, [frontImageBase64, router]);

  if (!frontImageBase64) return null;

  return (
    <div className={`h-[100dvh] w-full ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} flex flex-col overflow-hidden`}>
      
      {/* Header */}
      <header className={`shrink-0 p-4 flex items-center justify-center border-b ${theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        <h1 className="text-2xl font-black text-emerald-500 flex items-center gap-3">
          <CheckCircle2 className="w-8 h-8" /> CAPTURADO
        </h1>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto w-full p-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-sm flex flex-col gap-6">
          <p className="text-center font-medium opacity-80">
            La imagen ha sido capturada exitosamente.
          </p>

          <div className="bg-slate-800 p-2 rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-700 w-full relative aspect-[3/4]">
            <img 
              src={frontImageBase64} 
              alt="Cheque Capturado" 
              className="absolute inset-0 w-full h-full object-cover rounded-xl"
            />
          </div>
        </div>
      </main>

      {/* Bottom Actions */}
      <footer className={`shrink-0 p-4 border-t flex flex-row gap-4 ${theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        <button 
          onClick={() => router.push('/capture/front')}
          className={`flex-1 py-4 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${
            theme === 'dark' 
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          <X className="w-5 h-5" /> Volver a Tomar
        </button>
        
        <button 
          onClick={() => router.push('/')}
          className="flex-1 py-4 px-4 rounded-xl font-bold flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all"
        >
          Finalizar
        </button>
      </footer>
    </div>
  );
}
