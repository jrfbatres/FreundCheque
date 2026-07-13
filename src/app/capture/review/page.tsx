'use client';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { Check, X, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

// Validation helpers
const isValidDate = (dateStr: string) => {
  if (!dateStr || dateStr.trim() === '') return false;
  
  let parts = dateStr.split(/[\/\-]/);
  if (parts.length !== 3) return false;
  
  let day, month, year;
  if (parts[2].length === 4) { // DD/MM/YYYY
    day = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10);
    year = parseInt(parts[2], 10);
  } else if (parts[0].length === 4) { // YYYY/MM/DD
    year = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10);
    day = parseInt(parts[2], 10);
  } else {
    return false;
  }

  const d = new Date(year, month - 1, day);
  if (isNaN(d.getTime())) return false;

  const today = new Date();
  const minDate = new Date();
  minDate.setMonth(today.getMonth() - 3); // -3 months
  
  const maxDate = new Date();
  maxDate.setMonth(today.getMonth() + 1); // +1 month

  return d >= minDate && d <= maxDate;
};

const isValidAmount = (amountStr: string) => {
  if (!amountStr || amountStr.trim() === '') return false;
  const num = parseFloat(amountStr.replace(/[^0-9.-]+/g,""));
  return !isNaN(num) && num > 0;
};

