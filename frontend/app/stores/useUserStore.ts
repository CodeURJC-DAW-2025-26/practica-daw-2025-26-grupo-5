// ============================================================================
// FILE: frontend/app/stores/useUserStore.ts
// UPDATED: Complete JSDoc documentation with English comments
// ============================================================================

/**
 * User Authentication Store (Zustand)
 *
 * Central state management for user authentication in the Stilnovo marketplace.
 * Uses Zustand for lightweight, performant global state with automatic persistence.
 *
 * Responsibilities:
 * - Maintain current user session state
 * - Track authentication loading states
 * - Handle login/logout operations
 * - Store and display authentication errors
 * - Persist user data across page refreshes
 * - Provide auth state to all components via React hooks
 *
 * State Persistence:
 * - User data automatically saved to localStorage
 * - Persisted data restored on app restart
 * - Survives page refreshes and browser restarts
 * - Configuration: storage key = "stilnovo-user-storage"
 * - Uses Zustand persist middleware for automatic management
 *
 * Data Flow:
 * 1. Component calls loginUser(username, password)
 * 2. Action calls logIn() from login-service
 * 3. Service sends credentials to backend
 * 4. State updated with user data or error
 * 5. Zustand automatically persists to localStorage
 * 6. Components re-render with updated state
 *
 * Usage Example:
 * const { user, loginUser, logoutUser, isAuthLoading } = useUserStore();
 *
 * @module useUserStore\n * @type {Zustand Store}
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type UserDTO from "~/dto/UserDTO";
import { HttpError } from "~/services/api";
import { logIn, logOut, reqIsLogged } from "~/services/login-service";

/**
 * UserState Interface
 *
 * Defines the shape of the user authentication store.
 * All state properties and action functions are defined here.
 *
 * Properties:
 * - user: Currently authenticated user or null
 * - loginError: Error message from failed login attempt
 * - isAuthLoading: Flag indicating auth operation in progress
 *
 * Actions:
 * - loadLoggedUser: Restore session from server
 * - loginUser: Authenticate with credentials
 * - logoutUser: End current session
 * - setUser: Manually set user (rarely used)
 */
interface UserState {
  /** Currently authenticated user object or null if not logged in */\n  user: UserDTO | null;

  /** Error message displayed when login fails */
  loginError: string | null;

  /** Flag indicating authentication check/login in progress */
  isAuthLoading: boolean;

  /** Fetch current user from server (restore session on app load) */
  loadLoggedUser: () => Promise<void>;

  /** Authenticate user with username and password */
  loginUser: (username: string, password: string) => Promise<void>;

  /** End current user session and logout */
  logoutUser: () => Promise<void>;

  /** Manually set user state (internal use only) */
  setUser: (user: UserDTO | null) => void;
}

/**
 * Zustand User Store
 *
 * Global authentication state management for the entire app.
 * Persists user data to localStorage automatically.
 *
 * Store Configuration:
 * - Storage: localStorage (browser persistence)
 * - Storage key: "stilnovo-user-storage"
 * - Persisted data: Only 'user' (not errors or loading flags)
 * - Hydration: Automatic on first use
 *
 * Why only persist user?
 * - loginError: Should be shown once then cleared
 * - isAuthLoading: Should reset on page refresh
 * - user: Should survive refresh to keep user logged in
 */
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      /**
       * Initial State Values
       *
       * Set when store is first created or localStorage is cleared.
       * user: null = no user logged in
       * loginError: null = no error message
       * isAuthLoading: true = show spinner on app load (loading session)
       */
      user: null,
      loginError: null,
      isAuthLoading: true,

      /**
       * Load Current User Session
       *
       * Called on app initialization to check if user is still logged in.
       * Attempts to fetch current user from /v1/users/me endpoint.
       *
       * Flow:
       * 1. Set isAuthLoading = true (show loading spinner)
       * 2. Try to fetch current user
       * 3. If successful: Save user to store, clear error
       * 4. If 401: User not logged in, clear user (expected)
       * 5. If other error: Show error message
       * 6. Always set isAuthLoading = false when done
       *
       * Why run on app load?
       * - User may have logged in previously
       * - Token stored in HTTP-only cookie persists across refreshes
       * - Restores session without requiring re-login
       * - Provides seamless user experience
       */
      loadLoggedUser: async () => {
        set({ isAuthLoading: true, loginError: null });
        try {
          const user = await reqIsLogged();
          set({ user, isAuthLoading: false });
        } catch (error) {
          // 401 = not logged in (expected, not an error)
          if (error instanceof HttpError && error.status === 401) {
            set({ user: null, loginError: null, isAuthLoading: false });
            return;
          }
          // Other errors = unexpected, log and display
          console.error("Failed to load logged-in user:", error);
          set({ user: null, loginError: "Failed to load logged-in user", isAuthLoading: false });
        }
      },

      /**
       * Login User with Credentials
       *
       * Authenticates user by sending username and password to server.
       * On success, fetches and stores user data.
       * On error, displays appropriate error message.
       *
       * Process:
       * 1. Set isAuthLoading = true, clear previous errors
       * 2. Send credentials to backend via logIn()
       * 3. Call loadLoggedUser() to fetch and store user data
       * 4. If error: Set loginError message, stop loading
       * 5. Zustand automatically persists user to localStorage
       *
       * Why call loadLoggedUser after logIn?
       * - logIn only authenticates, doesn't return full user object
       * - loadLoggedUser fetches complete user data from /v1/users/me
       * - Ensures user store has all user details
       * - Synchronizes with server (confirms token is valid)
       */
      loginUser: async (username: string, password: string) => {
        set({ isAuthLoading: true, loginError: null });
        try {
          await logIn(username, password);
          // After successful login, fetch complete user data
          await get().loadLoggedUser();
        } catch (error) {
          console.error("Login error:", error);
          const message = "Incorrect username or password. Please try again.";
          set({ loginError: message, isAuthLoading: false });
        }
      },

      /**
       * Logout User
       *
       * Ends current user session and clears authentication state.
       * Calls server to invalidate token and clears client state.
       *
       * Process:
       * 1. Set isAuthLoading = true (show spinner)
       * 2. Call logOut() on server to invalidate token
       * 3. Clear user from store
       * 4. Clear loginError
       * 5. Set isAuthLoading = false
       *
       * Error Handling:
       * - Even if logout fails, clear user state
       * - User redirects to home/login (show guest view)
       * - Error logged but doesn't prevent clearing state
       * - Ensures user is never stuck logged in
       */
      logoutUser: async () => {
        set({ isAuthLoading: true, loginError: null });
        try {
          await logOut();
          set({ user: null, isAuthLoading: false });
        } catch (error) {
          console.error("Logout error:", error);
          // Still clear user even if logout fails on server
          set({ loginError: "Logout failed. Please try again.", isAuthLoading: false });
        }
      },

      /**
       * Set User State Manually
       *
       * Direct state setter for user object.
       * Rarely used - most operations use login/logout actions.
       */
      setUser: (user: UserDTO | null) => {
        set({ user });
      },
    }),
    {
      /**
       * Persist Middleware Configuration
       *
       * Configures how state is persisted to localStorage.
       * Automatically saves to localStorage after each state change.
       * Restores from localStorage on app load.
       */
      name: "stilnovo-user-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
