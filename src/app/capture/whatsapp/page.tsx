'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { ArrowLeft, Phone, Video, MoreVertical, Smile, Paperclip, Camera, Mic, Check, CheckCheck, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

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

export default function WhatsAppPreview() {
  const router = useRouter();
  const { theme } = useAppStore();
  const [data, setData] = useState<SummaryData | null>(null);

  useEffect(() => {
    const cached = sessionStorage.getItem('freund_cheque_summary');
    if (cached) {
      setData(JSON.parse(cached));
    } else {
      // Fallback Mock Data
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

  if (!data) return null;

  return (
    <div className="flex flex-col h-screen overflow-hidden max-w-md mx-auto bg-slate-100 dark:bg-slate-950 font-sans border-x border-slate-200 dark:border-slate-850 shadow-2xl relative">
      
      {/* WhatsApp Header */}
      <header className="bg-slate-200 dark:bg-slate-900 flex items-center px-4 py-3 h-16 shadow-sm z-10 shrink-0 select-none">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => router.push('/capture/summary')} 
            className="p-1 rounded-full text-slate-700 dark:text-slate-200 active:bg-slate-300 dark:active:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="relative">
            <div className="w-10 h-10 rounded-full border border-slate-350 dark:border-slate-700 bg-white flex items-center justify-center font-bold text-slate-800 dark:text-slate-800">
              F
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-200 dark:border-slate-900" />
          </div>
        </div>
        
        <div className="ml-3 flex-1">
          <h1 className="text-sm font-bold text-slate-800 dark:text-white leading-tight">
            Soporte Freund
          </h1>
          <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
            En línea
          </p>
        </div>
        
        <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300">
          <Video className="w-5 h-5 cursor-pointer hover:opacity-80 active:scale-95 transition-all" />
          <Phone className="w-4 h-4 cursor-pointer hover:opacity-80 active:scale-95 transition-all" />
          <MoreVertical className="w-5 h-5 cursor-pointer hover:opacity-80 active:scale-95 transition-all" />
        </div>
      </header>

      {/* WhatsApp Chat Area */}
      <main className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-4 bg-slate-50 dark:bg-slate-950/80">
        
        {/* Date Stamp */}
        <div className="self-center bg-slate-200/60 dark:bg-slate-900/60 backdrop-blur-sm px-3 py-1 rounded-lg">
          <span className="text-[9px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
            Hoy
          </span>
        </div>

        {/* Check Receipt Message Bubble */}
        <div className="max-w-[88%] self-start flex flex-col gap-1">
          <div className="bg-white dark:bg-slate-900 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl overflow-hidden shadow-md border border-slate-200/50 dark:border-slate-850 relative">
            
            {/* Header / Logo */}
            <div className="p-4 flex flex-col items-center border-b border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="relative w-20 h-6 mb-1">
                <Image 
                  src={theme === 'dark' ? '/logoFreundOscuro3.png' : '/logoFreund2.png'} 
                  alt="Freund Logo" 
                  fill
                  sizes="80px"
                  className="object-contain"
                />
              </div>
              <h2 className="text-[9px] font-bold text-blue-600 dark:text-blue-400 tracking-[0.15em] uppercase">
                Abono Recibido
              </h2>
            </div>

            {/* Receipt Details Body */}
            <div className="p-5 flex flex-col gap-5">
              
              {/* Success Badge */}
              <div className="flex items-center justify-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 py-1.5 px-4 rounded-full border border-emerald-500/20 self-center text-[10px] font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Captura Exitosa
              </div>

              {/* Amount Info */}
              <div className="text-center space-y-1">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                  Monto del Cheque
                </p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  ${data.monto.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
                <p className="text-[8px] text-slate-400 font-mono tracking-widest uppercase">
                  Sello Digital: FR-{data.numeroSerie}-X
                </p>
              </div>

              {/* Detailed Breakdown */}
              <div className="space-y-3.5 text-xs pt-1">
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
                    Cuenta de Origen
                  </span>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {data.cliente?.name || 'Cliente Desconocido'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Cuenta Freund **** 4829
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-3 border-t border-slate-100 dark:border-slate-850">
                  <div className="col-span-2">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
                      Emisor
                    </span>
                    <p className="font-semibold text-slate-900 dark:text-white leading-tight">
                      {data.emisor}
                    </p>
                  </div>
                  
                  <div className="col-span-2">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
                      Banco
                    </span>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {data.banco}
                    </p>
                  </div>

                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
                      Fecha
                    </span>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {data.fecha}
                    </p>
                  </div>

                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
                      Cheque N°
                    </span>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {data.numeroSerie}
                    </p>
                  </div>

                  {data.lineaMICR && (
                    <div className="col-span-2 pt-3 mt-1 border-t border-slate-100 dark:border-slate-850 text-center flex flex-col items-center">
                      <span className="font-mono text-[10px] tracking-widest text-slate-600 dark:text-slate-400 opacity-85 select-none font-semibold">
                        {data.lineaMICR}
                      </span>
                      <span className="text-[8px] text-slate-400 font-mono tracking-widest mt-0.5 block uppercase">
                        Validación MICR Ok
                      </span>
                    </div>
                  )}
                </div>

              </div>

            </div>

            {/* Bubble Footer Action */}
            <button 
              onClick={() => router.push('/capture/summary')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] tracking-wider uppercase py-3.5 flex items-center justify-center gap-1 transition-all active:bg-blue-800"
            >
              Ver Detalle Completo
              <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
            </button>

          </div>

          <div className="self-end px-1 flex items-center">
            <span className="text-[9px] text-slate-400 font-medium">18:22</span>
          </div>
        </div>

        {/* Outgoing Message Reply */}
        <div className="max-w-[80%] self-end flex flex-col gap-1">
          <div className="bg-emerald-100 dark:bg-emerald-900/40 text-slate-800 dark:text-slate-200 px-4 py-2.5 rounded-tl-2xl rounded-bl-2xl rounded-br-2xl shadow-sm border border-emerald-200/30 dark:border-emerald-950/20">
            <p className="text-xs font-medium">
              Muchas gracias, ya recibí la confirmación.
            </p>
          </div>
          <div className="self-end px-1 flex items-center gap-1.5 mt-0.5">
            <span className="text-[9px] text-slate-400 font-medium">18:23</span>
            <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
          </div>
        </div>

      </main>

      {/* WhatsApp Input Footer */}
      <footer className="bg-slate-200 dark:bg-slate-900 px-2 py-3 flex items-center gap-2 shrink-0 select-none pb-safe">
        <div className="flex-1 bg-white dark:bg-slate-950 rounded-full h-11 flex items-center px-4 gap-3 shadow-inner border border-slate-300/30 dark:border-slate-800/40">
          <Smile className="w-5 h-5 text-slate-400 cursor-pointer" />
          <input 
            type="text" 
            placeholder="Mensaje" 
            readOnly 
            className="flex-1 bg-transparent border-none focus:ring-0 text-xs text-slate-900 dark:text-white outline-none cursor-default"
          />
          <Paperclip className="w-4 h-4 text-slate-400 rotate-45 cursor-pointer" />
          <Camera className="w-5 h-5 text-slate-400 cursor-pointer" />
        </div>
        <div className="w-11 h-11 bg-emerald-600 dark:bg-emerald-600 rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform cursor-pointer">
          <Mic className="w-5 h-5 text-white" />
        </div>
      </footer>

    </div>
  );
}
