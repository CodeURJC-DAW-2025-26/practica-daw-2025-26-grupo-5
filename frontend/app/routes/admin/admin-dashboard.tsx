/**
 * Admin Dashboard Page
 *
 * Main overview page for marketplace administrators.
 * Displays key performance indicators and system health metrics.
 *
 * Features:
 * - Revenue and transaction analytics
 * - User statistics (total, active, banned)
 * - Product inventory overview (total, active listings)
 * - System memory usage monitoring
 * - Recent users table showing latest registrations
 * - Recent products table showing latest listings
 * - Category breakdown of available products
 * - KPI cards with color coding and icons
 * - Quick navigation links to detailed management pages
 *
 * KPI Sections:
 * 1. Revenue Metrics:
 *    - Total Revenue (all transactions)
 *    - Total Transactions (count)
 *    - Average Transaction Value
 *    - Total Products (inventory)
 *
 * 2. User Metrics:
 *    - Total Users (active + banned)
 *    - Active Users (not banned)
 *    - Banned Users (restricted accounts)
 *    - Active Listings (products for sale)
 *
 * 3. Data Tables:
 *    - Recent Users: Latest 5 user registrations with roles
 *    - Recent Products: Latest products added with status
 *
 * 4. System Info:
 *    - Memory Usage progress bar
 *    - Global Average Rating from all valorations
 *    - Products by Category breakdown
 *
 * Data Flow:
 * 1. clientLoader fetches getAdminSummary() data
 * 2. Server calculates all metrics and returns summary
 * 3. Component extracts and formats data
 * 4. KPI cards, tables, and charts display information
 * 5. Links navigate to detailed management pages
 *
 * @component
 * @returns React component with admin dashboard and KPIs
 */

import { redirect, Link } from 'react-router';
import { Container, Row, Col, Card, Table, Badge, Button, Image, ProgressBar, Stack, Alert } from 'react-bootstrap';
import { getAdminSummary } from '~/services/admin-service';
import AdminHeader from '~/components/admin/AdminHeader';

/**
 * Client-side loader: Fetches admin summary data
 * Called before component mounts to prepare dashboard data
 */
export async function clientLoader() {
  try {
    const data = await getAdminSummary();
    return data || {};
  } catch (error) {
    console.error('Failed to fetch admin summary:', error);
    throw redirect('/login');
  }
}

/**
 * KPI Card Props Interface
 * Defines structure for dashboard metric cards
 */
interface KPIData {
  readonly label: string;
  readonly value: string | number;
  readonly color: string;
  readonly icon: string;
}

/**
 * Dashboard Props Interface
 * Defines shape of loaderData passed to component
 */
interface DashboardProps {
  readonly loaderData: any;
}

/**
 * KPI Card Component
 * Reusable component for displaying key performance indicators
 * Shows metric name, value, icon, and color-coded styling
 */
