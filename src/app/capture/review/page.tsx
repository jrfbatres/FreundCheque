"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { CheckCircle2, XCircle, X, Check } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function ReviewCapture() {
  const router = useRouter();
  const { frontImageBase64, theme, addScannedCheck, selectedClient } = useAppStore();

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
      icon: 'check_circle'
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
    
    router.push('/capture/summary');
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
          body: JSON.stringify({ imageBase64: frontImageBase64 })
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
    <div className={`h-[100dvh] w-full ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} flex flex-col overflow-hidden`}>
      
      {/* Header */}
      <header className={`shrink-0 p-3 flex items-center justify-between border-b ${theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        <Image src={theme === 'dark' ? '/logoFreundOscuro3.png' : '/logoFreund2.png'} alt="Freund Logo" width={100} height={30} className="object-contain" />
        <h1 className="text-lg font-bold">Validación Inteligente</h1>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto w-full p-4">
        <div className="max-w-xl mx-auto flex flex-col gap-4 relative">
          
          {isLoading && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm rounded-xl border border-slate-700">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mb-4"></div>
              <p className="text-white font-bold animate-pulse text-lg">Analizando campos...</p>
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-500/20 border border-red-500 text-red-100 p-3 rounded-lg text-sm mb-2 text-center font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Imagen Escaneada */}
          <div className="bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-700 shrink-0">
            <div className="relative w-full aspect-[21/9] bg-black">
              <img src={frontImageBase64} alt="Cheque Escaneado" className="absolute inset-0 w-full h-full object-contain" />
            </div>
            
            {/* MICR debajo de la imagen */}
            {!isLoading && lineaMICR && (
              <div className="bg-slate-900 text-emerald-400 p-3 text-center border-t border-slate-700">
                <span className="text-xs uppercase text-slate-400 block mb-1">Línea MICR Extraída</span>
                <span className="font-mono text-sm tracking-widest">{lineaMICR}</span>
              </div>
            )}
          </div>

          <p className="text-sm opacity-80 text-center font-medium mt-2">
            Verifique y corrija los datos si es necesario.
          </p>

          {/* Formulario */}
          <div className={`rounded-xl p-4 flex flex-col gap-4 shadow-inner ${theme === 'dark' ? 'bg-slate-900/50 border border-slate-800' : 'bg-white border border-slate-200'}`}>
            
            {/* Emisor */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wider opacity-70">Emisor</label>
              <div className="flex items-center gap-2">
                <StatusIcon valid={vEmisor} />
                <input type="text" value={emisor} onChange={(e) => setEmisor(e.target.value)} className={`flex-1 p-2 rounded-lg text-sm border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'}`} />
              </div>
            </div>

            {/* Beneficiario */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wider opacity-70">Beneficiario</label>
              <div className="flex items-center gap-2">
                <StatusIcon valid={vBeneficiario} />
                <input type="text" value={beneficiario} onChange={(e) => setBeneficiario(e.target.value)} className={`flex-1 p-2 rounded-lg text-sm border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'}`} />
              </div>
            </div>

            {/* Monto (Numérico) */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wider opacity-70">Monto Numérico</label>
              <div className="flex items-center gap-2">
                <StatusIcon valid={vMonto} />
                <input type="text" value={monto} onChange={(e) => setMonto(e.target.value)} className={`flex-1 p-2 rounded-lg text-sm border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'}`} />
              </div>
            </div>

            {/* Monto en Letras */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wider opacity-70">Monto en Letras (Coincide: {vMontosCoinciden ? 'Sí' : 'No'})</label>
              <div className="flex items-center gap-2">
                <StatusIcon valid={vMontosCoinciden} />
                <input type="text" value={montoLetras} readOnly className={`flex-1 p-2 rounded-lg text-sm border opacity-70 cursor-not-allowed ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'}`} />
              </div>
              {!vMontosCoinciden && <span className="text-[10px] text-red-500 font-bold">* El monto numérico y letras difieren.</span>}
            </div>

            {/* Fecha */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wider opacity-70">Fecha (DD/MM/YYYY)</label>
              <div className="flex items-center gap-2">
                <StatusIcon valid={isFechaValid} />
                <input type="text" value={fecha} onChange={(e) => setFecha(e.target.value)} className={`flex-1 p-2 rounded-lg text-sm border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'}`} />
              </div>
              {!isFechaValid && fechaErrorMsg && <span className="text-[10px] text-red-500 font-bold">* {fechaErrorMsg}</span>}
            </div>

            {/* Banco e Información */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider opacity-70">Banco</label>
                <div className="flex items-center gap-2">
                  <StatusIcon valid={vBanco} />
                  <input type="text" value={banco} onChange={(e) => setBanco(e.target.value)} className={`w-full p-2 rounded-lg text-sm border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'}`} />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider opacity-70">Cuenta</label>
                <div className="flex items-center gap-2">
                  <StatusIcon valid={vCuenta} />
                  <input type="text" value={cuenta} onChange={(e) => setCuenta(e.target.value)} className={`w-full p-2 rounded-lg text-sm border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'}`} />
                </div>
              </div>
            </div>

            {/* Numero de Serie */}
            <div className="flex flex-col gap-1 mt-2">
              <label className="text-xs font-bold uppercase tracking-wider opacity-70">Número de Serie</label>
              <div className="flex items-center gap-2">
                <StatusIcon valid={vNumeroSerie} />
                <input type="text" value={numeroSerie} onChange={(e) => setNumeroSerie(e.target.value)} className={`flex-1 p-2 rounded-lg text-sm border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'}`} />
              </div>
            </div>
            
          </div>
        </div>
      </main>

      {/* Bottom Actions */}
      <footer className={`shrink-0 p-3 border-t flex flex-row gap-3 ${theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        <Link href="/capture/front" className={`py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors ${theme === 'dark' ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>
          <X className="w-5 h-5" /> Volver a Tomar
        </Link>
        
        <button 
          onClick={handleFinalize}
          disabled={!allValid}
          className={`flex-1 py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
            allValid 
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 hover:scale-[1.02] cursor-pointer' 
              : 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'
          }`}
        >
          Finalizar <Check className="w-5 h-5" />
        </button>
      </footer>
    </div>
  );
}
