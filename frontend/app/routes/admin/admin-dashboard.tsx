import { redirect } from 'react-router';
import { getAdminSummary } from '~/services/admin-service';
import type AdminSummaryDTO from '~/dtos/AdminSummaryDTO';
import AdminHeader from '~/components/admin/AdminHeader';

export async function clientLoader() {
  try {
    const data = await getAdminSummary();
    return data || {};
  } catch (error) {
    console.error('Failed to fetch admin summary:', error);
    throw redirect('/login');
  }
}

// KPI Configuration
const KPI_CARDS = [
  { label: 'TOTAL USERS', key: 'numUsers', color: '#1A365D', icon: 'fa-users' },
  { label: 'BANNED USERS', key: 'numBanneds', color: '#dc3545', icon: 'fa-ban' },
  { label: 'TOTAL PRODUCTS', key: 'totalProducts', color: '#15803d', icon: 'fa-box' },
  { label: 'MEMORY USAGE', key: 'memoryUsage', color: '#92400e', icon: 'fa-microchip', suffix: '%' },
];

export default function AdminDashboard({ loaderData }: { loaderData: any }) {
  const summary = (loaderData as AdminSummaryDTO) || {};
  const numUsers = summary?.numUsers || 0;
  const numBanneds = summary?.numBanneds || 0;
  const totalProducts = summary?.products?.length || 0;
  const memoryUsage = summary?.memoryUsage || 0;

  // KPI values for rendering
  const kpiValues = {
    numUsers,
    numBanneds,
    totalProducts,
    memoryUsage,
  };

  return (
    <>
      <AdminHeader title="Admin Dashboard" subtitle="System overview and key metrics" />

      {/* KPI Cards */}
      <div className="container-fluid">
        <div className="row g-3 mb-5">
          {KPI_CARDS.map((card) => {
            const value = kpiValues[card.key as keyof typeof kpiValues];
            const bgColor = card.color === '#1A365D' ? '#eff5ff' : card.color === '#dc3545' ? '#fee2e2' : card.color === '#15803d' ? '#dcfce7' : '#fef3c7';
            return (
              <div key={card.key} className="col-12 col-sm-6 col-md-3">
                <div className="clay-card p-4 d-flex align-items-center justify-content-between">
                  <div>
                    <p className="label-categories mb-2">{card.label}</p>
                    <h2 className="fw-800 mb-0" style={{ color: card.color }}>
                      {value}{card.suffix || ''}
                    </h2>
                  </div>
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '12px',
                      backgroundColor: bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      color: card.color,
                    }}
                  >
                    <i className={`fa-solid ${card.icon}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Row - Visual Data Display */}
        <div className="row g-4">
          <div className="col-lg-6">
            <div className="clay-card p-4 shadow-sm" style={{ borderRadius: '12px' }}>
              <h5 className="fw-800 mb-4" style={{ color: '#1A365D' }}>
                <i className="fa-solid fa-chart-pie me-2" />
                User Status Distribution
              </h5>
              <div className="d-flex align-items-end gap-4">
                <div className="flex-grow-1">
                  <div style={{ marginBottom: '16px' }}>
                    <p className="mb-2 fw-700 small text-success">
                      <i className="fa-solid fa-circle text-success me-2" style={{ fontSize: '0.5rem' }} />
                      Active Users: {numUsers - numBanneds}
                    </p>
                    <div style={{
                      width: '100%',
                      height: '30px',
                      backgroundColor: '#e0f2fe',
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${numUsers > 0 ? ((numUsers - numBanneds) / numUsers) * 100 : 0}%`,
                        height: '100%',
                        backgroundColor: '#2f6ced',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 fw-700 small text-danger">
                      <i className="fa-solid fa-circle text-danger me-2" style={{ fontSize: '0.5rem' }} />
                      Banned Users: {numBanneds}
                    </p>
                    <div style={{
                      width: '100%',
                      height: '30px',
                      backgroundColor: '#fee2e2',
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${numUsers > 0 ? (numBanneds / numUsers) * 100 : 0}%`,
                        height: '100%',
                        backgroundColor: '#dc3545',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="clay-card p-4 shadow-sm" style={{ borderRadius: '12px' }}>
              <h5 className="fw-800 mb-4" style={{ color: '#1A365D' }}>
                <i className="fa-solid fa-chart-column me-2" />
                Products by Category
              </h5>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {(() => {
                  const categoryMap: Record<string, number> = {};
                  const maxCat = Math.max(1, ...Object.values(categoryMap || {}));
                  summary?.products?.forEach((p: any) => {
                    const cat = p.category || 'Other';
                    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
                  });

                  return Object.entries(categoryMap).map(([category, count]) => (
                    <div key={category} style={{ marginBottom: '12px' }}>
                      <p className="mb-2 fw-700 small" style={{ color: '#1A365D' }}>
                        {category}: <span style={{ color: '#2f6ced' }}>{count}</span>
                      </p>
                      <div style={{
                        width: '100%',
                        height: '20px',
                        backgroundColor: '#f1f4f8',
                        borderRadius: '6px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${totalProducts > 0 ? (count / totalProducts) * 100 : 0}%`,
                          height: '100%',
                          backgroundColor: '#2f6ced',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>
                  ));
                })()}
                {totalProducts === 0 && (
                  <p className="text-muted text-center py-4">No products available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div className="alert alert-danger m-5" role="alert">
      <h4 className="alert-heading">Error Loading Dashboard!</h4>
      <p>{error instanceof Error ? error.message : 'An unexpected error occurred'}</p>
      <button className="btn btn-outline-danger" onClick={() => (window.location.href = '/')}>
        Back to home
      </button>
    </div>
  );
}
