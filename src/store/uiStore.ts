import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type ActiveTab = 'properties' | 'json' | 'interface' | 'variables';
type SidebarTab = 'nodes' | 'tools';

interface UIState {
  // Active views
  activeTab: ActiveTab;
  sidebarTab: SidebarTab;

  // Configuration panel
  configPanelOpen: boolean;
  selectedNodeId: string | null;

  // UI state
  isSidebarCollapsed: boolean;
  isLoading: boolean;
  lastSavedAt: string | null;

  // Actions
  setActiveTab: (tab: ActiveTab) => void;
  setSidebarTab: (tab: SidebarTab) => void;

  openConfigPanel: (nodeId: string) => void;
  closeConfigPanel: () => void;
  setSelectedNodeId: (nodeId: string | null) => void;

  toggleSidebar: () => void;
  setIsLoading: (loading: boolean) => void;
  setLastSavedAt: (timestamp: string) => void;
}

export const useUIStore = create<UIState>()(
  immer((set) => ({
    activeTab: 'properties',
    sidebarTab: 'nodes',

    configPanelOpen: false,
    selectedNodeId: null,

    isSidebarCollapsed: false,
    isLoading: false,
    lastSavedAt: null,

    setActiveTab: (tab) => set((state) => {
      state.activeTab = tab;
    }),

    setSidebarTab: (tab) => set((state) => {
      state.sidebarTab = tab;
    }),

    openConfigPanel: (nodeId) => set((state) => {
      state.configPanelOpen = true;
      state.selectedNodeId = nodeId;
    }),

    closeConfigPanel: () => set((state) => {
      state.configPanelOpen = false;
      state.selectedNodeId = null;
    }),

    setSelectedNodeId: (nodeId) => set((state) => {
      state.selectedNodeId = nodeId;
    }),

    toggleSidebar: () => set((state) => {
      state.isSidebarCollapsed = !state.isSidebarCollapsed;
    }),

    setIsLoading: (loading) => set((state) => {
      state.isLoading = loading;
    }),

    setLastSavedAt: (timestamp) => set((state) => {
      state.lastSavedAt = timestamp;
    }),
  }))
);
