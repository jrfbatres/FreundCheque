'use client';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { Check, X, Edit3, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function ReviewCapture() {
  const router = useRouter();
  const { frontImageBase64, extractedText, setExtractedText, theme } = useAppStore();

  if (!frontImageBase64) {
    if (typeof window !== 'undefined') router.push('/capture/front');
    return null;
  }

  return (
    <div className={`h-[100dvh] w-full ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'} flex flex-col overflow-hidden`}>
      
      {/* Header */}
      <header className={`shrink-0 p-3 flex items-center justify-between border-b ${theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        <div className="flex items-center gap-3">
          <Image 
            src={theme === 'dark' ? '/logoFreundOscuro3.png' : '/logoFreund2.png'} 
            alt="Freund Logo" 
            width={100} 
            height={30}
            className="object-contain"
          />
        </div>
        <h1 className="text-lg font-bold">Revisión</h1>
      </header>

      {/* Content - Responsive Grid for Landscape */}
      <main className="flex-1 p-4 overflow-y-auto w-full">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-6 h-full">
          
          {/* Left/Top: Image */}
          <div className="w-full sm:w-1/2 flex flex-col gap-2">
            <div className="bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-700">
              <div className="p-2 bg-slate-700 font-semibold text-slate-200 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                Frente del Cheque
              </div>
              <div className="relative w-full aspect-[21/9] bg-black">
                <img 
                  src={frontImageBase64} 
                  alt="Cheque Escaneado" 
                  className="absolute inset-0 w-full h-full object-contain"
                />
              </div>
            </div>
          </div>

          {/* Right/Bottom: Text */}
          <div className="w-full sm:w-1/2 flex flex-col gap-2 h-full">
            <div className="flex items-center gap-2 mb-1">
              <Edit3 className={`w-4 h-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              <h2 className="text-base font-bold">Datos Extraídos (OCR)</h2>
            </div>
            
            <textarea
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              className={`flex-1 w-full min-h-[120px] p-3 rounded-xl border font-mono text-sm shadow-inner focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none transition-all ${
                theme === 'dark' 
                  ? 'bg-slate-900 border-slate-700 text-emerald-400' 
                  : 'bg-white border-slate-300 text-emerald-700'
              }`}
              placeholder="No se encontró texto en el cheque..."
            />
          </div>

        </div>
      </main>

      {/* Bottom Actions */}
      <footer className={`shrink-0 p-3 border-t flex flex-row gap-3 ${theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        <Link 
          href="/capture/front"
          className={`flex-1 py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors ${
            theme === 'dark' 
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          <X className="w-5 h-5" /> Volver a tomar
        </Link>
        
        <Link 
          href="/capture/back"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02]"
        >
          Continuar al Reverso <ArrowRight className="w-5 h-5" />
        </Link>
      </footer>
    </div>
  );
}
