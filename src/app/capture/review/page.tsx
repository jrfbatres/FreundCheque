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

const isValidBeneficiario = (ben: string) => {
  if (!ben || ben.trim() === '') return false;
  // Permite combinaciones de FREUND LTDA, FERRETERIAS FREUND LTDA DE CV ignorando puntos
  const regex = /^(ferreterias?\s+)?freund(,\s*|\s+)ltda\.?(\s+de\s+c\.?v\.?)?$/i;
  return regex.test(ben.trim());
};

export default function ReviewCapture() {
  const router = useRouter();
  const { frontImageBase64, extractedText, theme } = useAppStore();

  const [fecha, setFecha] = useState('');
  const [monto, setMonto] = useState('');
  const [montoLetras, setMontoLetras] = useState('');
  const [banco, setBanco] = useState('');
  const [cuenta, setCuenta] = useState('');
  const [emisor, setEmisor] = useState('');
  const [beneficiario, setBeneficiario] = useState('');
  const [firma, setFirma] = useState(false);
  const [sinTachaduras, setSinTachaduras] = useState(true);
  const [montosCoinciden, setMontosCoinciden] = useState(false);
  const [esOriginal, setEsOriginal] = useState(false);
  const [esCheque, setEsCheque] = useState<boolean | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isFinished, setIsFinished] = useState(false);

  // Call API to process image
  useEffect(() => {
    if (!frontImageBase64) return;
    
    // Si ya lo parseó antes, no volver a llamarlo en hot-reloads
    if (banco !== '' && !isLoading) return;

    const processImage = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: frontImageBase64 })
        });
        
        const json = await res.json();
        
        if (!res.ok) throw new Error(json.error || 'Error procesando la imagen');
        
        const aiData = json.data;
        if (aiData) {
          if (aiData.esCheque === false) {
            setEsCheque(false);
            return;
          }
          setEsCheque(true);
          setFecha(aiData.fecha || '');
          setMonto(aiData.monto || '');
          setMontoLetras(aiData.montoLetras || '');
          setBanco(aiData.banco || '');
          setCuenta(aiData.cuenta || '');
          setEmisor(aiData.emisor || '');
          setBeneficiario(aiData.beneficiario || '');
          setFirma(aiData.firma || false);
          setSinTachaduras(!aiData.alteraciones); // Si hay alteraciones, tachaduras es false
          setMontosCoinciden(aiData.montosCoinciden || false);
          setEsOriginal(aiData.esOriginal ?? false);
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

  if (!frontImageBase64) {
    if (typeof window !== 'undefined') router.push('/capture/front');
    return null;
  }

  // Validations
  const vFecha = isValidDate(fecha);
  const vMonto = isValidAmount(monto);
  const vMontoLetras = montoLetras.trim().length > 3;
  const vBanco = banco.trim().length > 0;
  const vCuenta = cuenta.trim().length > 0;
  const vEmisor = emisor.trim().length > 0;
  const vBeneficiario = isValidBeneficiario(beneficiario);
  const vFirma = firma;
  const vTachaduras = sinTachaduras;
  const vMontosCoinciden = montosCoinciden;
  const vEsOriginal = esOriginal;

  const allValid = vFecha && vMonto && vMontoLetras && vBanco && vCuenta && vEmisor && vBeneficiario && vFirma && vTachaduras && vMontosCoinciden && vEsOriginal;

  const StatusIcon = ({ valid }: { valid: boolean }) => (
    valid ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> : <XCircle className="w-5 h-5 text-red-500 shrink-0" />
  );

  if (isFinished) {
    const finalData = {
      fecha,
      monto,
      montoLetras,
      banco,
      cuenta,
      emisor,
      beneficiario,
      firma,
      sinTachaduras,
      imagenBase64: frontImageBase64
    };

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
              Todos los datos fueron validados correctamente. A continuación se muestra el JSON final generado que sería enviado al backend.
            </p>
            <div className={`rounded-xl p-4 overflow-x-auto text-xs font-mono shadow-inner border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-300'}`}>
              <pre className="break-all whitespace-pre-wrap">
                {JSON.stringify(finalData, null, 2).substring(0, 500) + '\n  ...\n  "imagenBase64": "[BASE64_STRING_TRUNCATED]"\n}'}
              </pre>
            </div>
            <div className="bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-700 shrink-0 mt-4">
              <div className="relative w-full aspect-[21/9] bg-black">
                <img 
                  src={frontImageBase64} 
                  alt="Cheque Escaneado" 
                  className="absolute inset-0 w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </main>
        <footer className={`shrink-0 p-3 border-t flex ${theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
          <button 
            onClick={() => router.push('/')}
            className="flex-1 py-3 px-4 rounded-lg font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all"
          >
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
        <h1 className="text-2xl font-bold mb-4">No es un cheque</h1>
        <p className="opacity-80 mb-8 max-w-sm">
          La imagen capturada no parece ser un cheque válido. Por favor, asegúrese de enfocar correctamente un cheque bancario y vuelva a intentarlo.
        </p>
        <button 
          onClick={() => router.push('/capture/front')}
          className="py-4 px-8 rounded-full font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all w-full max-w-sm"
        >
          Volver a Tomar
        </button>
      </div>
    );
  }

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
        <div className="max-w-xl mx-auto flex flex-col gap-4 relative">
          
          {isLoading && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-700">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-white font-bold animate-pulse">Analizando con Inteligencia Artificial...</p>
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-500/20 border border-red-500 text-red-100 p-3 rounded-lg text-sm mb-2 text-center font-semibold">
              {errorMsg}
            </div>
          )}

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
                <input type="text" value={monto} readOnly placeholder="Lectura Automática" className={`flex-1 p-2 rounded-lg text-sm border opacity-70 cursor-not-allowed ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'}`} />
              </div>
            </div>

            {/* Monto Letras */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wider opacity-70">Monto en Letras</label>
              <div className="flex items-center gap-2">
                <StatusIcon valid={vMontoLetras} />
                <input type="text" value={montoLetras} readOnly placeholder="Lectura Automática" className={`flex-1 p-2 rounded-lg text-sm border opacity-70 cursor-not-allowed ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'}`} />
              </div>
              <span className="text-[10px] text-red-400 opacity-80">* Los montos numérico y en letras deben coincidir. No se pueden corregir manualmente.</span>
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
              <label className="text-xs font-bold uppercase tracking-wider opacity-70">Beneficiario (FREUND LTDA de C.V.)</label>
              <div className="flex items-center gap-2">
                <StatusIcon valid={vBeneficiario} />
                <input type="text" value={beneficiario} readOnly placeholder="Lectura Automática" className={`flex-1 p-2 rounded-lg text-sm border opacity-70 cursor-not-allowed ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'}`} />
              </div>
              <span className="text-[10px] text-red-400 opacity-80">* No se puede corregir manualmente. Si es incorrecto, retome la foto.</span>
            </div>

            {/* Toggles booleanos */}
            <div className="flex flex-col gap-3 mt-2 pt-4 border-t border-slate-700/50">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 opacity-80">
                  <StatusIcon valid={vMontosCoinciden} />
                  <span className="text-sm font-semibold select-none">Montos (Números y Letras) Coinciden</span>
                </div>
                
                <div className="flex items-center gap-2 opacity-80">
                  <StatusIcon valid={vEsOriginal} />
                  <span className="text-sm font-semibold select-none">Cheque Original (No fotocopia)</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 opacity-80">
                  <StatusIcon valid={vFirma} />
                  <span className="text-sm font-semibold select-none">Contiene Firma</span>
                </div>

                <div className="flex items-center gap-2 opacity-80">
                  <StatusIcon valid={vTachaduras} />
                  <span className="text-sm font-semibold select-none">Sin Alteraciones o Manchas</span>
                </div>
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
          onClick={() => allValid && setIsFinished(true)}
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