export default function ReviewCapture() {
  const router = useRouter();
  const { frontImageBase64, extractedText, theme } = useAppStore();

  const [fecha, setFecha] = useState('');
  const [monto, setMonto] = useState('');
  const [banco, setBanco] = useState('');
  const [cuenta, setCuenta] = useState('');
  const [emisor, setEmisor] = useState('');
  const [beneficiario, setBeneficiario] = useState('');
  const [firma, setFirma] = useState(false);
  const [sinTachaduras, setSinTachaduras] = useState(true); // Default true since AI can't read it easily

  // Initial Parser
  useEffect(() => {
    if (!extractedText) return;
    const lowerText = extractedText.toLowerCase();
    
    // Parse Date (DD/MM/YYYY)
    const dateMatch = extractedText.match(/\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/);
    if (dateMatch) setFecha(dateMatch[0]);

    // Parse Amount (e.g. $ 1,500.00)
    const amountMatch = extractedText.match(/\$?\s?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?\b/);
    if (amountMatch) {
      const parsedAmount = amountMatch[0].replace(/[^0-9.,]/g, '');
      if (parseFloat(parsedAmount) > 0) setMonto(parsedAmount);
    }

    // Parse Cuenta (8+ digits)
    const accMatch = extractedText.match(/\b\d{8,}\b/);
    if (accMatch) setCuenta(accMatch[0]);

    // Simple keyword checks for Banco
    if (lowerText.includes('banco') || lowerText.includes('agricola') || lowerText.includes('cuscatlan')) {
      setBanco('Detectado'); // Simplification for UI
    }
    
    if (lowerText.includes('firma')) {
      setFirma(true);
    }
  }, [extractedText]);

  if (!frontImageBase64) {
    if (typeof window !== 'undefined') router.push('/capture/front');
    return null;
  }

  // Validations
  const vFecha = isValidDate(fecha);
  const vMonto = isValidAmount(monto);
  const vBanco = banco.trim().length > 0;
  const vCuenta = cuenta.trim().length > 0;
  const vEmisor = emisor.trim().length > 0;
  const vBeneficiario = beneficiario.trim().length > 0;
  const vFirma = firma;
  const vTachaduras = sinTachaduras;

  const allValid = vFecha && vMonto && vBanco && vCuenta && vEmisor && vBeneficiario && vFirma && vTachaduras;

  const StatusIcon = ({ valid }: { valid: boolean }) => (
    valid ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> : <XCircle className="w-5 h-5 text-red-500 shrink-0" />
  );

  return (
    <div className={`h-[100dvh] w-full ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} flex flex-col overflow-hidden`}>
      
      {/* Header */}
      <header className={`shrink-0 p-3 flex items-center justify-between border-b ${theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        <Image 
          src={theme === 'dark' ? '/logoFreundOscuro3.png' : '/logoFreund2.png'} 
          alt="Freund Logo" 
          width={100} 
          height={30}
          className="object-contain"
        />
        <h1 className="text-lg font-bold">Validación Inteligente</h1>
      </header>

      {/* Content - Vertical Layout */}
      <main className="flex-1 overflow-y-auto w-full p-4">
        <div className="max-w-xl mx-auto flex flex-col gap-4">
          
          {/* Image */}
          <div className="bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-700 shrink-0">
            <div className="relative w-full aspect-[21/9] bg-black">
              <img 
                src={frontImageBase64} 
                alt="Cheque Escaneado" 
                className="absolute inset-0 w-full h-full object-contain"
              />
            </div>
          </div>

          <p className="text-sm opacity-80 text-center">
            Revisa los campos extraídos. Corrige los campos en rojo para poder continuar.
          </p>

          {/* Form / Checklist */}
          <div className={`rounded-xl p-4 flex flex-col gap-3 shadow-inner ${theme === 'dark' ? 'bg-slate-900/50 border border-slate-800' : 'bg-white border border-slate-200'}`}>
            
            {/* Fecha */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wider opacity-70">Fecha (DD/MM/YYYY) [-3 meses a +1 mes]</label>
              <div className="flex items-center gap-2">
                <StatusIcon valid={vFecha} />
                <input type="text" value={fecha} onChange={(e) => setFecha(e.target.value)} placeholder="Ej. 15/05/2026" className={`flex-1 p-2 rounded-lg text-sm border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'}`} />
              </div>
            </div>

            {/* Monto */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wider opacity-70">Monto numérico (&gt; 0)</label>
              <div className="flex items-center gap-2">
                <StatusIcon valid={vMonto} />
                <input type="text" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="Ej. 150.00" className={`flex-1 p-2 rounded-lg text-sm border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'}`} />
              </div>
            </div>

            {/* Banco */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wider opacity-70">Nombre del Banco</label>
              <div className="flex items-center gap-2">
                <StatusIcon valid={vBanco} />
                <input type="text" value={banco} onChange={(e) => setBanco(e.target.value)} placeholder="Nombre del Banco" className={`flex-1 p-2 rounded-lg text-sm border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'}`} />
              </div>
            </div>

            {/* Cuenta */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wider opacity-70">Número de Cuenta</label>
              <div className="flex items-center gap-2">
                <StatusIcon valid={vCuenta} />
                <input type="text" value={cuenta} onChange={(e) => setCuenta(e.target.value)} placeholder="N° Cuenta" className={`flex-1 p-2 rounded-lg text-sm border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'}`} />
              </div>
            </div>

            {/* Emisor */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wider opacity-70">Emisor (Quien da el cheque)</label>
              <div className="flex items-center gap-2">
                <StatusIcon valid={vEmisor} />
                <input type="text" value={emisor} onChange={(e) => setEmisor(e.target.value)} placeholder="Nombre del emisor" className={`flex-1 p-2 rounded-lg text-sm border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'}`} />
              </div>
            </div>

            {/* Beneficiario */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wider opacity-70">Beneficiario (A favor de)</label>
              <div className="flex items-center gap-2">
                <StatusIcon valid={vBeneficiario} />
                <input type="text" value={beneficiario} onChange={(e) => setBeneficiario(e.target.value)} placeholder="Nombre del beneficiario" className={`flex-1 p-2 rounded-lg text-sm border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'}`} />
              </div>
            </div>

            {/* Toggles booleanos */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/50">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setFirma(!firma)}>
                <StatusIcon valid={vFirma} />
                <span className="text-sm font-semibold select-none">Contiene Firma</span>
              </div>

              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setSinTachaduras(!sinTachaduras)}>
                <StatusIcon valid={vTachaduras} />
                <span className="text-sm font-semibold select-none">Sin Tachaduras</span>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Bottom Actions */}
      <footer className={`shrink-0 p-3 border-t flex flex-row gap-3 ${theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        <Link 
          href="/capture/front"
          className={`py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors ${
            theme === 'dark' 
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          <X className="w-5 h-5" /> Volver a Tomar
        </Link>
        
        <button 
          onClick={() => allValid && router.push('/capture/back')}
          disabled={!allValid}
          className={`flex-1 py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
            allValid 
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 hover:scale-[1.02] cursor-pointer' 
              : 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'
          }`}
        >
          Continuar al Reverso <ArrowRight className="w-5 h-5" />
        </button>
      </footer>
    </div>
  );
}
