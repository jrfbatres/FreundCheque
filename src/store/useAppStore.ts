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
    }),
    {
      name: 'freund-cheque-store',
      partialize: (state) => ({ 
        webhookUrl: state.webhookUrl, 
        theme: state.theme, 
        scannedChecks: state.scannedChecks 
      }),
    }
  )
);
