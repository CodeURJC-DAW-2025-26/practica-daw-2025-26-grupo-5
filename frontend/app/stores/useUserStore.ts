import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type UserDTO from "~/dto/UserDTO";
import { HttpError } from "~/services/api";
import { logIn, logOut, reqIsLogged } from "~/services/login-service";

interface UserState {
  user: UserDTO | null;
  loginError: string | null;
  isAuthLoading: boolean;
  loadLoggedUser: () => Promise<void>;
  loginUser: (username: string, password: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  setUser: (user: UserDTO | null) => void;
}

/**
 * Zustand User Store
 * Manages global user authentication state
 * ACTUALLY persists user data using localStorage now!
 */
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      loginError: null,
      isAuthLoading: true,

      loadLoggedUser: async () => {
        set({ isAuthLoading: true, loginError: null });
        try {
          const user = await reqIsLogged();
          set({ user, isAuthLoading: false });
        } catch (error) {
          if (error instanceof HttpError && error.status === 401) {
            set({ user: null, loginError: null, isAuthLoading: false });
            return;
          }
          console.error("Failed to load logged-in user:", error);
          set({ user: null, loginError: "Failed to load logged-in user", isAuthLoading: false });
        }
      },

      loginUser: async (username: string, password: string) => {
        set({ isAuthLoading: true, loginError: null });
        try {
          await logIn(username, password);
          await get().loadLoggedUser();
        } catch (error) {
          console.error("Login error:", error);
          const message = "Incorrect username or password. Please try again.";
          set({ loginError: message, isAuthLoading: false });
        }
      },

      logoutUser: async () => {
        set({ isAuthLoading: true, loginError: null });
        try {
          await logOut();
          set({ user: null, isAuthLoading: false });
        } catch (error) {
          console.error("Logout error:", error);
          set({ loginError: "Logout failed. Please try again.", isAuthLoading: false });
        }
      },

      setUser: (user: UserDTO | null) => {
        set({ user });
      },
    }),
    {
      name: "stilnovo-user-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);