/**
 * Authentication Service Module
 *
 * This service handles all authentication-related API communication with the Stilnovo backend.
 * It provides the core functions needed for user login/logout and session management.
 *
 * Authentication Flow:
 * 1. User submits credentials on login page
 * 2. Service sends POST request to /v1/auth/login
 * 3. Backend validates credentials and returns authentication token
 * 4. Token stored in HTTP-only cookie (for security) or localStorage
 * 5. Subsequent API requests include token automatically (via api client)
 * 6. Token used to verify user identity on protected endpoints
 *
 * Session Management:
 * - On app load: reqIsLogged() checks if valid session exists
 * - If valid: User data retrieved and stored in Zustand
 * - If invalid (401): Session cleared, user redirected to login
 * - On logout: logOut() invalidates session on server and client
 *
 * Error Handling:
 * - 401 Unauthorized: Invalid credentials (handled by caller)
 * - 400 Bad Request: Invalid input format
 * - 500+ Server Errors: Network/server issues (handled by caller)
 * - All errors thrown to be caught and handled by useUserStore
 *
 * Component Dependencies:
 * - api client: Centralized HTTP client with auth header management
 * - HttpError: Custom error class for API errors
 * - UserDTO: Type definition for user data
 *
 * Usage:
 * - Called exclusively by useUserStore (Zustand store)
 * - Don't use directly in components (use useUserStore instead)
 * - API client handles authentication headers automatically
 *
 * @module login-service
 *
 * @example
 * // In useUserStore (correct usage):
 * const user = await logIn(username, password);
 * // Result: UserDTO with user details and auth token stored
 *
 * @example
 * // In component (incorrect - avoid this):
 * // ❌ DON'T: import { logIn } from '~/services/login-service'
 * // ✅ DO: use useUserStore hook instead
 * const { loginUser } = useUserStore();
 */

import api, { HttpError } from "./api";
import type UserDTO from "~/dto/UserDTO";

/**
 * Check Current Authentication Session
 *
 * Verifies if there is a valid user session and retrieves current user data.
 * Called on app initialization to restore user session from previous login.
 *
 * How it works:
 * - Makes GET request to /v1/users/me (me = current authenticated user)
 * - Backend requires valid authentication token in request headers
 * - If token missing or invalid, server returns 401 Unauthorized
 * - If valid, server returns UserDTO with current user details
 *
 * Token Management:
 * - Token stored in HTTP-only cookie (secure by default)
 * - API client automatically includes token in all requests
 * - No manual token handling needed in this function
 * - Token persists across page refreshes if still valid
 *
 * Use Case:
 * - App initialization: Check if user is logged in
 * - After login: Fetch updated user data
 * - Periodic validation: Ensure token hasn't expired
 *
 * @returns Promise<UserDTO> Current user object containing:
 *   - id: Unique user identifier
 *   - username: User's login username
 *   - name: User's display name
 *   - email: User's email address
 *   - roles: Array of role strings (e.g., ["ROLE_USER", "ROLE_ADMIN"])
 *   - banned: Boolean flag indicating if user is banned
 *   - profilePhoto: URL to user's profile picture
 *   - etc.
 *
 * @throws HttpError with:
 *   - status 401: No valid session (user not logged in)
 *   - status 500+: Server error
 *
 * @example
 * try {
 *   const user = await reqIsLogged();
 *   console.log(`Welcome ${user.name}!`); // User is logged in
 * } catch (error) {
 *   if (error.status === 401) {
 *     console.log('No active session'); // User needs to log in
 *   }
 * }
 */
export async function reqIsLogged(): Promise<UserDTO> {
  return await api.get<UserDTO>("/v1/users/me");
}

/**
 * Authenticate User with Credentials
 *
 * Sends username and password to backend for authentication.
 * Initiates a new user session and returns user data.
 *
 * Authentication Process:
 * 1. User enters username and password on login form
 * 2. Credentials sent in POST request body
 * 3. Backend validates username/password against database
 * 4. If valid: Generate auth token and return user data
 * 5. If invalid: Return 401 error (handled by caller)
 * 6. Token stored in HTTP-only cookie automatically by browser
 * 7. Subsequent requests automatically include token
 *
 * Security Features:
 * - Password sent over HTTPS only (enforced by frontend configuration)
 * - Backend uses bcrypt for password hashing (not stored as plaintext)
 * - HTTP-only cookie prevents JavaScript access to token
 * - CSRF protection on backend
 * - Token has expiration time (user must re-login after expiration)
 *
 * Rate Limiting:
 * - Backend typically implements login attempt rate limiting
 * - Prevents brute force password guessing attacks
 * - Failed attempts may trigger temporary lockout
 *
 * @param username - User's login username (required)
 * @param password - User's password (required)
 *
 * @returns Promise<UserDTO> User object after successful authentication:
 *   - Contains all user details
 *   - Auth token stored in HTTP-only cookie automatically
 *   - User is now authenticated for API requests
 *
 * @throws HttpError with:
 *   - status 401: Invalid username or password
 *   - status 400: Missing/malformed username or password
 *   - status 500+: Server error
 *
 * @example
 * try {
 *   const user = await logIn('john_doe', 'securePassword123');
 *   console.log(`Logged in as ${user.name}`);
 *   // User is now authenticated
 * } catch (error) {
 *   if (error.status === 401) {
 *     console.log('Invalid username or password');
 *   }
 * }
 */
