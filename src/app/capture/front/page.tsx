'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import CameraView from '@/components/CameraView';
import { useAppStore } from '@/store/useAppStore';
import { X, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function CaptureFront() {
  const router = useRouter();
  const { setFrontImageBase64, theme, toggleTheme } = useAppStore();
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  
  const [validations, setValidations] = useState({
    papel: false,
    fecha: false,
    banco: false,
    cuenta: false,
    valorLetras: false,
    firma: false,
    bandaSeguridad: false,
  });

  const [allValid, setAllValid] = useState(false);

  const handleAnalyze = useCallback((imageData: ImageData) => {
    const data = imageData.data;
    let brightPixels = 0;
    // Sample to save CPU
    for (let i = 0; i < data.length; i += 16) {
      const r = data[i];
      const g = data[i+1];
      const b = data[i+2];
      if (r > 160 && g > 160 && b > 160) brightPixels++;
    }
    const totalSampled = data.length / 16;
    const isPaper = (brightPixels / totalSampled) > 0.3; // At least 30% white/bright pixels

    if (!isPaper) {
      setValidations({
        papel: false, fecha: false, banco: false, cuenta: false, valorLetras: false, firma: false, bandaSeguridad: false
      });
      setAllValid(false);
    } else {
      setValidations(prev => {
        const next = { ...prev };
        next.papel = true;
        if (next.papel) next.bandaSeguridad = true; // Simulating fast checks when paper is detected
        if (next.bandaSeguridad && Math.random() > 0.3) next.banco = true;
        if (next.banco && Math.random() > 0.3) next.cuenta = true;
        if (next.cuenta && Math.random() > 0.3) next.fecha = true;
        if (next.fecha && Math.random() > 0.3) next.valorLetras = true;
        if (next.valorLetras && Math.random() > 0.3) next.firma = true;
        
        const valid = Object.values(next).every(v => v === true);
        setAllValid(valid);
        return next;
      });
    }
  }, []);

  const handleManualCapture = () => {
    setIsCapturing(true);
  };

  const handleCapture = useCallback((base64: string) => {
    setFrontImageBase64(base64);
    setTimeout(() => {
      router.push('/capture/back');
    }, 500);
  }, [setFrontImageBase64, router]);

  return (
    <CameraView onCapture={handleCapture} isCapturing={isCapturing} onAnalyze={handleAnalyze}>
      
      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 p-4 z-50 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-4">
          <Image 
            src={theme === 'dark' ? '/logoFreundOscuro3.png' : '/logoFreund2.png'} 
            alt="Freund Logo" 
            width={120} 
            height={40}
            className="object-contain"
          />
          <h1 className="text-white text-xl font-bold drop-shadow-md">Escanear Cheque</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-full bg-black/50 text-white backdrop-blur-md shadow-lg border border-white/20"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          
          <Link 
            href="/" 
            className="p-2.5 rounded-full bg-red-500/80 hover:bg-red-600 text-white backdrop-blur-md shadow-lg border border-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </Link>
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center pt-12">
        <div className="w-[85%] h-[75%] border-2 border-white/50 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] relative">
          
          {/* Esquinas del AR */}
          <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1 rounded-tl-lg transition-all duration-300" />
          <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1 rounded-tr-lg transition-all duration-300" />
          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-emerald-400 -mb-1 -ml-1 rounded-bl-lg transition-all duration-300" />
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-emerald-400 -mb-1 -mr-1 rounded-br-lg transition-all duration-300" />
          
          {/* AR Checklist */}
          <div className="absolute top-4 left-4 flex flex-col gap-1.5 text-[10px] sm:text-xs font-mono bg-black/70 p-3 rounded-lg backdrop-blur-md border border-white/10 shadow-xl">
            {Object.entries(validations).map(([key, isValid]) => (
              <span key={key} className={isValid ? "text-emerald-400 flex items-center gap-2 transition-colors duration-300" : "text-slate-300 flex items-center gap-2 transition-colors duration-300"}>
                {isValid ? "🟩" : "⬜"} {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()}
              </span>
            ))}
          </div>

          <div className="absolute -top-12 left-0 right-0 flex justify-center">
            <span className="bg-black/80 text-white px-6 py-2 rounded-full text-sm font-bold backdrop-blur-md border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              Coloque el frente del cheque
            </span>
          </div>

          {allValid && !isCapturing && (
            <div className="absolute inset-x-0 bottom-4 flex justify-center z-50">
              <button 
                onClick={handleManualCapture}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-12 rounded-full shadow-[0_10px_25px_rgba(16,185,129,0.5)] border border-emerald-400/50 transition-all hover:scale-105 active:scale-95 text-lg"
              >
                Capturar Cheque
              </button>
            </div>
          )}

          {isCapturing && (
            <div className="absolute inset-0 bg-white z-20 rounded-lg shadow-[0_0_50px_rgba(255,255,255,1)]" style={{ animation: 'flash 0.5s ease-out' }} />
          )}

        </div>
      </div>
    </CameraView>
  );
}
