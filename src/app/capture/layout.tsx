'use client';
import { useEffect, useState } from 'react';
import { Smartphone } from 'lucide-react';

import { usePathname } from 'next/navigation';

export default function CaptureLayout({ children }: { children: React.ReactNode }) {
  const [isPortrait, setIsPortrait] = useState(true);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (!mounted) return null;

  const isCameraPage = pathname === '/capture/front' || pathname === '/capture/back';

  if (isPortrait && isCameraPage) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 text-white p-6 text-center">
        <div className="mb-8 animate-spin" style={{ animationDuration: '3s' }}>
          <Smartphone className="w-20 h-20 rotate-90 text-blue-500" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Gire su dispositivo</h1>
        <p className="text-slate-400 max-w-sm text-lg">
          Para una mejor precisión coloque el teléfono en posición horizontal para habilitar la cámara.
        </p>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-50 ${isCameraPage ? 'bg-black overflow-hidden' : 'overflow-y-auto'}`}>
      {children}
    </div>
  );
}
