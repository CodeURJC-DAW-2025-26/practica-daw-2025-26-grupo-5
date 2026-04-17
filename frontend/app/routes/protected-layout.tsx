import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Outlet } from 'react-router';
import { useUserStore } from '~/stores/useUserStore';

/**
 * ProtectedLayout: Wraps all protected routes and enforces ban status check
 * If user is banned, redirects to /banned regardless of which route they try to access
 */
export default function ProtectedLayout() {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    // If user is banned, ALWAYS redirect to /banned
    if (user && user.banned) {
      navigate('/banned', { replace: true });
    }
  }, [user, navigate]);

  // Don't render content if user is banned (redirect is happening)
  if (user && user.banned) {
    return null;
  }

  return <Outlet />;
}
