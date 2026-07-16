import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Client {
  id: string;
  name: string;
  nrc: string;
  location: string;
}

export interface ScannedCheck {
  id: string;
  emitter: string;
  amount: string;
  date: string;
  status: 'Validado' | 'En tránsito' | 'Liquidado' | 'Rechazado';
  numCheque: string;
  icon: string;
  beneficiario?: string;
  banco?: string;
  cuenta?: string;
  lineaMICR?: string;
  cliente?: Client | null;
  montoLetras?: string;
}

interface AppState {
  webhookUrl: string;
  setWebhookUrl: (url: string) => void;
  frontImageBase64: string | null;
  setFrontImageBase64: (base64: string) => void;
  frontCoordenates: any;
  setFrontCoordenates: (coords: any) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  extractedText: string;
  setExtractedText: (text: string) => void;
  clearCaptureData: () => void;
  selectedClient: Client | null;
  setSelectedClient: (client: Client | null) => void;
  scannedChecks: ScannedCheck[];
  addScannedCheck: (check: ScannedCheck) => void;
  azureApiKey: string;
  setAzureApiKey: (key: string) => void;
  azureEndpoint: string;
  setAzureEndpoint: (endpoint: string) => void;
  smtpHost: string;
  setSmtpHost: (host: string) => void;
  smtpPort: string;
  setSmtpPort: (port: string) => void;
  smtpUser: string;
  setSmtpUser: (user: string) => void;
  smtpPass: string;
  setSmtpPass: (pass: string) => void;
  smtpFrom: string;
  setSmtpFrom: (from: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      webhookUrl: '',
      setWebhookUrl: (url) => set({ webhookUrl: url }),
      frontImageBase64: null,
      setFrontImageBase64: (base64) => set({ frontImageBase64: base64 }),
      frontCoordenates: null,
      setFrontCoordenates: (coords) => set({ frontCoordenates: coords }),
      extractedText: '',
      setExtractedText: (text) => set({ extractedText: text }),
      theme: 'dark',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      clearCaptureData: () => set({ frontImageBase64: null, frontCoordenates: null, extractedText: '', selectedClient: null }),
      selectedClient: null,
      setSelectedClient: (client) => set({ selectedClient: client }),
      scannedChecks: [],
      addScannedCheck: (check) => set((state) => ({ scannedChecks: [check, ...state.scannedChecks] })),
      azureApiKey: '',
      setAzureApiKey: (key) => set({ azureApiKey: key }),
      azureEndpoint: '',
      setAzureEndpoint: (endpoint) => set({ azureEndpoint: endpoint }),
      smtpHost: '',
      setSmtpHost: (host) => set({ smtpHost: host }),
      smtpPort: '',
      setSmtpPort: (port) => set({ smtpPort: port }),
      smtpUser: '',
      setSmtpUser: (user) => set({ smtpUser: user }),
      smtpPass: '',
      setSmtpPass: (pass) => set({ smtpPass: pass }),
      smtpFrom: '',
      setSmtpFrom: (from) => set({ smtpFrom: from }),
    }),
    {
      name: 'freund-cheque-store',
      partialize: (state) => ({ 
        webhookUrl: state.webhookUrl, 
        theme: state.theme, 
        scannedChecks: state.scannedChecks,
        azureApiKey: state.azureApiKey,
        azureEndpoint: state.azureEndpoint,
        smtpHost: state.smtpHost,
        smtpPort: state.smtpPort,
        smtpUser: state.smtpUser,
        smtpPass: state.smtpPass,
        smtpFrom: state.smtpFrom
      }),
    }
  )
);
