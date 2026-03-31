import { create } from 'zustand';

/**
 * Global Loading Store to manage the application spinner state.
 */
interface LoadingState {
    isLoading: boolean;
    setLoading: (loading: boolean) => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
    isLoading: false,
    setLoading: (loading: boolean) => set({ isLoading: loading }),
}));
