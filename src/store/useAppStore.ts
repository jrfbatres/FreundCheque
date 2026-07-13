import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  webhookUrl: string;
  setWebhookUrl: (url: string) => void;
  frontImageBase64: string | null;
  setFrontImageBase64: (base64: string) => void;
  frontCoordenates: any;
  setFrontCoordenates: (coords: any) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  clearCaptureData: () => void;
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
      theme: 'dark',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      clearCaptureData: () => set({ frontImageBase64: null, frontCoordenates: null }),
    }),
    {
      name: 'freund-cheque-store',
      partialize: (state) => ({ webhookUrl: state.webhookUrl, theme: state.theme }), // persist these
    }
  )
);
