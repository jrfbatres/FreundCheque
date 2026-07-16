"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { CheckCircle2, XCircle, X, Check, User, Coins, Landmark, ArrowRight, Camera, AlertCircle, Sun, Moon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function ReviewCapture() {
  const router = useRouter();
  const { frontImageBase64, theme, toggleTheme, addScannedCheck, selectedClient, azureApiKey, azureEndpoint, scannedChecks } = useAppStore();

  const handleFinalize = () => {
    if (!allValid) return;
    
    // Add to scanned checks
    addScannedCheck({
      id: Math.random().toString(36).substring(2, 11),
      emitter: emisor || selectedClient?.name || 'Cliente Desconocido',
      amount: `$${parseFloat(monto).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      date: fecha,
      status: 'Validado',
      numCheque: numeroSerie || 'CH-XXXX',
      icon: 'check_circle',
      beneficiario: beneficiario || '',
      banco: banco || '',
      cuenta: cuenta || '',
      lineaMICR: lineaMICR || '',
      cliente: selectedClient,
      montoLetras: montoLetras || ''
    });

    // Save summary data to sessionStorage
    const summaryData = {
      fecha,
      monto: parseFloat(monto),
      montoLetras,
      banco,
      cuenta,
      numeroSerie,
      emisor,
      beneficiario,
      lineaMICR,
      cliente: selectedClient
    };
    sessionStorage.setItem('freund_cheque_summary', JSON.stringify(summaryData));
    
    router.push('/capture/search-client');
  };

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // AI Extracted Data
  const [fecha, setFecha] = useState('');
  const [monto, setMonto] = useState('');
  const [montoLetras, setMontoLetras] = useState('');
  const [banco, setBanco] = useState('');
  const [cuenta, setCuenta] = useState('');
  const [emisor, setEmisor] = useState('');
  const [beneficiario, setBeneficiario] = useState('');
  const [numeroSerie, setNumeroSerie] = useState('');
  const [lineaMICR, setLineaMICR] = useState('');
  
  const [montosCoinciden, setMontosCoinciden] = useState(false);
  const [esCheque, setEsCheque] = useState<boolean | null>(null);

  const [isFinished, setIsFinished] = useState(false);

  // Validaciones
  const vMonto = !isNaN(parseFloat(monto)) && parseFloat(monto) > 0;
  const vEmisor = emisor.length > 2;
  const vBeneficiario = beneficiario.length > 2;
  const vBanco = banco.length > 2;
  const vCuenta = cuenta.length > 2;
  const vMontosCoinciden = montosCoinciden;
  const vNumeroSerie = numeroSerie.length > 0;

  // Lógica de Validación de Fecha: No menor a 3 meses ni superior a 15 días
  const [isFechaValid, setIsFechaValid] = useState(false);
  const [fechaErrorMsg, setFechaErrorMsg] = useState('');

  useEffect(() => {
    if (!fecha) {
      setIsFechaValid(false);
      setFechaErrorMsg('');
      return;
    }

    const parts = fecha.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      
      const checkDate = new Date(year, month, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Calcular fecha hace 3 meses
      const minDate = new Date(today);
      minDate.setMonth(minDate.getMonth() - 3);

      // Calcular fecha 15 días en el futuro
      const maxDate = new Date(today);
      maxDate.setDate(maxDate.getDate() + 15);

      if (checkDate < minDate) {
        setIsFechaValid(false);
        setFechaErrorMsg('El cheque expiró hace más de 3 meses');
      } else if (checkDate > maxDate) {
        setIsFechaValid(false);
        setFechaErrorMsg('El cheque tiene fecha superior a 15 días');
      } else {
        setIsFechaValid(true);
        setFechaErrorMsg('');
      }
    } else {
      setIsFechaValid(false);
      setFechaErrorMsg('Formato incorrecto (use DD/MM/YYYY)');
    }
  }, [fecha]);

  const allValid = vMonto && vEmisor && vBeneficiario && vBanco && vCuenta && vNumeroSerie && vMontosCoinciden && isFechaValid && esCheque === true;

  const finalData = {
    fecha,
    monto,
    montoLetras,
    banco,
    cuenta,
    numeroSerie,
    emisor,
    beneficiario,
    lineaMICR,
    montosCoinciden,
    esCheque,
    estado: 'VALIDO',
    timestamp: new Date().toISOString()
  };

  useEffect(() => {
    if (!frontImageBase64) {
      router.push('/capture/front');
      return;
    }

    const processImage = async () => {
      try {
        setIsLoading(true);
        setErrorMsg('');
        
        const res = await fetch('/api/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            imageBase64: frontImageBase64,
            azureApiKey,
            azureEndpoint
          })
        });
        
        const json = await res.json();
        
        if (!res.ok) throw new Error(json.error || 'Error procesando la imagen');
        
        const aiData = json.data;
        if (aiData) {
          // Coerción estricta de booleano en caso de que Gemini devuelva string "false"
          const checkStatus = aiData.esCheque === true || aiData.esCheque === "true";
          
          if (!checkStatus) {
            setEsCheque(false);
            return;
          }

          setEsCheque(true);
          setFecha(aiData.fecha || '');
          setMonto(aiData.monto || '');
          setMontoLetras(aiData.montoLetras || '');
          setBanco(aiData.banco || '');
          setCuenta(aiData.cuenta || '');
          setNumeroSerie(aiData.numeroSerie || '');
          setEmisor(aiData.emisor || '');
          setBeneficiario(aiData.beneficiario || '');
          setLineaMICR(aiData.lineaMICR || '');
          setMontosCoinciden(aiData.montosCoinciden === true || aiData.montosCoinciden === "true");
        }
      } catch (err: any) {
        console.error("AI Error:", err);
        setErrorMsg(err.message || 'Error analizando imagen');
      } finally {
        setIsLoading(false);
      }
    };

    processImage();
  }, [frontImageBase64]);

  const StatusIcon = ({ valid }: { valid: boolean }) => {
    return valid ? (
      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
    ) : (
      <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center shrink-0">
        <X className="w-3 h-3 text-white" />
      </div>
    );
  };

  if (!frontImageBase64) return null;

  if (isFinished) {
    return (
      <div className={`h-[100dvh] w-full ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} flex flex-col overflow-hidden`}>
        <header className={`shrink-0 p-3 flex items-center justify-between border-b ${theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
          <h1 className="text-lg font-bold text-emerald-500 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" /> Proceso Finalizado
          </h1>
        </header>
        <main className="flex-1 overflow-y-auto w-full p-4">
          <div className="max-w-2xl mx-auto flex flex-col gap-4">
            <p className="text-sm opacity-80">
              Datos guardados con éxito.
            </p>
            <div className={`rounded-xl p-4 overflow-x-auto text-xs font-mono shadow-inner border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-300'}`}>
              <pre className="break-all whitespace-pre-wrap">
                {JSON.stringify(finalData, null, 2)}
              </pre>
            </div>
          </div>
        </main>
        <footer className={`shrink-0 p-3 border-t flex ${theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
          <button onClick={() => router.push('/')} className="flex-1 py-3 px-4 rounded-lg font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all">
            Volver al Inicio
          </button>
        </footer>
      </div>
    );
  }

  if (esCheque === false) {
    return (
      <div className={`h-[100dvh] w-full ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} flex flex-col items-center justify-center p-6 text-center`}>
        <div className="bg-red-500/20 p-6 rounded-full mb-6 border-4 border-red-500">
          <XCircle className="w-16 h-16 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold mb-4">No es un cheque (o falta palabra CHEQUE)</h1>
        <p className="opacity-80 mb-8 max-w-sm">
          La imagen capturada fue rechazada. Asegúrese de que el documento tenga impresa la palabra "CHEQUE" y vuelva a intentarlo.
        </p>
        <button onClick={() => router.push('/capture/front')} className="py-4 px-8 rounded-full font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all w-full max-w-sm">
          Volver a Tomar
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full ${theme === 'dark' ? 'bg-slate-950 text-slate-150' : 'bg-slate-50 text-slate-900'} flex flex-col pb-20`}>
      
      {/* Header */}
      <header className="shrink-0 px-6 py-4 flex items-center justify-between">
        <div className="relative w-24 h-8">
          <Image 
            src={theme === 'dark' ? '/logoFreundOscuro3.png' : '/logoFreund2.png'} 
            alt="Freund Logo" 
            fill
            sizes="96px"
            className="object-contain"
          />
        </div>
        <button 
          onClick={toggleTheme}
          aria-label="Toggle light/dark mode"
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
        >
          {theme === 'light' ? <Moon className="w-5 h-5 text-slate-800" /> : <Sun className="w-5 h-5 text-amber-400" />}
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 w-full px-6 max-w-md mx-auto">
        <div className="flex flex-col gap-6 relative">
          
          {isLoading && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm rounded-xl">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mb-4"></div>
              <p className="text-white font-bold animate-pulse text-lg">Analizando campos...</p>
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-500/20 border border-red-500 text-red-100 p-3 rounded-lg text-sm mb-2 text-center font-semibold">
              {errorMsg}
            </div>
          )}



          {/* Screen Title */}
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Verificación de Datos</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Confirme que la información extraída del cheque sea correcta antes de continuar.
            </p>
          </div>

          {/* Scanned Check Image (Always Shown) */}
          <div className="bg-slate-850 dark:bg-slate-900 rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-800 shrink-0">
            <div className="relative w-full aspect-[21/9] bg-black">
              <img src={frontImageBase64} alt="Cheque Escaneado" className="absolute inset-0 w-full h-full object-contain" />
            </div>
            
            {/* MICR underneath check image */}
            {!isLoading && lineaMICR && (
              <div className="bg-slate-900 text-emerald-400 p-3 text-center border-t border-slate-800">
                <span className="text-[9px] uppercase tracking-widest text-slate-400 block mb-1">Línea MICR Extraída</span>
                <span className="font-mono text-xs tracking-wider">{lineaMICR}</span>
              </div>
            )}
          </div>

          {/* Form Content - Cards */}
          <div className="flex flex-col gap-4">
            
            {/* 1. PARTICIPANTES Card */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-850 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-850">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                  <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Participantes</span>
                </div>
              </div>

              {/* Emisor */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 dark:text-slate-450 uppercase font-semibold">Emisor</span>
                  <StatusIcon valid={vEmisor} />
                </div>
                <input 
                  type="text" 
                  value={emisor} 
                  onChange={(e) => setEmisor(e.target.value)} 
                  className="w-full bg-transparent border-b border-transparent hover:border-slate-200 dark:hover:border-slate-800 focus:border-blue-500 dark:focus:border-blue-550 py-1 font-bold text-slate-900 dark:text-white text-base outline-none focus:ring-0 transition-all p-0" 
                />
              </div>

              {/* Beneficiario */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 dark:text-slate-450 uppercase font-semibold">Beneficiario</span>
                  <StatusIcon valid={vBeneficiario} />
                </div>
                <input 
                  type="text" 
                  value={beneficiario} 
                  onChange={(e) => setBeneficiario(e.target.value)} 
                  className="w-full bg-transparent border-b border-transparent hover:border-slate-200 dark:hover:border-slate-800 focus:border-blue-500 dark:focus:border-blue-550 py-1 font-bold text-slate-900 dark:text-white text-base outline-none focus:ring-0 transition-all p-0" 
                />
              </div>
            </div>

            {/* 2. MONTOS Y FECHA Card */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-850 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-850">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                  <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Montos y Fecha</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Monto Numérico */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 dark:text-slate-450 uppercase font-semibold">Monto en números</span>
                    <StatusIcon valid={vMonto} />
                  </div>
                  <div className="flex items-center">
                    <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-xl mr-0.5">$</span>
                    <input 
                      type="text" 
                      value={monto} 
                      onChange={(e) => setMonto(e.target.value)} 
                      className="w-full bg-transparent border-b border-transparent hover:border-slate-200 dark:hover:border-slate-800 focus:border-blue-500 dark:focus:border-blue-550 py-1 font-extrabold text-emerald-600 dark:text-emerald-400 text-xl outline-none focus:ring-0 transition-all p-0" 
                    />
                  </div>
                </div>

                {/* Fecha */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 dark:text-slate-450 uppercase font-semibold">Fecha</span>
                    <StatusIcon valid={isFechaValid} />
                  </div>
                  <input 
                    type="text" 
                    value={fecha} 
                    onChange={(e) => setFecha(e.target.value)} 
                    className="w-full bg-transparent border-b border-transparent hover:border-slate-200 dark:hover:border-slate-800 focus:border-blue-500 dark:focus:border-blue-550 py-1 font-bold text-slate-900 dark:text-white text-base outline-none focus:ring-0 transition-all p-0" 
                  />
                  {!isFechaValid && fechaErrorMsg && (
                    <span className="text-[9px] text-red-500 font-bold block mt-0.5">* {fechaErrorMsg}</span>
                  )}
                </div>
              </div>

              {/* Monto en Letras */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 dark:text-slate-450 uppercase font-semibold">Monto en letras</span>
                  <StatusIcon valid={vMontosCoinciden} />
                </div>
                <input 
                  type="text" 
                  value={montoLetras} 
                  readOnly 
                  className="w-full bg-transparent border-b border-transparent py-1 font-semibold italic text-slate-700 dark:text-slate-350 text-xs outline-none focus:ring-0 p-0 cursor-default opacity-85" 
                />
                {!vMontosCoinciden && (
                  <span className="text-[9px] text-red-500 font-bold block mt-0.5">* El monto numérico y letras difieren.</span>
                )}
              </div>
            </div>

            {/* 3. DATOS BANCARIOS Card */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-850 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-850">
                <div className="flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                  <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Datos Bancarios</span>
                </div>
              </div>

              {/* Banco */}
              <div className="flex justify-between items-center py-1">
                <div className="flex items-center gap-1.5">
                  <StatusIcon valid={vBanco} />
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Nombre del banco</span>
                </div>
                <input 
                  type="text" 
                  value={banco} 
                  onChange={(e) => setBanco(e.target.value)} 
                  className="bg-transparent border-b border-transparent hover:border-slate-200 dark:hover:border-slate-800 focus:border-blue-500 dark:focus:border-blue-550 py-1 font-bold text-slate-900 dark:text-white text-sm outline-none focus:ring-0 p-0 text-right max-w-[160px]" 
                />
              </div>

              {/* Cuenta */}
              <div className="flex justify-between items-center py-1">
                <div className="flex items-center gap-1.5">
                  <StatusIcon valid={vCuenta} />
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Cuenta</span>
                </div>
                <input 
                  type="text" 
                  value={cuenta} 
                  onChange={(e) => setCuenta(e.target.value)} 
                  className="bg-transparent border-b border-transparent hover:border-slate-200 dark:hover:border-slate-800 focus:border-blue-500 dark:focus:border-blue-550 py-1 font-mono text-slate-900 dark:text-white text-sm outline-none focus:ring-0 p-0 text-right max-w-[160px]" 
                />
              </div>

              {/* Número de Cheque */}
              <div className="flex justify-between items-center py-1">
                <div className="flex items-center gap-1.5">
                  <StatusIcon valid={vNumeroSerie} />
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Número de cheque</span>
                </div>
                <div className="flex items-center justify-end">
                  <span className="text-slate-500 mr-0.5 font-mono text-sm">#</span>
                  <input 
                    type="text" 
                    value={numeroSerie} 
                    onChange={(e) => setNumeroSerie(e.target.value)} 
                    className="bg-transparent border-b border-transparent hover:border-slate-200 dark:hover:border-slate-800 focus:border-blue-500 dark:focus:border-blue-550 py-1 font-mono font-bold text-slate-900 dark:text-white text-sm outline-none focus:ring-0 p-0 text-right max-w-[140px]" 
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Action Buttons Stacked */}
          <div className="flex flex-col gap-3 mt-4 pt-4">
            <button 
              onClick={handleFinalize}
              disabled={!allValid}
              className={`w-full h-12 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                allValid 
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md cursor-pointer hover:opacity-90' 
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-650 cursor-not-allowed opacity-50'
              }`}
            >
              Continuar
              <ArrowRight className="w-4 h-4" />
            </button>

            <button 
              onClick={() => router.push('/capture/front')}
              className="w-full h-12 rounded-xl border border-slate-350 dark:border-slate-750 text-slate-750 dark:text-slate-300 font-bold flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all bg-transparent"
            >
              <Camera className="w-4 h-4" />
              Retomar fotografía
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
