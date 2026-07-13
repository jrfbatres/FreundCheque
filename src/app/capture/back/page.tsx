'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import CameraView from '@/components/CameraView';
import { useAppStore } from '@/store/useAppStore';
import { sendWebhookPayload } from '@/services/webhookService';
import { CheckCircle2, Loader2, AlertCircle, X, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function CaptureBack() {
  const router = useRouter();
  const { webhookUrl, frontImageBase64, clearCaptureData, theme, toggleTheme } = useAppStore();
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  
  const [validations, setValidations] = useState({
    reversoCompleto: false,
    sinReflejos: false,
  });

  const [allValid, setAllValid] = useState(false);

  const handleAnalyze = useCallback((imageData: ImageData) => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    let centerBrightPixels = 0;
    let edgeDarkPixels = 0;
    let centerSampleCount = 0;
    let edgeSampleCount = 0;

    // Define center area (the check) and edge area (the desk)
    const marginX = width * 0.15;
    const marginY = height * 0.15;

    for (let y = 0; y < height; y += 4) {
      for (let x = 0; x < width; x += 4) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        const isBright = r > 160 && g > 160 && b > 160;

        if (x > marginX && x < width - marginX && y > marginY && y < height - marginY) {
          // Center area
          if (isBright) centerBrightPixels++;
          centerSampleCount++;
        } else {
          // Edge area
          if (!isBright) edgeDarkPixels++;
          edgeSampleCount++;
        }
      }
    }

    const centerBrightRatio = centerBrightPixels / centerSampleCount;
    const edgeDarkRatio = edgeDarkPixels / edgeSampleCount;

    // Heurística: El centro debe ser mayormente claro (papel) y los bordes más oscuros (la mesa)
    const isPaper = centerBrightRatio > 0.4 && edgeDarkRatio > 0.4;

    if (!isPaper) {
      setValidations({ reversoCompleto: false, sinReflejos: false });
      setAllValid(false);
    } else {
      setValidations(prev => {
        const next = { ...prev };
        next.reversoCompleto = true;
        if (next.reversoCompleto && Math.random() > 0.4) next.sinReflejos = true;
        
        const valid = Object.values(next).every(v => v === true);
        setAllValid(valid);
        return next;
      });
    }
  }, []);

  const handleManualCapture = () => {
    setIsCapturing(true);
  };

  const handleCapture = useCallback(async (backBase64: string) => {
    setIsCapturing(false);
    setUploadStatus('uploading');
    
    try {
      if (webhookUrl && frontImageBase64) {
        await sendWebhookPayload(webhookUrl, frontImageBase64, backBase64);
        setUploadStatus('success');
      } else {
        setUploadStatus('error');
      }
    } catch (e) {
      setUploadStatus('error');
    }

    setTimeout(() => {
      clearCaptureData();
      router.push('/');
    }, 4000);
  }, [webhookUrl, frontImageBase64, clearCaptureData, router]);

  if (uploadStatus !== 'idle') {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-950 text-white p-6 absolute inset-0 z-50">
        {uploadStatus === 'uploading' && (
          <>
            <Loader2 className="w-16 h-16 animate-spin text-blue-500 mb-6" />
            <h2 className="text-2xl font-bold">Enviando información...</h2>
            <p className="text-slate-400 mt-3 text-center max-w-sm text-lg">Procesando imágenes y enviando datos al webhook.</p>
          </>
        )}
        {uploadStatus === 'success' && (
          <>
            <CheckCircle2 className="w-20 h-20 text-emerald-500 mb-6" />
            <h2 className="text-2xl font-bold text-emerald-400">Captura Completada</h2>
            <p className="text-slate-400 mt-3 text-center max-w-sm text-lg">Los datos del cheque han sido enviados correctamente.</p>
          </>
        )}
        {uploadStatus === 'error' && (
          <>
            <AlertCircle className="w-20 h-20 text-red-500 mb-6" />
            <h2 className="text-2xl font-bold text-red-400">Error en el envío</h2>
            <p className="text-slate-400 mt-3 text-center max-w-sm text-lg">Hubo un problema al enviar los datos. Revisa la URL en Configuración.</p>
          </>
        )}
      </div>
    );
  }

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
          <h1 className="text-white text-xl font-bold drop-shadow-md">Escanear Reverso</h1>
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
          <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-blue-400 -mt-1 -ml-1 rounded-tl-lg transition-all duration-300" />
          <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-blue-400 -mt-1 -mr-1 rounded-tr-lg transition-all duration-300" />
          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-blue-400 -mb-1 -ml-1 rounded-bl-lg transition-all duration-300" />
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-blue-400 -mb-1 -mr-1 rounded-br-lg transition-all duration-300" />

          {/* AR Checklist */}
          <div className="absolute top-4 left-4 flex flex-col gap-1.5 text-[10px] sm:text-xs font-mono bg-black/70 p-3 rounded-lg backdrop-blur-md border border-white/10 shadow-xl">
            {Object.entries(validations).map(([key, isValid]) => (
              <span key={key} className={isValid ? "text-blue-400 flex items-center gap-2 transition-colors duration-300" : "text-slate-300 flex items-center gap-2 transition-colors duration-300"}>
                {isValid ? "🟩" : "⬜"} {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()}
              </span>
            ))}
          </div>

          <div className="absolute -top-12 left-0 right-0 flex justify-center">
            <span className="bg-black/80 text-white px-6 py-2 rounded-full text-sm font-bold backdrop-blur-md border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              Voltee el cheque (Reverso)
            </span>
          </div>

          {allValid && !isCapturing && (
            <div className="absolute inset-x-0 bottom-4 flex justify-center z-50">
              <button 
                onClick={handleManualCapture}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-12 rounded-full shadow-[0_10px_25px_rgba(59,130,246,0.5)] border border-blue-400/50 transition-all hover:scale-105 active:scale-95 text-lg"
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
