'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore, Client } from '@/store/useAppStore';
import { Search, ChevronRight, Moon, Sun, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const MOCK_CLIENTS: Client[] = [
  { id: '102934', name: 'Constructora Continental S.A.', nrc: '123456-7', location: 'San Salvador' },
  { id: '105582', name: 'Continental Inversiones S.A.', nrc: '987654-3', location: 'Santa Tecla' },
  { id: '108921', name: 'Logística Continental de C.V.', nrc: '456123-0', location: 'Antiguo Cuscatlán' },
];

export default function SearchClient() {
  const router = useRouter();
  const { theme, toggleTheme, setSelectedClient, selectedClient } = useAppStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [localSelection, setLocalSelection] = useState<Client | null>(selectedClient || MOCK_CLIENTS[0]);

  const filteredClients = MOCK_CLIENTS.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.id.includes(searchQuery)
  );

  const handleContinue = () => {
    if (localSelection) {
      setSelectedClient(localSelection);
      router.push('/capture/front');
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] p-6 pb-28 animate-in fade-in duration-300 relative max-w-md mx-auto">
      
      {/* Header Area */}
      <header className="flex justify-between items-center pt-4 mb-8">
        <Link 
          href="/" 
          className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:scale-105 active:scale-95 transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
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

      {/* Title */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Búsqueda de Cliente</h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Seleccione el cliente emisor del abono.</p>
      </div>

      {/* Search Criteria */}
      <section className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-850 rounded-2xl p-5 shadow-sm mb-6">
        <h2 className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-4">
          Criterios de Búsqueda
        </h2>
        
        <div className="relative flex items-center">
          <input 
            type="text" 
            placeholder="Nombre o ID del cliente..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-950 border border-slate-350 dark:border-slate-750 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 rounded-xl py-3 pl-11 pr-4 text-sm font-medium outline-none transition-all placeholder:text-slate-400"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
        </div>
      </section>

      {/* Results Section */}
      <section className="flex-1">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
            Resultados Encontrados
          </h2>
          <span className="text-[10px] font-mono font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">
            {filteredClients.length} {filteredClients.length === 1 ? 'COINCIDENCIA' : 'COINCIDENCIAS'}
          </span>
        </div>

        <div className="space-y-3">
          {filteredClients.map((client) => {
            const isSelected = localSelection?.id === client.id;
            return (
              <label 
                key={client.id}
                onClick={() => setLocalSelection(client)}
                className={`flex items-start p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-blue-500 dark:border-blue-500 bg-blue-50/30 dark:bg-blue-950/10' 
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/20'
                }`}
              >
                <input 
                  type="radio" 
                  name="client_selection" 
                  checked={isSelected}
                  onChange={() => setLocalSelection(client)}
                  className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500/20 border-slate-300 dark:border-slate-700 bg-transparent"
                />
                <div className="ml-4 flex-1">
                  <div className="flex justify-between items-baseline">
                    <p className="font-semibold text-sm text-slate-900 dark:text-white leading-tight">
                      {client.name}
                    </p>
                    <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 ml-2">
                      #{client.id}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    NRC: {client.nrc} • {client.location}
                  </p>
                </div>
              </label>
            );
          })}

          {filteredClients.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No se encontraron clientes para tu búsqueda.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Floating Bottom Action Area */}
      <div className="fixed bottom-16 left-0 right-0 w-full px-6 py-4 bg-gradient-to-t from-white dark:from-slate-950 via-white/95 dark:via-slate-950/95 to-transparent z-40 max-w-md mx-auto">
        <button 
          onClick={handleContinue}
          disabled={!localSelection}
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white rounded-xl font-bold text-sm flex items-center justify-center shadow-lg shadow-blue-600/20 hover:scale-[1.02] active:scale-98 transition-all disabled:shadow-none"
        >
          Continuar
          <ChevronRight className="w-5 h-5 ml-1" />
        </button>
      </div>

    </div>
  );
}
