import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * User Interface defining the data structure 
 * we receive from the Spring Boot backend.
 */
interface User {
    username: string;
    roles: string[];
    // Add more fields if needed (email, id, etc.)
}

/**
 * Store state and actions definition.
 */
interface UserState {
    user: User | null;
    isLoggedIn: boolean;
    // Actions
    login: (userData: User) => void;
    logout: () => void;
    isAdmin: () => boolean;
}

/**
 * Zustand Store for Global User Management.
 * Uses 'persist' middleware to keep the user logged in 
 * even if the page is refreshed.
 */
export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            user: null,
            isLoggedIn: false,

            // Set user data after successful login
            login: (userData: User) => set({
                user: userData,
                isLoggedIn: true
            }),

            // Clear user data on logout
            logout: () => set({
                user: null,
                isLoggedIn: false
            }),

            // Helper to check for ADMIN role easily
            isAdmin: () => {
                const user = get().user;
                return user?.roles.includes('ROLE_ADMIN') || false;
            },
        }),
        {
            name: 'stilnovo-user-storage', // Key for localStorage
        }
    )
);
