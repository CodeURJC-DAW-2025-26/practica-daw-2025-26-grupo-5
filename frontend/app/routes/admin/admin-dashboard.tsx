import { redirect, Link } from 'react-router';
import { getAdminSummary } from '~/services/admin-service';
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

interface KPIData {
  readonly label: string;
  readonly value: string | number;
  readonly color: string;
  readonly icon: string;
}

export default function AdminDashboard({ loaderData }: Readonly<{ loaderData: any }>) {
  const summary = loaderData || {};
  const numUsers = summary?.numUsers || 0;
  const numBanneds = summary?.numBanneds || 0;
  const totalProducts = (summary?.totalProductCount || summary?.recentProducts?.length) || 0;
  const memoryUsageStr = summary?.memoryUsage || "0 MB";
  const memoryUsage = Number.parseInt(memoryUsageStr.toString()) || 0;
  const users = summary?.recentUsers || [];
  const products = summary?.recentProducts || [];

  // Calculate metrics
  const totalRevenue = summary?.totalRevenue || 0;
  const averageRating = users.length > 0 
    ? (users.reduce((sum: number, u: any) => sum + (u.rating || 0), 0) / users.length).toFixed(1) 
    : '0';
  const activeUsers = numUsers - numBanneds;
  
  // Products by category
  const categoryMap: Record<string, number> = {};
  products.forEach((p: any) => {
    const cat = p.category || 'Other';
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });

  // Main KPIs (4 columns - simple and clean)
  const mainKPIs: readonly KPIData[] = [
    { label: 'TOTAL REVENUE', value: `${totalRevenue.toFixed(2)} €`, color: '#059669', icon: 'fa-euro-sign' },
    { label: 'ACTIVE USERS', value: activeUsers, color: '#0369a1', icon: 'fa-users' },
    { label: 'AVG RATING', value: `${averageRating}★`, color: '#d97706', icon: 'fa-star' },
    { label: 'PRODUCTS', value: totalProducts, color: '#7c3aed', icon: 'fa-box' },
  ];

  const getKPIBg = (color: string): string => {
    const map: Record<string, string> = {
      '#059669': '#ecfdf5',
      '#0369a1': '#e0f2fe',
      '#d97706': '#fef3c7',
      '#7c3aed': '#f3e8ff',
    };
    return map[color] || '#f3f4f6';
  };

  return (
    <>
      <AdminHeader title="Platform Overview" subtitle="System status and content moderation." />

      <div className="container-fluid">
        {/* ROW 1: Main KPIs - 4 Columns */}
        <div className="row g-3 mb-4">
          {mainKPIs.map((kpi) => (
            <div key={kpi.label} className="col-12 col-sm-6 col-lg-3">
              <div className="clay-card p-4 shadow-sm" style={{ borderLeft: `5px solid ${kpi.color}` }}>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <p className="text-muted small fw-600 mb-0">{kpi.label}</p>
                  <div style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    backgroundColor: getKPIBg(kpi.color),
                  }}>
                    <i className={`fa-solid ${kpi.icon}`} style={{ color: kpi.color, fontSize: '0.9rem' }} />
                  </div>
                </div>
                <h3 className="fw-800 mb-0" style={{ color: kpi.color }}>{kpi.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* ROW 2: User Management + Products by Category */}
        <div className="row g-4 mb-4">
          {/* User Management */}
          <div className="col-12 col-lg-6">
            <div className="clay-card p-4 shadow-sm">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h5 className="fw-800 mb-0">User Management</h5>
                  <p className="text-muted small mb-0">Moderate access and user permissions.</p>
                </div>
                <Link to="/admin/users" className="btn btn-sm btn-outline-primary">
                  View All
                </Link>
              </div>

              {/* User Stats Grid */}
              <div className="row g-3 mb-4">
                <div className="col-6 col-md-3">
                  <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f5f7fa', borderRadius: '8px' }}>
                    <p className="text-muted small mb-1">Total Users</p>
                    <h5 className="fw-800 mb-0" style={{ fontSize: '24px' }}>{numUsers}</h5>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f5f7fa', borderRadius: '8px' }}>
                    <p className="text-muted small mb-1">Active Users</p>
                    <h5 className="fw-800 mb-0" style={{ fontSize: '24px', color: '#059669' }}>{activeUsers}</h5>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f5f7fa', borderRadius: '8px' }}>
                    <p className="text-muted small mb-1">Banned Users</p>
                    <h5 className="fw-800 mb-0" style={{ fontSize: '24px', color: '#dc2626' }}>{numBanneds}</h5>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f5f7fa', borderRadius: '8px' }}>
                    <p className="text-muted small mb-1">Active Rate</p>
                    <h5 className="fw-800 mb-0" style={{ fontSize: '24px', color: '#0369a1' }}>{numUsers > 0 ? ((activeUsers / numUsers) * 100).toFixed(0) : 0}%</h5>
                  </div>
                </div>
              </div>
              
              {users.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table className="table table-sm table-hover mb-0">
                    <thead style={{ backgroundColor: '#f5f7fa' }}>
                      <tr>
                        <th className="text-muted small">USER</th>
                        <th className="text-muted small">EMAIL</th>
                        <th className="text-muted small">STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.slice(0, 5).map((user: any) => (
                        <tr key={user.userId}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <img
                                src={`/api/v1/users/${user.userId}/profile-photo`}
                                alt={user.name}
                                width="32"
                                height="32"
                                style={{ borderRadius: '50%', objectFit: 'cover', backgroundColor: '#e5e7eb' }}
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />
                              <p className="mb-0 fw-600 small">{user.name}</p>
                            </div>
                          </td>
                          <td className="text-muted small">{user.email}</td>
                          <td>
                            <span className={`badge ${user.banned ? 'bg-danger' : 'bg-success'}`}>
                              {user.banned ? 'BANNED' : 'ACTIVE'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted text-center py-4">No users found</p>
              )}
            </div>
          </div>

          {/* Products by Category */}
          <div className="col-12 col-lg-6">
            <div className="clay-card p-4 shadow-sm">
              <h5 className="fw-800 mb-4">Products by Category</h5>
              {Object.keys(categoryMap).length > 0 ? (
                <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                  {Object.entries(categoryMap).map(([category, count]) => {
                    const percentage = totalProducts > 0 ? (count / totalProducts) * 100 : 0;
                    return (
                      <div key={category} className="mb-3">
                        <div className="d-flex justify-content-between mb-2">
                          <span className="small fw-600">{category}</span>
                          <span className="small text-muted">{count} ({percentage.toFixed(0)}%)</span>
                        </div>
                        <div style={{
                          width: '100%',
                          height: '24px',
                          backgroundColor: '#e5e7eb',
                          borderRadius: '6px',
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            width: `${percentage}%`,
                            height: '100%',
                            backgroundColor: '#8b5cf6',
                            transition: 'width 0.3s ease',
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted text-center py-4">No products available</p>
              )}
            </div>
          </div>
        </div>

        {/* ROW 3: Global Inventory + System Status */}
        <div className="row g-4 mb-4">
          {/* Global Inventory */}
          <div className="col-12 col-lg-8">
            <div className="clay-card p-4 shadow-sm">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h5 className="fw-800 mb-0">Global Inventory</h5>
                  <p className="text-muted small mb-0">{totalProducts} products total</p>
                </div>
                <div className="gap-2" style={{ display: 'flex' }}>
                  <Link to="/admin/inventory" className="btn btn-sm btn-outline-primary">
                    See All
                  </Link>
                </div>
              </div>
              
              {products.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table className="table table-sm table-hover mb-0">
                    <thead style={{ backgroundColor: '#f5f7fa' }}>
                      <tr>
                        <th className="text-muted small">PRODUCT</th>
                        <th className="text-muted small">CATEGORY</th>
                        <th className="text-muted small">PRICE</th>
                        <th className="text-muted small">SELLER</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.slice(0, 8).map((product: any) => (
                        <tr key={product.id}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <img
                                src={`/api/v1/products/${product.id}/image`}
                                alt={product.name}
                                width="36"
                                height="36"
                                className="rounded"
                                style={{ objectFit: 'cover', backgroundColor: '#e5e7eb' }}
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />
                              <p className="mb-0 fw-600 small">{product.name}</p>
                            </div>
                          </td>
                          <td className="text-muted small">{product.category}</td>
                          <td className="text-nowrap fw-600">{product.price?.toFixed(2)} €</td>
                          <td className="text-muted small">{product.seller?.name || 'Unknown'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted text-center py-4">No products available</p>
              )}
            </div>
          </div>

          {/* System Status */}
          <div className="col-12 col-lg-4">
            <div className="clay-card p-4 shadow-sm">
              <h5 className="fw-800 mb-4">System Status</h5>
              <div className="row g-3">
                {/* Memory Usage */}
                <div className="col-12">
                  <p className="text-muted small fw-600 mb-2">Memory Usage</p>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="small">{memoryUsage}%</span>
                    <span className="text-muted small">of 512 MB</span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '20px',
                    backgroundColor: '#dbeafe',
                    borderRadius: '6px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${Math.min(memoryUsage, 100)}%`,
                      height: '100%',
                      backgroundColor: '#0369a1',
                    }} />
                  </div>
                </div>

                {/* Banned Users */}
                <div className="col-12">
                  <p className="text-muted small fw-600 mb-2">Banned Users</p>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="small">{numBanneds}/{numUsers}</span>
                    <span className="text-muted small">{numUsers > 0 ? ((numBanneds / numUsers) * 100).toFixed(1) : 0}%</span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '20px',
                    backgroundColor: '#fee2e2',
                    borderRadius: '6px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${numUsers > 0 ? (numBanneds / numUsers) * 100 : 0}%`,
                      height: '100%',
                      backgroundColor: '#dc2626',
                    }} />
                  </div>
                </div>

                {/* Platform Status */}
                <div className="col-12">
                  <p className="text-muted small fw-600 mb-2">Platform Status</p>
                  <div className="d-flex align-items-center gap-2">
                    <i className="fa-solid fa-circle text-success" style={{ fontSize: '0.6rem' }} />
                    <span className="fw-600 small">Stable</span>
                  </div>
                  <p className="text-muted small mb-0" style={{ marginTop: '4px' }}>All systems operational</p>
                </div>

                {/* Revenue Trend */}
                <div className="col-12">
                  <p className="text-muted small fw-600 mb-2">Revenue This Month</p>
                  <h4 className="fw-800 mb-0" style={{ color: '#059669' }}>€{totalRevenue.toFixed(0)}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 4: Additional Metrics */}
        <div className="row g-4">
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="clay-card p-4 text-center shadow-sm">
              <i className="fa-solid fa-chart-line" style={{ fontSize: '2rem', color: '#059669', marginBottom: '8px', display: 'block' }} />
              <p className="text-muted small mb-1">Active Listings</p>
              <h3 className="fw-800 mb-0" style={{ color: '#059669' }}>{totalProducts}</h3>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="clay-card p-4 text-center shadow-sm">
              <i className="fa-solid fa-users" style={{ fontSize: '2rem', color: '#0369a1', marginBottom: '8px', display: 'block' }} />
              <p className="text-muted small mb-1">Active Users</p>
              <h3 className="fw-800 mb-0" style={{ color: '#0369a1' }}>{activeUsers}</h3>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="clay-card p-4 text-center shadow-sm">
              <i className="fa-solid fa-star" style={{ fontSize: '2rem', color: '#d97706', marginBottom: '8px', display: 'block' }} />
              <p className="text-muted small mb-1">Average Rating</p>
              <h3 className="fw-800 mb-0" style={{ color: '#d97706' }}>{averageRating}★</h3>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="clay-card p-4 text-center shadow-sm">
              <i className="fa-solid fa-lock-open" style={{ fontSize: '2rem', color: '#7c3aed', marginBottom: '8px', display: 'block' }} />
              <p className="text-muted small mb-1">Active Rate</p>
              <h3 className="fw-800 mb-0" style={{ color: '#7c3aed' }}>{numUsers > 0 ? ((activeUsers / numUsers) * 100).toFixed(0) : 0}%</h3>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function ErrorBoundary({ error }: Readonly<{ error: Error }>) {
  return (
    <div className="container mt-5">
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Error loading dashboard</h4>
        <p>{error.message}</p>
      </div>
    </div>
  );
}
