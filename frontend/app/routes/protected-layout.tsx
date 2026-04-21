/**
 * Protected Layout Component
 *
 * This component serves as a wrapper for all authenticated/protected routes in the Stilnovo marketplace.
 * Its primary responsibility is to enforce ban status checks and redirect banned users to a dedicated ban page.
 *
 * Route Protection Strategy:
 * 1. User logs in → Auth status stored in Zustand (useUserStore)
 * 2. User navigates to any protected route → ProtectedLayout renders
 * 3. ProtectedLayout checks if user.banned flag is true
 * 4. If banned → immediate redirect to /banned page
 * 5. If not banned → render nested route content via <Outlet />
 *
 * Ban Status Reactive Updates:
 * - The layout uses useEffect to listen for changes in user.banned
 * - If an admin bans the user (status changes on backend), the store updates
 * - Component automatically detects the change and redirects within 1 update cycle
 *
 * Component Structure:
 * ProtectedLayout
 *   ├── Validates ban status
 *   ├── Redirects to /banned if necessary
 *   └── <Outlet /> renders nested routes (if not banned)
 *
 * Dependencies:
 * - useUserStore (Zustand) - Global authentication state with user.banned flag
 * - React Router 7 - useNavigate, Outlet
 *
 * @returns ReactElement - Either null (while redirecting) or <Outlet /> with nested content
 *
 * @example
 * // In router config:
 * <Route element={<ProtectedLayout />}>
 *   <Route path="/user/page" element={<UserProfile />} />
 *   <Route path="/admin" element={<AdminPanel />} />
 * </Route>
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Outlet } from 'react-router';
import { useUserStore } from '~/stores/useUserStore';

/**
 * Enforces ban status protection for all nested routes.
 * Redirects banned users to /banned page and prevents access to protected areas.
 */
export default function ProtectedLayout() {
  const navigate = useNavigate();
  // Get current user from global authentication store
  const user = useUserStore((state) => state.user);

  /**
   * Effect Hook: Monitor ban status changes
   *
   * This effect runs whenever the user object changes.
   * If the user is flagged as banned, immediately redirect to the ban page.
   *
   * Why use replace: true?
   * - Prevents adding another entry to browser history
   * - Banned users cannot use back button to escape the /banned page
   * - Cleaner navigation stack for user experience
   *
   * Dependencies: [user, navigate]
   * - user: Re-checks ban status whenever user object updates
   * - navigate: Function reference from router
   */
  useEffect(() => {
    // If user is banned, ALWAYS redirect to /banned page
    // The 'replace: true' option overwrites current history entry instead of pushing a new one
    if (user && user.banned) {
      navigate('/banned', { replace: true });
    }
  }, [user, navigate]);

  /**
   * Conditional Rendering: Prevent flashing banned content
   *
   * While the redirect is happening, return null instead of rendering <Outlet />.
   * This prevents a brief visual flicker of protected content before the redirect completes.
   */
  if (user && user.banned) {
    return null;
  }

  /**
   * Render nested routes from router configuration
   * <Outlet /> is a React Router component that renders child routes
   * (e.g., UserProfile, AdminPanel, etc.)
   */
  return <Outlet />;
}
