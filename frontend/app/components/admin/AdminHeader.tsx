import { useUserStore } from '~/stores/useUserStore';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
}

/**
 * Admin Page Header Component
 * Shows page title and current user info (simplified, dropdown in main Header)
 */
export default function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  const { user } = useUserStore();

  return (
    <header className="d-flex justify-content-between align-items-center mb-5">
      <div>
        <h1 className="fw-800 h2" style={{ color: '#1A365D', marginBottom: '0.5rem' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-muted small" style={{ marginBottom: 0 }}>
            {subtitle}
          </p>
        )}
      </div>

      <div className="d-none d-lg-flex align-items-center gap-3 text-end">
        <div>
          <p className="fw-800 mb-0 small text-dark">{user?.name || 'Admin'}</p>
          <p className="x-small text-muted mb-0">Superuser Access</p>
        </div>
        <div
          className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center fw-800 shadow-sm"
          style={{ width: '48px', height: '48px', fontSize: '0.85rem' }}
        >
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
