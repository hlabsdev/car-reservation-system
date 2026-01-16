import { create } from 'zustand';
import type {User} from '../../types';
import { authService } from './authService';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    fetchUser: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: authService.isAuthenticated(),
    isLoading: false,

    login: async (username: string, password: string) => {
        set({ isLoading: true });
        try {
            await authService.login({ username, password });
            const user = await authService.getCurrentUser();
            set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    logout: () => {
        authService.logout();
        set({ user: null, isAuthenticated: false });
    },

    fetchUser: async () => {
        if (!authService.isAuthenticated()) return;

        set({ isLoading: true });
        try {
            const user = await authService.getCurrentUser();
            set({ user, isAuthenticated: true, isLoading: false });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            set({ isLoading: false });
            authService.logout();
        }
    },
}));