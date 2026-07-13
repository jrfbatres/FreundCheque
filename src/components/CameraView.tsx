'use client';
import { useEffect, useRef, useState } from 'react';

interface CameraViewProps {
  onCapture: (base64: string) => void;
  isCapturing: boolean;
  onAnalyze?: (imageData: ImageData) => void;
  children?: React.ReactNode;
}

export default function CameraView({ onCapture, isCapturing, onAnalyze, children }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const hasCapturedRef = useRef(false);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasPermission(true);
      } catch (err) {
        console.error("Error accessing camera:", err);
        setHasPermission(false);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!onAnalyze || !videoRef.current || !canvasRef.current) return;
    const interval = setInterval(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && video.videoWidth > 0 && canvas) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          onAnalyze(imageData);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [onAnalyze]);

  useEffect(() => {
    if (!isCapturing) {
      hasCapturedRef.current = false;
      return;
    }

    if (isCapturing && !hasCapturedRef.current && videoRef.current && canvasRef.current) {
      hasCapturedRef.current = true;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64Image = canvas.toDataURL('image/jpeg', 0.85);
        onCapture(base64Image);
      }
    }
  }, [isCapturing, onCapture]);

  if (hasPermission === false) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-900 text-red-400 p-6 text-center">
        No se pudo acceder a la cámara. Revisa los permisos en tu navegador.
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      <video 
        ref={videoRef}
        autoPlay 
        playsInline 
        muted 
        className="absolute inset-0 w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />
      <div className="absolute inset-0 pointer-events-none">
        {children}
      </div>
    </div>
  );
}
