import { create } from "zustand";
import type UserDTO from "~/dto/UserDTO";
import { HttpError, logIn, logOut, reqIsLogged } from "~/services/login-service";

/**
 * User Store State Interface
 * Manages authentication state and user data
 */
interface UserState {
  user: UserDTO | null;
  loginError: string | null;
  isAuthLoading: boolean;
  loadLoggedUser: () => Promise<void>;
  loginUser: (username: string, password: string) => Promise<void>;
  logoutUser: () => Promise<void>;
}

/**
 * Zustand User Store
 * Manages global user authentication state
 * Persists user data using localStorage
 */
export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  loginError: null,
  isAuthLoading: true,

  /**
   * Load current logged-in user from backend
   */
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

  /**
   * Login user with username and password
   */
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

  /**
   * Logout user
   */
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
}));
