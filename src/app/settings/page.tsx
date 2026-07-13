'use client';
import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Save, Activity, CheckCircle2, AlertCircle, Sun, Moon } from 'lucide-react';

export default function Settings() {
  const { webhookUrl, setWebhookUrl } = useAppStore();
  const [url, setUrl] = useState(webhookUrl);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const handleSave = () => {
    setWebhookUrl(url);
  };

  const handleTest = async () => {
    if (!url) return;
    setTestStatus('testing');
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'test_connection', timestamp: new Date().toISOString() }),
      });

      if (response.ok) {
        setTestStatus('success');
      } else {
        setTestStatus('error');
      }
    } catch (error) {
      setTestStatus('error');
    }
    setTimeout(() => setTestStatus('idle'), 3000);
  };

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-4rem)] p-6 animate-in fade-in duration-300">
      
      <button 
        onClick={useAppStore(state => state.toggleTheme)}
        className="absolute top-6 right-6 p-3 rounded-full bg-slate-100 dark:bg-slate-800 hover:scale-105 transition-all shadow-sm"
      >
        {useAppStore(state => state.theme) === 'light' ? <Moon className="w-6 h-6 text-slate-800" /> : <Sun className="w-6 h-6 text-amber-400" />}
      </button>

      <div className="w-full max-w-md pt-8">
        
        <div className="flex items-center gap-4 mb-8">
          <img 
            src={useAppStore(state => state.theme) === 'dark' ? '/logoFreundOscuro3.png' : '/logoFreund2.png'} 
            alt="Freund Logo" 
            className="h-10 object-contain drop-shadow-md"
          />
          <h1 className="text-2xl font-bold">Configuración</h1>
        </div>

        <div className="space-y-8">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Webhook URL</label>
            <input 
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://empresa.com/api/webhook/cheques"
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div className="flex gap-4">
            <button 
              onClick={handleTest}
              disabled={!url || testStatus === 'testing'}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl p-4 font-medium text-slate-700 dark:text-slate-200 transition-all disabled:opacity-50"
            >
              <Activity className="w-5 h-5" />
              Probar
            </button>

            <button 
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-4 font-medium transition-all shadow-md shadow-blue-600/20"
            >
              <Save className="w-5 h-5" />
              Guardar
            </button>
          </div>

          {testStatus === 'success' && (
            <div className="p-4 bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-500 text-emerald-800 dark:text-emerald-400 rounded-xl flex items-center gap-3 animate-in slide-in-from-bottom-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Conexión exitosa</span>
            </div>
          )}

          {testStatus === 'error' && (
            <div className="p-4 bg-red-100 dark:bg-red-900/40 border border-red-500 text-red-800 dark:text-red-400 rounded-xl flex items-center gap-3 animate-in slide-in-from-bottom-2">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Error de conexión</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
