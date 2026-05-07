import { create } from 'zustand';

interface ModalState {
  promptConfig: { isOpen: boolean; title: string; defaultValue: string; resolve: (val: string | null) => void } | null;
  confirmConfig: { isOpen: boolean; title: string; resolve: (val: boolean) => void } | null;
  showPrompt: (title: string, defaultValue?: string) => Promise<string | null>;
  showConfirm: (title: string) => Promise<boolean>;
  closePrompt: (val: string | null) => void;
  closeConfirm: (val: boolean) => void;
}

export const useModalStore = create<ModalState>((set) => ({
  promptConfig: null,
  confirmConfig: null,
  
  showPrompt: (title, defaultValue = '') => new Promise((resolve) => {
    set({ promptConfig: { isOpen: true, title, defaultValue, resolve } });
  }),
  
  closePrompt: (val) => set((state) => {
    state.promptConfig?.resolve(val);
    return { promptConfig: null };
  }),
  
  showConfirm: (title) => new Promise((resolve) => {
    set({ confirmConfig: { isOpen: true, title, resolve } });
  }),
  
  closeConfirm: (val) => set((state) => {
    state.confirmConfig?.resolve(val);
    return { confirmConfig: null };
  })
}));
