// Persisted appearance toggle (Scrapbook ↔ Monochrome).
//
// Persistence is SYNCHRONOUS (expo-secure-store) so tokens.ts can read the value
// at boot before any module-scope StyleSheet snapshots a palette. Changing the
// appearance writes the new value and reloads the JS bundle, so every screen
// re-evaluates against the new palette with no stale snapshots. The store's
// initial value mirrors whatever tokens.ts read at boot.

import { create } from "zustand";
import { reloadAppAsync } from "expo";
import * as SecureStore from "expo-secure-store";
import type { Appearance } from "./palettes";
import { APPEARANCE_KEY, getAppearance } from "./tokens";

interface AppearanceState {
  appearance: Appearance;
  /** Persist + reload to apply. Reads back from storage on the next boot. */
  setAppearance: (a: Appearance) => Promise<void>;
}

export const useAppearanceStore = create<AppearanceState>((set) => ({
  appearance: getAppearance(),
  setAppearance: async (a) => {
    set({ appearance: a });
    try {
      SecureStore.setItem(APPEARANCE_KEY, a);
    } catch {
      // ignore persistence failure — reload would just restore the old value
    }
    await reloadAppAsync();
  },
}));
