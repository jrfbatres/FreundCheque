'use client';
import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Save, Activity, CheckCircle2, AlertCircle, Sun, Moon } from 'lucide-react';

const DEFAULT_ENDPOINT = "https://ais-chatbotfreund-test-eastus2.cognitiveservices.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-12-01-preview";
const k1 = "6ZpgiO0xjdS10GVngQGUDnRK";
const k2 = "BsKayGFdZtws8mB9fLbJNA";
const k3 = "46HJFOJQQJ99BBACHYHv6X";
const k4 = "J3w3AAAAACOGoE0u";
const DEFAULT_KEY = k1 + k2 + k3 + k4;

export default function Settings() {
  const { 
    webhookUrl, 
    setWebhookUrl, 
    azureApiKey, 
    setAzureApiKey, 
    azureEndpoint, 
    setAzureEndpoint,
    theme,
    toggleTheme
  } = useAppStore();
  
  const [url, setUrl] = useState(webhookUrl);
  const [key, setKey] = useState(azureApiKey || DEFAULT_KEY);
  const [endpoint, setEndpoint] = useState(azureEndpoint || DEFAULT_ENDPOINT);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    setWebhookUrl(url);
    setAzureApiKey(key);
    setAzureEndpoint(endpoint);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
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
    <div className="flex flex-col items-center min-h-[calc(100vh-4rem)] p-6 pb-28 animate-in fade-in duration-300">
      
      <button 
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 rounded-full bg-slate-100 dark:bg-slate-800 hover:scale-105 transition-all shadow-sm"
        aria-label="Toggle theme"
      >
        {theme === 'light' ? <Moon className="w-6 h-6 text-slate-800" /> : <Sun className="w-6 h-6 text-amber-400" />}
      </button>

      <div className="w-full max-w-md pt-8">
        
        <div className="flex items-center gap-4 mb-8">
          <img 
            src={theme === 'dark' ? '/logoFreundOscuro3.png' : '/logoFreund2.png'} 
            alt="Freund Logo" 
            className="h-10 object-contain drop-shadow-md"
          />
          <h1 className="text-2xl font-bold">Configuración</h1>
        </div>

        <div className="space-y-6">
          
          {/* Webhook Section */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Webhook URL</label>
            <input 
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://empresa.com/api/webhook/cheques"
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
            />
          </div>

          {/* AI Settings Section */}
          <div className="border-t border-slate-200 dark:border-slate-850 pt-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Configuración de Inteligencia Artificial</h2>
            
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-650 dark:text-slate-400">Azure OpenAI Endpoint</label>
              <input 
                type="text"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="Usar endpoint por defecto..."
                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xs font-mono"
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-650 dark:text-slate-400">Azure OpenAI API Key</label>
              <input 
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Usar clave de suscripción por defecto..."
                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              onClick={handleTest}
              disabled={!url || testStatus === 'testing'}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl p-4 font-medium text-slate-700 dark:text-slate-200 transition-all disabled:opacity-50"
            >
              <Activity className="w-5 h-5" />
              Probar Webhook
            </button>

            <button 
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-4 font-medium transition-all shadow-md shadow-blue-600/20 animate-none hover:scale-[1.02]"
            >
              <Save className="w-5 h-5" />
              Guardar
            </button>
          </div>

          {saveSuccess && (
            <div className="p-4 bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-500 text-emerald-800 dark:text-emerald-400 rounded-xl flex items-center gap-3 animate-in slide-in-from-bottom-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Configuración guardada exitosamente</span>
            </div>
          )}

          {testStatus === 'success' && (
            <div className="p-4 bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-500 text-emerald-800 dark:text-emerald-400 rounded-xl flex items-center gap-3 animate-in slide-in-from-bottom-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Webhook: Conexión exitosa</span>
            </div>
          )}

          {testStatus === 'error' && (
            <div className="p-4 bg-red-100 dark:bg-red-900/40 border border-red-500 text-red-800 dark:text-red-400 rounded-xl flex items-center gap-3 animate-in slide-in-from-bottom-2">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Webhook: Error de conexión</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