const KPICard = ({ label, value, color, icon, bg }: KPIData & { readonly bg: string }) => (
  <Card className="clay-card border-0 h-100" style={{ borderLeft: `5px solid ${color}` }}>
    <Card.Body className="p-4">
      <Stack direction="horizontal" gap={3} className="justify-content-between align-items-start mb-3">
        <h5 className="mb-0 text-dark">{label}</h5>
        <div style={{
          padding: '10px 14px',
          borderRadius: '10px',
          backgroundColor: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <i className={`fa-solid ${icon}`} style={{ color, fontSize: '1.2rem' }} />
        </div>
      </Stack>
      <h2 className="fw-800 mb-0" style={{ color, fontSize: '2.2rem' }}>{value}</h2>
    </Card.Body>
  </Card>
);

export default function AdminDashboard({ loaderData }: DashboardProps) {
  const summary = loaderData || {};
  const numUsers = summary?.numUsers || 0;
  const numBanneds = summary?.numBanneds || 0;
  const totalProducts = (summary?.totalProductCount || 0);
  const activeListings = (summary?.activeListingCount || 0);
  const memoryUsageStr = summary?.memoryUsage || "0 MB";
  const memoryUsage = Number.parseInt(memoryUsageStr.toString()) || 0;
  const users = summary?.recentUsers || [];
  const products = summary?.recentProducts || [];

  // Calculate metrics
  const totalRevenue = summary?.totalRevenue || 0;
  const totalTransactions = summary?.totalTransactions || 0;
  const averageTransactionValue = summary?.averageTransactionValue || 0;
  const averageRating = (summary?.globalAverageRating || 0).toFixed(1);
  const activeUsers = numUsers - numBanneds;

  // Products by category
  const categoryMap: Record<string, number> = {};
  products.forEach((p: any) => {
    const cat = p.category || 'Other';
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });

  // Active products only
  const activeProducts = products.filter((p: any) => p.status?.toLowerCase() === "active");
  const activeProductsCount = activeProducts.length;

  const mainKPIs: readonly KPIData[] = [
    { label: 'Total Revenue', value: `${totalRevenue.toFixed(2)} €`, color: '#059669', icon: 'fa-euro-sign' },
    { label: 'Total Transactions', value: totalTransactions, color: '#0369a1', icon: 'fa-receipt' },
    { label: 'Avg Transaction', value: `${averageTransactionValue.toFixed(2)} €`, color: '#d97706', icon: 'fa-chart-line' },
    { label: 'Total Products', value: totalProducts, color: '#7c3aed', icon: 'fa-box' },
  ];

  const mainKPIs2: readonly KPIData[] = [
    { label: 'Total Users', value: numUsers, color: '#0369a1', icon: 'fa-users' },
    { label: 'Active Users', value: activeUsers, color: '#059669', icon: 'fa-check-circle' },
    { label: 'Banned Users', value: numBanneds, color: '#dc2626', icon: 'fa-ban' },
    { label: 'Active Listings', value: activeListings, color: '#f59e0b', icon: 'fa-chart-line' },
  ];

  const getKPIBg = (color: string): string => {
    const map: Record<string, string> = {
      '#059669': '#ecfdf5',
      '#0369a1': '#e0f2fe',
      '#d97706': '#fef3c7',
      '#7c3aed': '#f3e8ff',
      '#dc2626': '#fee2e2',
      '#f59e0b': '#fef3c7',
    };
    return map[color] || '#f8fafc';
  };

  return (
    <>
      <AdminHeader title="Platform Overview" subtitle="System status and content moderation." />

      {/* KPI Row 1 - Financial & Core */}
      <Row className="g-3 mb-4">
        {mainKPIs.map((kpi) => (
          <Col key={kpi.label} xs={12} sm={6} lg={3}>
            <KPICard {...kpi} bg={getKPIBg(kpi.color)} />
          </Col>
        ))}
      </Row>

      {/* KPI Row 2 - Users & Listings */}
      <Row className="g-3 mb-4">
        {mainKPIs2.map((kpi) => (
          <Col key={kpi.label} xs={12} sm={6} lg={3}>
            <KPICard {...kpi} bg={getKPIBg(kpi.color)} />
          </Col>
        ))}
      </Row>

      <Row className="g-4 mb-4">
        {/* User Management */}
        <Col lg={6}>
          <Card className="clay-card border-0 h-100 p-3">
            <Card.Body>
              <Stack direction="horizontal" gap={3} className="justify-content-between align-items-start mb-4">
                <div>
                  <h5 className="fw-800 mb-0 text-dark">User Management</h5>
                  <p className="text-muted small mb-0">Moderate access and user permissions.</p>
                </div>
                <Link to="/admin/users" className="btn btn-outline-primary btn-sm fw-700 rounded-pill px-3">
                  View All
                </Link>
              </Stack>

              {users.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <Table hover responsive className="table-admin mb-0 align-middle">
                    <thead>
                      <tr>
                        <th>USER</th>
                        <th>EMAIL</th>
                        <th>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.slice(0, 5).map((user: any) => (
                        <tr key={user.userId}>
                          <td>
                            <Stack direction="horizontal" gap={2} className="align-items-center">
                              <Image
                                src={`/api/v1/users/${user.userId}/profile-photo?t=${Date.now()}`}
                                alt={user.name}
                                width={36}
                                height={36}
                                roundedCircle
                                style={{ objectFit: 'cover', backgroundColor: '#e5e7eb' }}
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />
                              <span className="mb-0 fw-700 small">{user.name}</span>
                            </Stack>
                          </td>
                          <td className="text-muted small">{user.email}</td>
                          <td>
                            <span className={`badge-status ${user.banned ? 'status-banned' : 'status-active'}`}>
                              {user.banned ? 'BANNED' : 'ACTIVE'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted text-center py-4">No users found</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Products by Category */}
        <Col lg={6}>
          <Card className="clay-card border-0 h-100 p-3">
            <Card.Body>
              <h5 className="fw-800 mb-4 text-dark">Products by Category</h5>
              {Object.keys(categoryMap).length > 0 ? (
                <div style={{ maxHeight: '350px', overflowY: 'auto' }} className="pe-2">
                  {Object.entries(categoryMap).map(([category, count]) => {
                    const percentage = totalProducts > 0 ? (count / totalProducts) * 100 : 0;
                    return (
                      <div key={category} className="mb-4">
                        <Stack direction="horizontal" gap={3} className="justify-content-between mb-2">
                          {/* Texto normal */}
                          <span className="small fw-700 text-dark">{category}</span>
                          <span className="small text-muted fw-600">{count} ({percentage.toFixed(0)}%)</span>
                        </Stack>
                        <ProgressBar now={percentage} style={{ height: '8px', borderRadius: '10px' }} />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted text-center py-4">No products available</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col lg={8}>
          <Card className="clay-card border-0 h-100 p-3">
            <Card.Body>
              <Stack direction="horizontal" gap={3} className="justify-content-between align-items-start mb-4">
                <div>
                  <h5 className="fw-800 mb-0 text-dark">Active Listings Products</h5>
                  {/* Texto normal */}
                  <p className="text-muted small mb-0">{activeProductsCount} products visible</p>
                </div>
                <Link to="/admin/inventory" className="btn btn-outline-primary btn-sm fw-700 rounded-pill px-3">
                  See All
                </Link>
              </Stack>

              {activeProducts.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <Table hover responsive className="table-admin mb-0 align-middle">
                    <thead>
                      <tr>
                        <th>PRODUCT</th>
                        <th>CATEGORY</th>
                        <th>PRICE</th>
                        <th>SELLER</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeProducts.slice(0, 8).map((product: any) => (
                        <tr key={product.id}>
                          <td>
                            <Stack direction="horizontal" gap={2} className="align-items-center">
                              <Image
                                src={`/api/v1/products/${product.id}/image?t=${Date.now()}`}
                                alt={product.name}
                                width={40}
                                height={40}
                                className="product-img-thumb"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />
                              <span className="mb-0 fw-700 small">{product.name}</span>
                            </Stack>
                          </td>
                          <td><span className="badge-cat cat-tech">{product.category}</span></td>
                          <td className="text-nowrap fw-800 text-success">{product.price?.toFixed(2)} €</td>
                          <td className="text-muted small fw-600">{product.seller?.name || 'Unknown'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted text-center py-4">No active products available</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* System Status */}
        <Col lg={4}>
          <Card className="clay-card border-0 h-100 p-3">
            <Card.Body>
              <h5 className="fw-800 mb-4 text-dark">System Status</h5>
              <Stack gap={4}>
                <div>
                  {/* Texto normal */}
                  <p className="text-muted small fw-600 mb-2">Memory Usage</p>
                  <Stack direction="horizontal" gap={3} className="justify-content-between mb-2">
                    <span className="small fw-800">{memoryUsage}%</span>
                    <span className="text-muted small fw-600">of 512 MB</span>
                  </Stack>
                  <ProgressBar now={Math.min(memoryUsage, 100)} variant="info" style={{ height: '8px', borderRadius: '10px' }} />
                </div>

                <div>
                  {/* Texto normal */}
                  <p className="text-muted small fw-600 mb-2">Banned Users</p>
                  <Stack direction="horizontal" gap={3} className="justify-content-between mb-2">
                    <span className="small fw-800">{numBanneds}/{numUsers}</span>
                    <span className="text-muted small fw-600">{numUsers > 0 ? ((numBanneds / numUsers) * 100).toFixed(1) : 0}%</span>
                  </Stack>
                  <ProgressBar now={numUsers > 0 ? (numBanneds / numUsers) * 100 : 0} variant="danger" style={{ height: '8px', borderRadius: '10px' }} />
                </div>

                <div className="p-3 bg-light rounded-3 mt-2 border">
                  {/* Texto normal */}
                  <p className="text-muted small fw-600 mb-2">Platform Status</p>
                  <Stack direction="horizontal" gap={2} className="align-items-center mb-1">
                    <span className="status-pulse"></span>
                    <span className="fw-800 text-success">Stable</span>
                  </Stack>
                  <p className="text-muted small fw-600 mb-0">All systems operational</p>
                </div>
              </Stack>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}

export function ErrorBoundary({ error }: Readonly<{ error: Error }>) {
  return (
    <Container className="mt-5">
      <Alert variant="danger" className="clay-card">
        <Alert.Heading className="fw-800">Error loading dashboard</Alert.Heading>
        <p className="fw-600">{error.message}</p>
      </Alert>
    </Container>
  );
}