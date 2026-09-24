import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FiscalYearInfo {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  isClosed?: boolean;
}

interface UiState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  mobileDrawerOpen: boolean;
  setMobileDrawerOpen: (open: boolean) => void;

  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  activeFiscalYear: FiscalYearInfo | null;
  setActiveFiscalYear: (fy: FiscalYearInfo | null) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed: boolean) => set({ sidebarCollapsed: collapsed }),

      mobileDrawerOpen: false,
      setMobileDrawerOpen: (open: boolean) => set({ mobileDrawerOpen: open }),

      commandPaletteOpen: false,
      setCommandPaletteOpen: (open: boolean) => set({ commandPaletteOpen: open }),

      activeFiscalYear: null,
      setActiveFiscalYear: (fy: FiscalYearInfo | null) => set({ activeFiscalYear: fy }),
    }),
    {
      name: "isaii_ui_prefs",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        activeFiscalYear: state.activeFiscalYear,
      }),
    }
  )
);
