import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  createPreferencesSlice,
  type PreferencesSlice,
} from "./slices/preferencesSlice";
type StoreState = PreferencesSlice;

export const useStore = create<StoreState>()(
  persist(
    (...a) => ({
      ...createPreferencesSlice(...a),
    }),
    {
      name: "fluxblog-ui-store",
      partialize: (state) => ({
        theme: state.theme,
        lang: state.lang,
      }),
    },
  ),
);
