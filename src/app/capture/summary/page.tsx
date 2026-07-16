'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { Mail, MessageCircle, Send, CheckCircle2, ArrowLeft, Sun, Moon, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface SummaryData {
  fecha: string;
  monto: number;
  montoLetras: string;
  banco: string;
  cuenta: string;
  numeroSerie: string;
  emisor: string;
  beneficiario: string;
  lineaMICR: string;
  cliente: {
    id: string;
    name: string;
    nrc: string;
    location: string;
  } | null;
}

export default function SummaryCapture() {
  const router = useRouter();
  const { theme, toggleTheme, clearCaptureData } = useAppStore();
  const [data, setData] = useState<SummaryData | null>(null);
  
  const [emailPrincipal, setEmailPrincipal] = useState('a.ramirez@empresa.com');
  const [emailSecundario, setEmailSecundario] = useState('');
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    const cached = sessionStorage.getItem('freund_cheque_summary');
    if (cached) {
      setData(JSON.parse(cached));
    } else {
      // Default Mock Data if visited directly
      setData({
        fecha: '24/10/2026',
        monto: 12450.00,
        montoLetras: 'DOCE MIL CUATROCIENTOS CINCUENTA 00/100 USD',
        banco: 'Banco Industrial',
        cuenta: '123-45678-9',
        numeroSerie: '00293811',
        emisor: 'Corporativo Global S.A.',
        beneficiario: 'Alejandro G. Ramírez',
        lineaMICR: '⑆ 00293811 ⑈ 031636071 ⑈ 4829 ⑈',
        cliente: { id: '102934', name: 'Constructora Continental S.A.', nrc: '123456-7', location: 'San Salvador' }
      });
    }
  }, []);

  const handleSendEmail = () => {
    if (!data) return;
    const recipients = [emailPrincipal, emailSecundario].filter(Boolean).join(',');
    const subject = encodeURIComponent('Recibo de Abono de Cheque - Freund');
    
    const bodyText = `Estimado(a) Cliente,

Le confirmamos el depósito de su cheque con los siguientes detalles:

Detalles del Depósito:
----------------------------------------
Cliente Emisor: ${data.cliente?.name || 'Cliente Desconocido'}
ID Cliente: ${data.cliente?.id || 'N/A'}
Monto Depositado: $${data.monto.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
Monto en Letras: ${data.montoLetras}
Banco: ${data.banco}
Cuenta: ${data.cuenta}
Número de Cheque: #${data.numeroSerie}
Fecha: ${data.fecha}
Línea MICR: ${data.lineaMICR}

Este es un comprobante digital generado automáticamente. Gracias por su preferencia.`;

    const body = encodeURIComponent(bodyText);
    window.location.href = `mailto:${recipients}?subject=${subject}&body=${body}`;
    
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 3000);
  };

  const handleSendWhatsApp = () => {
    if (!data) return;
    const messageText = `*Recibo de Abono de Cheque - Freund* ✅

*Cliente:* ${data.cliente?.name || 'Cliente Desconocido'}
*ID Cliente:* ${data.cliente?.id || 'N/A'}
*Monto:* $${data.monto.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
*Monto en Letras:* _${data.montoLetras}_
*Banco:* ${data.banco}
*Cuenta:* ${data.cuenta}
*Cheque:* #${data.numeroSerie}
*Fecha:* ${data.fecha}
*Línea MICR:* \`${data.lineaMICR}\`

_Comprobante digital generado por Freund Cheque._`;

    const cleanPhone = whatsappPhone.replace(/[^0-9]/g, '');
    const url = cleanPhone 
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(messageText)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(messageText)}`;
    window.open(url, '_blank');
  };

  const handleFinishFlow = () => {
    clearCaptureData();
    sessionStorage.removeItem('freund_cheque_summary');
    router.push('/');
  };

  if (!data) return null;

  return (
    <div className="flex flex-col min-h-screen p-6 pb-24 relative max-w-md mx-auto animate-in fade-in duration-300">
      
      {/* Top Actions Header */}
      <header className="flex justify-between items-center pt-4 mb-6">
        <button 
          onClick={handleFinishFlow}
          className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:scale-105 active:scale-95 transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="relative w-28 h-10">
          <Image 
            src={theme === 'dark' ? '/logoFreundOscuro3.png' : '/logoFreund2.png'} 
            alt="Freund Logo" 
            fill
            sizes="112px"
            className="object-contain drop-shadow-md"
            priority
          />
        </div>
        <button 
          onClick={toggleTheme}
          className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:scale-105 active:scale-95 transition-all shadow-sm"
        >
          {theme === 'light' ? <Moon className="w-5 h-5 text-slate-800" /> : <Sun className="w-5 h-5 text-amber-400" />}
        </button>
      </header>

      <div className="text-center mb-6">
        <span className="text-[10px] font-bold tracking-[0.2em] text-blue-600 dark:text-blue-400 uppercase">
          Resumen de Depósito
        </span>
      </div>

      <main className="flex-1 space-y-6">
        
        {/* Account Details Section */}
        <section className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-850 rounded-2xl p-5 shadow-sm">
          <h2 className="text-xs font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            Cuenta de Origen
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              C
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {data.cliente?.name || 'Cliente Desconocido'}
              </p>
              <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                NRC: {data.cliente?.nrc} • ID #{data.cliente?.id}
              </p>
            </div>
          </div>
        </section>

        {/* Check Details - Receipt Style */}
        <section className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-md overflow-hidden relative">
          
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-blue-400" />
          
          {/* Header of Receipt */}
          <div className="p-6 text-center border-b border-dashed border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
              Detalles del Cheque
            </span>
            <span className="text-[9px] text-slate-400 font-mono block mb-3">
              SERIE: {data.numeroSerie}
            </span>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              ${data.monto.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[9px] text-slate-500 font-mono mt-1 uppercase max-w-[240px] mx-auto leading-normal">
              {data.montoLetras}
            </p>
          </div>

          {/* Details list inside Receipt */}
          <div className="p-6 space-y-3.5 text-xs">
            <div className="flex justify-between items-start">
              <span className="text-slate-500 dark:text-slate-400">Emisor</span>
              <span className="font-semibold text-slate-900 dark:text-white text-right max-w-[180px]">
                {data.emisor}
              </span>
            </div>
            
            <div className="flex justify-between items-start">
              <span className="text-slate-500 dark:text-slate-400">Beneficiario</span>
              <span className="font-semibold text-slate-900 dark:text-white text-right max-w-[180px]">
                {data.beneficiario}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400">Fecha Emisión</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {data.fecha}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400">Banco</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {data.banco}
              </span>
            </div>

            {/* MICR Line */}
            {data.lineaMICR && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                <span className="text-[9px] text-slate-400 uppercase tracking-widest block mb-1">
                  Banda MICR Validada
                </span>
                <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 tracking-wider">
                  {data.lineaMICR}
                </span>
              </div>
            )}

            {/* Receipt Status Badge */}
            <div className="pt-4 flex justify-center">
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 rounded-full border border-emerald-500/20 shadow-sm animate-pulse">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Captura Exitosa</span>
              </div>
            </div>
          </div>

          {/* Jagged edge mock look via small circles */}
          <div className="absolute -bottom-1 left-0 right-0 h-2 flex justify-around overflow-hidden opacity-20">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="w-3 h-3 bg-slate-950 dark:bg-white rounded-full -mb-1.5" />
            ))}
          </div>

        </section>

        {/* Delivery Options */}
        <section className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-850 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-slate-900 dark:text-white">Opciones de Envío</h2>
          
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Email Principal
              </label>
              <div className="flex items-center bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-750 rounded-lg py-2 px-3 shadow-inner">
                <Mail className="w-4 h-4 text-slate-400 mr-2" />
                <input 
                  type="email" 
                  value={emailPrincipal} 
                  onChange={(e) => setEmailPrincipal(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 w-full text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Email Secundario (Opcional)
              </label>
              <div className="flex items-center bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-750 rounded-lg py-2 px-3 shadow-inner">
                <Mail className="w-4 h-4 text-slate-400 mr-2" />
                <input 
                  type="email" 
                  placeholder="contabilidad@empresa.com"
                  value={emailSecundario} 
                  onChange={(e) => setEmailSecundario(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 w-full text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                WhatsApp (Número de Teléfono)
              </label>
              <div className="flex items-center bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-750 rounded-lg py-2 px-3 shadow-inner">
                <MessageCircle className="w-4 h-4 text-slate-400 mr-2" />
                <input 
                  type="tel" 
                  placeholder="e.g. 50370001234"
                  value={whatsappPhone} 
                  onChange={(e) => setWhatsappPhone(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 w-full text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button 
            onClick={handleSendEmail}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
          >
            <Send className="w-4 h-4" />
            Enviar recibo por Email
          </button>

          <button 
            onClick={handleSendWhatsApp}
            className="w-full h-12 border-2 border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-755 text-slate-800 dark:text-slate-200 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <MessageCircle className="w-4 h-4 text-emerald-500" />
            Enviar recibo por WhatsApp
          </button>

          {emailSent && (
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-500 text-emerald-800 dark:text-emerald-400 rounded-xl flex items-center justify-center gap-2 animate-in slide-in-from-bottom-2 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              Recibo enviado con éxito
            </div>
          )}

          <button 
            onClick={handleFinishFlow}
            className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-700 mt-4 py-2 block"
          >
            Volver al Inicio
          </button>
        </div>

      </main>

    </div>
  );
}
