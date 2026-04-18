import { redirect, Link } from 'react-router';
import { Container, Row, Col, Card, Table, Badge, Button, Image, ProgressBar, Stack, Alert } from 'react-bootstrap';
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

interface DashboardProps {
  readonly loaderData: any;
}

const KPICard = ({ label, value, color, icon }: KPIData & { readonly bg: string }) => (
  <Card className="border-0 h-100" style={{ 
    borderLeft: `5px solid ${color}`,
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
    borderRadius: '12px',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  }} 
  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
    <Card.Body className="p-4">
      <Stack direction="horizontal" gap={3} className="justify-content-between align-items-start mb-3">
        <p className="text-muted small fw-700 mb-0 text-uppercase" style={{ letterSpacing: '0.5px' }}>{label}</p>
        <div style={{
          padding: '10px 14px',
          borderRadius: '10px',
          backgroundColor: ['#059669', '#0369a1', '#d97706', '#7c3aed'].includes(color) ? 
            ['#ecfdf5', '#e0f2fe', '#fef3c7', '#f3e8ff'][
              ['#059669', '#0369a1', '#d97706', '#7c3aed'].indexOf(color)
            ] : '#f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <i className={`fa-solid ${icon}`} style={{ color, fontSize: '1.2rem' }} />
        </div>
      </Stack>
      <h2 className="fw-900 mb-0" style={{ color, fontSize: '2rem' }}>{value}</h2>
    </Card.Body>
  </Card>
);

const StatBox = ({ label, value, color }: { readonly label: string; readonly value: string | number; readonly color?: string }) => (
  <Col xs={6} md={3}>
    <div style={{ 
      textAlign: 'center', 
      padding: '16px', 
      backgroundColor: color ? 
        { '#059669': '#ecfdf5', '#dc2626': '#fee2e2', '#0369a1': '#e0f2fe' }[color] || '#f5f7fa'
        : '#f5f7fa',
      borderRadius: '12px',
      border: `2px solid ${color ? { '#059669': '#d1fae5', '#dc2626': '#fecaca', '#0369a1': '#bae6fd' }[color] : '#e5e7eb'}`,
      transition: 'all 0.3s ease'
    }}>
      <p className="text-muted small fw-700 mb-2 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>{label}</p>
      <h4 className="fw-900 mb-0" style={{ fontSize: '1.75rem', color }}>{value}</h4>
    </div>
  </Col>
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

  // Active products only (for dashboard display)
  const activeProducts = products.filter((p: any) => p.status?.toLowerCase() === "active");
  const activeProductsCount = activeProducts.length;

  // Main KPIs (4 columns)
  const mainKPIs: readonly KPIData[] = [
    { label: 'TOTAL REVENUE', value: `${totalRevenue.toFixed(2)} €`, color: '#059669', icon: 'fa-euro-sign' },
    { label: 'TOTAL TRANSACTIONS', value: totalTransactions, color: '#0369a1', icon: 'fa-receipt' },
    { label: 'AVG TRANSACTION', value: `${averageTransactionValue.toFixed(2)} €`, color: '#d97706', icon: 'fa-chart-line' },
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

      <Container fluid className="py-5" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #f0f4f8 100%)', minHeight: '100vh' }}>
        {/* ROW 1: Main KPIs - 4 Columns */}
        <Row className="g-3 mb-4">
          {mainKPIs.map((kpi) => (
            <Col key={kpi.label} xs={12} sm={6} lg={3}>
              <KPICard {...kpi} bg={getKPIBg(kpi.color)} />
            </Col>
          ))}
        </Row>

        {/* ROW 2: User Management + Products by Category */}
        <Row className="g-4 mb-4">
          {/* User Management */}
          <Col lg={6}>
            <Card className="border-0 h-100" style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.12)', borderRadius: '16px' }}>
              <Card.Body className="p-5">
                <Stack direction="horizontal" gap={3} className="justify-content-between align-items-start mb-4">
                  <div>
                    <h5 className="fw-800 mb-0">User Management</h5>
                    <p className="text-muted small mb-0">Moderate access and user permissions.</p>
                  </div>
                  <Button as={Link} to="/admin/users" variant="outline-primary" size="sm">
                    View All
                  </Button>
                </Stack>

                {/* User Stats Grid */}
                <Row className="g-3 mb-4">
                  <StatBox label="Total Users" value={numUsers} />
                  <StatBox label="Active Users" value={activeUsers} color="#059669" />
                  <StatBox label="Banned Users" value={numBanneds} color="#dc2626" />
                  <StatBox label="Active Rate" value={`${numUsers > 0 ? ((activeUsers / numUsers) * 100).toFixed(0) : 0}%`} color="#0369a1" />
                </Row>
                
                {users.length > 0 ? (
                  <div style={{ overflowX: 'auto' }}>
                    <Table hover responsive size="sm" className="mb-0">
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
                              <Stack direction="horizontal" gap={2} className="align-items-center">
                                <Image
                                  src={`/api/v1/users/${user.userId}/profile-photo?t=${Date.now()}`}
                                  alt={user.name}
                                  width={32}
                                  height={32}
                                  roundedCircle
                                  style={{ objectFit: 'cover', backgroundColor: '#e5e7eb' }}
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                                <p className="mb-0 fw-600 small">{user.name}</p>
                              </Stack>
                            </td>
                            <td className="text-muted small">{user.email}</td>
                            <td>
                              <Badge bg={user.banned ? 'danger' : 'success'}>
                                {user.banned ? 'BANNED' : 'ACTIVE'}
                              </Badge>
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
            <Card className="border-0 h-100" style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.12)', borderRadius: '16px' }}>
              <Card.Body className="p-5">
                <h5 className="fw-800 mb-4">Products by Category</h5>
                {Object.keys(categoryMap).length > 0 ? (
                  <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                    {Object.entries(categoryMap).map(([category, count]) => {
                      const percentage = totalProducts > 0 ? (count / totalProducts) * 100 : 0;
                      return (
                        <div key={category} className="mb-3">
                          <Stack direction="horizontal" gap={3} className="justify-content-between mb-2">
                            <span className="small fw-600">{category}</span>
                            <span className="small text-muted">{count} ({percentage.toFixed(0)}%)</span>
                          </Stack>
                          <ProgressBar now={percentage} style={{ height: '24px' }} />
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

        {/* ROW 3: Active Listings + System Status */}
        <Row className="g-4 mb-4">
          {/* Active Listings Products */}
          <Col lg={8}>
            <Card className="border-0 h-100" style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.12)', borderRadius: '16px' }}>
              <Card.Body className="p-5">
                <Stack direction="horizontal" gap={3} className="justify-content-between align-items-start mb-4">
                  <div>
                    <h5 className="fw-800 mb-0">Active Listings Products</h5>
                    <p className="text-muted small mb-0">{activeProductsCount} products</p>
                  </div>
                  <Button as={Link} to="/admin/inventory" variant="outline-primary" size="sm">
                    See All
                  </Button>
                </Stack>
                
                {activeProducts.length > 0 ? (
                  <div style={{ overflowX: 'auto' }}>
                    <Table hover responsive size="sm" className="mb-0">
                      <thead style={{ backgroundColor: '#f5f7fa' }}>
                        <tr>
                          <th className="text-muted small">PRODUCT</th>
                          <th className="text-muted small">CATEGORY</th>
                          <th className="text-muted small">PRICE</th>
                          <th className="text-muted small">SELLER</th>
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
                                  width={36}
                                  height={36}
                                  rounded
                                  style={{ objectFit: 'cover', backgroundColor: '#e5e7eb' }}
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                                <p className="mb-0 fw-600 small">{product.name}</p>
                              </Stack>
                            </td>
                            <td className="text-muted small">{product.category}</td>
                            <td className="text-nowrap fw-600">{product.price?.toFixed(2)} €</td>
                            <td className="text-muted small">{product.seller?.name || 'Unknown'}</td>
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
            <Card className="border-0 h-100" style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.12)', borderRadius: '16px' }}>
              <Card.Body className="p-5">
                <h5 className="fw-800 mb-4">System Status</h5>
                <Stack gap={3}>
                  {/* Memory Usage */}
                  <div>
                    <p className="text-muted small fw-600 mb-2">Memory Usage</p>
                    <Stack direction="horizontal" gap={3} className="justify-content-between mb-2">
                      <span className="small">{memoryUsage}%</span>
                      <span className="text-muted small">of 512 MB</span>
                    </Stack>
                    <ProgressBar now={Math.min(memoryUsage, 100)} />
                  </div>

                  {/* Banned Users */}
                  <div>
                    <p className="text-muted small fw-600 mb-2">Banned Users</p>
                    <Stack direction="horizontal" gap={3} className="justify-content-between mb-2">
                      <span className="small">{numBanneds}/{numUsers}</span>
                      <span className="text-muted small">{numUsers > 0 ? ((numBanneds / numUsers) * 100).toFixed(1) : 0}%</span>
                    </Stack>
                    <ProgressBar now={numUsers > 0 ? (numBanneds / numUsers) * 100 : 0} variant="danger" />
                  </div>

                  {/* Platform Status */}
                  <div>
                    <p className="text-muted small fw-600 mb-2">Platform Status</p>
                    <Stack direction="horizontal" gap={2} className="align-items-center">
                      <i className="fa-solid fa-circle text-success" style={{ fontSize: '0.6rem' }} />
                      <span className="fw-600 small">Stable</span>
                    </Stack>
                    <p className="text-muted small mb-0" style={{ marginTop: '4px' }}>All systems operational</p>
                  </div>

                  {/* Revenue Trend */}
                  <div>
                    <p className="text-muted small fw-600 mb-2">Revenue This Month</p>
                    <h4 className="fw-800 mb-0" style={{ color: '#059669' }}>€{totalRevenue.toFixed(0)}</h4>
                  </div>
                </Stack>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* ROW 4: Additional Metrics */}
        <Row className="g-4">
          <Col xs={12} sm={6} lg={3}>
            <Card className="border-0 text-center" style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.12)', borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <i className="fa-solid fa-chart-line" style={{ fontSize: '2rem', color: '#059669', marginBottom: '8px', display: 'block' }} />
                <p className="text-muted small mb-1">Active Listings</p>
                <h3 className="fw-800 mb-0" style={{ color: '#059669' }}>{activeListings}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} lg={3}>
            <Card className="border-0 text-center" style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.12)', borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <i className="fa-solid fa-users" style={{ fontSize: '2rem', color: '#0369a1', marginBottom: '8px', display: 'block' }} />
                <p className="text-muted small mb-1">Active Users</p>
                <h3 className="fw-800 mb-0" style={{ color: '#0369a1' }}>{activeUsers}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} lg={3}>
            <Card className="border-0 text-center" style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.12)', borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <i className="fa-solid fa-star" style={{ fontSize: '2rem', color: '#d97706', marginBottom: '8px', display: 'block' }} />
                <p className="text-muted small mb-1">Average Rating</p>
                <h3 className="fw-800 mb-0" style={{ color: '#d97706' }}>{averageRating}★</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} lg={3}>
            <Card className="border-0 text-center" style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.12)', borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <i className="fa-solid fa-lock-open" style={{ fontSize: '2rem', color: '#7c3aed', marginBottom: '8px', display: 'block' }} />
                <p className="text-muted small mb-1">Active Rate</p>
                <h3 className="fw-800 mb-0" style={{ color: '#7c3aed' }}>{numUsers > 0 ? ((activeUsers / numUsers) * 100).toFixed(0) : 0}%</h3>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export function ErrorBoundary({ error }: Readonly<{ error: Error }>) {
  return (
    <Container className="mt-5">
      <Alert variant="danger">
        <Alert.Heading>Error loading dashboard</Alert.Heading>
        <p>{error.message}</p>
      </Alert>
    </Container>
  );
}