export async function logIn(username: string, password: string): Promise<UserDTO> {
  /**  return await api.post<UserDTO>("/v1/auth/login", {
      username,
      password,
    });
  */

  // Interesting: Backend returns token OR jwt property based on API version
  // Component must handle both response.token && response.jwt
  const response = await api.post("/v1/auth/login", { username, password });
  const token = response.token || response.jwt;
  
  // Store token in localStorage for subsequent requests (api.ts reads this)
  if (token) localStorage.setItem('token', token);
  
  // Return either dedicated user object or entire response as fallback
  return response.user || response;
}

/**
 * Logout Current User
 *
 * Invalidates the current user session on the server.
 * Clears authentication token from client.
 *
 * Logout Process:
 * 1. Makes POST request to /v1/auth/logout endpoint
 * 2. Backend invalidates auth token for current user
 * 3. Token removed from HTTP-only cookie
 * 4. Subsequent API requests without token fail with 401
 * 5. User redirected to login page (by frontend router)
 *
 * Server-Side Logout:
 * - Invalidates token to prevent token reuse
 * - Clears session from database
 * - Logs logout event for security audit
 * - Ensures token cannot be used after logout
 *
 * Client-Side Cleanup:
 * - Zustand store clears user from state
 * - useUserStore resets to initial values (null user, no error)
 * - localStorage cleared (via Zustand persist middleware)
 * - All UI updates to show guest view
 *
 * Security Notes:
 * - Token invalidation prevents token theft exploitation
 * - User must have valid session to logout successfully
 * - Logging out already-logged-out user has no effect (safe)
 *
 * @returns Promise<void> Resolves when logout is complete
 *
 * @throws HttpError with:
 *   - status 401: User not authenticated (but logout still succeeds)
 *   - status 500+: Server error
 *
 * @example
 * try {
 *   await logOut();
 *   console.log('Successfully logged out');
 *   // User returned to login page
 * } catch (error) {
 *   console.error('Logout error:', error);
 *   // Logout still completes, token cleared from storage
 * }
 */
export async function logOut(): Promise<void> {
  try {
    // Tell the server to invalidate the session/token
    await api.post("/v1/auth/logout", {});
  } catch (error) {
    console.error("Server logout failed, but local token will still be cleared", error);
  } finally {
    // THIS is where you add it:
    // Always remove the token from the browser, even if the server request fails
    localStorage.removeItem('token');
  }
}

/**
 * Register New User Account
 * 
 * Creates a new user account with profile photo, username, email, and password.
 * Validates unique username/email and encrypts password on backend.
 * Returns HTTP 200 on success (user must then login separately).
 * 
 * Registration Flow:
 * 1. Collect form data: username, email, password, profile photo
 * 2. Client validates: password confirmation matches
 * 3. Build FormData for multipart submission (file upload)
 * 4. POST to /v1/users endpoint (public, no auth required)
 * 5. Backend validates uniqueness, encrypts password, stores account
 * 6. Return 200 on success or 400/409 on validation errors
 * 
 * MVC Pattern:
 * - signup.tsx calls this function instead of fetch()
 * - Service handles: FormData construction, error parsing
 * - API client adds: Content-Type headers, error wrapping
 * 
 * @param data FormData containing:
 *   - username: unique login name
 *   - email: unique email address
 *   - password: encrypted on backend with bcrypt
 *   - confirmPassword: client validates before sending
 *   - profilePicture: optional image file
 * 
 * @returns Promise<UserDTO> Created user (user must login to get token)
 * 
 * @throws HttpError with:
 *   - status 400: Validation failed (missing fields, weak password)
 *   - status 409: Username/email already exists
 *   - status 500+: Server error
 */
export async function signUp(data: FormData): Promise<UserDTO> {
  return await api.post<UserDTO>("/v1/users", data);
}
