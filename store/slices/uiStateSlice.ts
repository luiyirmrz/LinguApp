import { StateCreator } from 'zustand';

export type Theme = 'light' | 'dark' | 'system';

export interface UIState {
  theme: Theme;
  isLoading: boolean;
  isModalOpen: boolean;
  activeTab: string;
  sidebarOpen: boolean;
  notifications: any[];
}

export interface UIStateSlice {
  theme: Theme;
  isLoading: boolean;
  isModalOpen: boolean;
  activeTab: string;
  sidebarOpen: boolean;
  notifications: any[];
  setTheme: (theme: Theme) => void;
  setLoading: (loading: boolean) => void;
  setModalOpen: (open: boolean) => void;
  setActiveTab: (tab: string) => void;
  setSidebarOpen: (open: boolean) => void;
  addNotification: (notification: any) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const createUIStateSlice: StateCreator<UIStateSlice> = (set, get) => ({
  theme: 'system',
  isLoading: false,
  isModalOpen: false,
  activeTab: 'home',
  sidebarOpen: false,
  notifications: [],

  setTheme: (theme: Theme) => {
    set({ theme });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setModalOpen: (open: boolean) => {
    set({ isModalOpen: open });
  },

  setActiveTab: (tab: string) => {
    set({ activeTab: tab });
  },

  setSidebarOpen: (open: boolean) => {
    set({ sidebarOpen: open });
  },

  addNotification: (notification: any) => {
    const { notifications } = get();
    set({
      notifications: [...notifications, { ...notification, id: Date.now().toString() }],
    });
  },

  removeNotification: (id: string) => {
    const { notifications } = get();
    set({
      notifications: notifications.filter(n => n.id !== id),
    });
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },
});
