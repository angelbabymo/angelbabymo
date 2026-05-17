import { create } from 'zustand';

interface UIStore {
  addClipOpen: boolean;
  addPostOpen: boolean;
  addIdeaOpen: boolean;
  setAddClipOpen: (open: boolean) => void;
  setAddPostOpen: (open: boolean) => void;
  setAddIdeaOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  addClipOpen: false,
  addPostOpen: false,
  addIdeaOpen: false,
  setAddClipOpen: (open) => set({ addClipOpen: open }),
  setAddPostOpen: (open) => set({ addPostOpen: open }),
  setAddIdeaOpen: (open) => set({ addIdeaOpen: open }),
}));
