'use client';
import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import CameraView from '@/components/CameraView';
import { useAppStore } from '@/store/useAppStore';
import { X, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function CaptureFront() {
  const router = useRouter();
  const { setFrontImageBase64, theme, toggleTheme, selectedClient } = useAppStore();
  const [isCapturing, setIsCapturing] = useState(false);
  
  const [validations, setValidations] = useState({
    papel: false,
    iluminacion: false,
    bandaMICR: false
  });

  const [allValid, setAllValid] = useState(false);
  const isRecognizingRef = useRef(false);

  const handleAnalyze = useCallback(async (canvas: HTMLCanvasElement) => {
    // Avoid running analysis if it's already processing a frame
    if (isRecognizingRef.current || allValid) return;
    isRecognizingRef.current = true;

    try {
      const context = canvas.getContext('2d');
      if (!context) return;

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const width = imageData.width;
      const height = imageData.height;
      
      let centerBrightPixels = 0;
      let edgeDarkPixels = 0;
      let micrDarkPixels = 0;
      let centerTotal = 0;
      let edgeTotal = 0;
      let micrTotal = 0;

      for (let y = 0; y < height; y += 10) {
        for (let x = 0; x < width; x += 10) {
          const i = (y * width + x) * 4;
          const r = data[i];
          const g = data[i+1];
          const b = data[i+2];
          
          const brightness = (r + g + b) / 3;
          
          const isEdge = x < width * 0.1 || x > width * 0.9 || y < height * 0.1 || y > height * 0.9;
          const isMicrZone = y > height * 0.70 && y < height * 0.85 && x > width * 0.1 && x < width * 0.9;
          
          if (isEdge) {
            edgeTotal++;
            if (brightness < 120) edgeDarkPixels++;
          } else {
            centerTotal++;
            if (brightness > 150) centerBrightPixels++;
          }

          if (isMicrZone) {
            micrTotal++;
            if (brightness < 100) micrDarkPixels++;
          }
        }
      }

      const centerIsPaper = (centerBrightPixels / centerTotal) > 0.4; 
      const edgeIsDark = (edgeDarkPixels / edgeTotal) > 0.3;
      const micrDetectado = micrTotal > 0 ? (micrDarkPixels / micrTotal) > 0.04 : false; // Al menos 4% de tinta oscura en la zona MICR

      const papelDetectado = centerIsPaper && edgeIsDark;
      const iluminacionOk = (centerBrightPixels / centerTotal) > 0.2; // Al menos un 20% brillante

      setValidations({
        papel: papelDetectado,
        iluminacion: iluminacionOk,
        bandaMICR: micrDetectado
      });

      if (papelDetectado && iluminacionOk && micrDetectado) {
        setAllValid(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      isRecognizingRef.current = false;
    }
  }, [allValid]);

  const handleManualCapture = () => {
    setIsCapturing(true);
  };

  const handleCapture = useCallback((base64: string) => {
    setFrontImageBase64(base64);
    setTimeout(() => {
      router.push('/capture/review');
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
          <h1 className="text-white text-sm sm:text-base font-bold drop-shadow-md">
            {selectedClient ? `Abonar a: ${selectedClient.name}` : 'Escanear Cheque'}
          </h1>
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

      <div className="absolute inset-0 flex items-center justify-center pt-12 pointer-events-none">
        <div className="w-[85%] h-[75%] border-2 border-white/50 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] relative">
          
          {!isCapturing && (
            <>
              {/* Esquinas del AR */}
              <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1 rounded-tl-lg transition-all duration-300" />
              <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1 rounded-tr-lg transition-all duration-300" />
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-emerald-400 -mb-1 -ml-1 rounded-bl-lg transition-all duration-300" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-emerald-400 -mb-1 -mr-1 rounded-br-lg transition-all duration-300" />
              
              {/* AR Target MICR */}
              <div className="absolute bottom-6 left-6 right-6 h-12 border-2 border-dashed border-emerald-400/50 rounded flex items-center justify-center bg-emerald-500/10 pointer-events-none transition-all duration-500">
                <span className="text-emerald-300/80 text-[10px] font-mono font-bold tracking-widest uppercase">
                  Alinear Banda Inferior MICR Aquí
                </span>
              </div>

              {/* AR Checklist Simplificado */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 text-[10px] sm:text-xs font-mono bg-black/70 p-3 rounded-lg backdrop-blur-md border border-white/10 shadow-xl pointer-events-auto">
                {Object.entries(validations).map(([key, isValid]) => (
                  <span key={key} className={isValid ? "text-emerald-400 flex items-center gap-2 transition-colors duration-300" : "text-slate-300 flex items-center gap-2 transition-colors duration-300"}>
                    {isValid ? "🟩" : "⬜"} {key.charAt(0).toUpperCase() + key.slice(1)}
                  </span>
                ))}
              </div>

              <div className="absolute -top-12 left-0 right-0 flex justify-center pointer-events-auto">
                <span className="bg-black/80 text-white px-6 py-2 rounded-full text-sm font-bold backdrop-blur-md border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  {allValid ? '¡Listo para capturar!' : 'Encuadre el cheque'}
                </span>
              </div>
            </>
          )}

          {allValid && !isCapturing && (
            <div className="absolute inset-x-0 bottom-4 flex justify-center z-50 pointer-events-auto">
              <button 
                onClick={handleManualCapture}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-12 rounded-full shadow-[0_10px_25px_rgba(16,185,129,0.5)] border border-emerald-400/50 transition-all hover:scale-105 active:scale-95 text-lg"
              >
                Capturar Cheque
              </button>
            </div>
          )}

          {isCapturing && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md rounded-lg pointer-events-none">
              <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-emerald-400 mb-6 shadow-lg shadow-emerald-500/20"></div>
              <p className="text-white font-black text-2xl tracking-wide mb-2 text-center px-4 animate-pulse uppercase drop-shadow-md">
                ¡No mueva el celular!
              </p>
              <p className="text-emerald-100/90 font-medium text-sm text-center px-4 animate-pulse">
                Procesando imagen con IA...
              </p>
            </div>
          )}
          {isCapturing && (
            <div className="absolute inset-0 bg-white z-20 rounded-lg shadow-[0_0_50px_rgba(255,255,255,1)] pointer-events-none" style={{ animation: 'flash 0.5s ease-out' }} />
          )}

        </div>
      </div>
    </CameraView>
  );
}
