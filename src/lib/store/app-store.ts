import { create } from "zustand";

interface AppState {
  isAddSheetOpen: boolean;
  openAddSheet: () => void;
  closeAddSheet: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isAddSheetOpen: false,
  openAddSheet: () => set({ isAddSheetOpen: true }),
  closeAddSheet: () => set({ isAddSheetOpen: false }),
}));
