/**
 * User Dashboard Page Component
 *
 * Displays the seller's dashboard with key performance metrics and analytics.
 * Shows revenue tracking, sales by category, and recent transactions.
 *
 * Key Features:
 * - Real-time revenue statistics (total revenue, current balance)
 * - Line chart showing monthly revenue trend
 * - Doughnut chart showing sales distribution by category
 * - Table of recent sales with status indicators
 * - Quick link to edit user profile
 * - Profile photo with fallback to default image
 *
 * Data Flow:
 * 1. clientLoader() fetches dashboard stats from server
 * 2. Stats include revenue labels, values, sales history
 * 3. Chart.js renders interactive charts for visualization
 * 4. Table displays recent transactions with product details
 *
 * Chart Initialization:
 * - Uses useEffect to initialize Chart.js instances
 * - Cleans up charts on component unmount to prevent memory leaks
 * - Two chart types: Line chart (revenue) and Doughnut chart (categories)
 *
 * @component
 * @returns React component with seller dashboard and analytics
 */
import { Row, Col, Table, Badge, Card, Stack, Image } from "react-bootstrap";
import { Link, redirect } from "react-router";
import { useUserStore } from "~/stores/useUserStore";
import type { Route } from "./+types/user-page";
import { getUserDashboardStats } from "~/services/user-service";
import RevenueChart from "~/components/RevenueChart";
import SalesByCategoryChart from "~/components/SalesByCategoryChart";
/**
 * Client-side loader function
 * Fetches dashboard statistics for the currently logged-in seller.
 * * Process:
 * 1. Checks for an active user session directly in the Zustand store.
 * 2. Redirects to login instantly if unauthorized (prevents UI flickering).
 * 3. Fetches dashboard data via REST API using clientLoader (Project requirement).
 * 4. Formats currency and dates for UI display.
 */
export async function clientLoader() {
    const currentUser = useUserStore.getState().user;
    if (!currentUser) {
        throw redirect('/login');
    }

    try {
        const stats = await getUserDashboardStats();
        const apiData = stats || {};
        
        return {
            userSales: apiData.salesCount || [],
            chartLabels: apiData.chartLabels || [],       
            chartValues: apiData.chartValues || [],       
            revenueLabels: apiData.revenueLabels || [],   
            revenueValues: apiData.revenueValues || [],   
            
            formattedTotalRevenue: apiData.totalRevenue || "0.00",
            formattedBalance: apiData.balance || "0.00",
            date: new Date().toLocaleDateString('en-GB', {
                day: 'numeric', month: 'short', year: 'numeric'
            })
        };
    } catch (error: any) {
        if (error.status === 401 || error.response?.status === 401) {
            throw redirect('/login');
        }
        throw error;
    }
}

/**
 * User Dashboard Component
 * * Main component for displaying seller analytics and performance metrics.
 * Renders header with user greeting, KPI cards, interactive charts, and a recent sales table.
 */
export default function UserPage({ loaderData }: Route.ComponentProps) {
    const { user } = useUserStore();

    return (
        <>
            <header className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h1 className="fw-800 h2 text-dark">Hello, {user?.name || 'User'}!</h1>
                    <p className="text-muted small fw-600 mb-0">Tracking your design treasures performance.</p>
                </div>
                <Stack direction="horizontal" gap={3}>
                    <div className="d-flex align-items-center gap-4">
                        <div className="d-flex gap-3 d-none d-md-flex">
                            <button
                                type="button"
                                className="btn-about py-2 px-3 small"
                            >
                                <i className="fa-solid fa-calendar-day me-2"></i> {loaderData.date}
                            </button>
                        </div>
                    </div>
                    {user && (
                        <Link to="/user/settings">
                            <Image
                                src={`/api/v1/users/me/profile-photo?t=${Date.now()}`}
                                className="rounded-circle border border-2 shadow-sm"
                                width="48" height="48"
                                style={{ objectFit: 'cover' }}
                                onError={(e) => (e.currentTarget.src = '/images/profile-photo.png')}
                            />
                        </Link>
                    )}
                </Stack>
            </header>

            {/* --- STAT CARDS --- */}
            <Row className="g-4 mb-4">
                <Col md={6}>
                    <Card className="clay-card border-0 p-3 h-100">
                        <Card.Body>
                            <p className="text-muted small fw-700 mb-2" style={{ letterSpacing: '0.5px' }}>Total Revenue</p>
                            <h2 className="fw-800 text-primary mb-1">{loaderData.formattedTotalRevenue} €</h2>
                            <span className="text-success fw-700 small">Keep going!</span>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="clay-card border-0 p-3 h-100">
                        <Card.Body>
                            <p className="text-muted small fw-700 mb-2" style={{ letterSpacing: '0.5px' }}>Current Balance</p>
                            <h2 className="fw-800 text-dark mb-1">{loaderData.formattedBalance} €</h2>
                            <span className="text-primary fw-700 small">Wow!</span>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* --- CHARTS --- */}
            <Row className="g-4 mb-4">
                <Col lg={7}>
                    <Card className="clay-card border-0 p-3 h-100">
                        <Card.Body>
                            <h5 className="fw-800 text-dark mb-4">Monthly Revenue Trend</h5>
                            {/* Wrapper height is important for responsive charts */}
                            <div style={{ height: '300px' }}>
                                <RevenueChart 
                                    labels={loaderData.revenueLabels} 
                                    values={loaderData.revenueValues} 
                                />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={5}>
                    <Card className="clay-card border-0 p-3 h-100">
                        <Card.Body>
                            <h5 className="fw-800 text-dark mb-4">Sales by Category</h5>
                            <div style={{ height: '300px' }}>
                                <SalesByCategoryChart 
                                    chartLabels={loaderData.chartLabels} 
                                    chartValues={loaderData.chartValues} 
                                />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* --- RECENT SALES TABLE --- */}
            <Card className="clay-card border-0 p-3 mb-5">
                <Card.Body>
                    <h5 className="fw-800 text-dark mb-4">Recent Sales</h5>
                    <div className="table-responsive">
                        <Table hover className="table-admin mb-0 align-middle">
                            <thead>
                                <tr>
                                    <th>ITEM NAME</th>
                                    <th>CATEGORY</th>
                                    <th>AMOUNT</th>
                                    <th>STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loaderData.userSales?.length > 0 ? (
                                    loaderData.userSales.map((sale: any) => (
                                        <tr key={sale.id}>
                                            <td className="fw-700 text-dark">{sale.product?.name}</td>
                                            <td className="text-muted fw-600 small">{sale.product?.category}</td>
                                            <td className="text-primary fw-800">{sale.product?.price} €</td>
                                            <td>
                                                <Badge pill bg="success-subtle" className="text-success px-3 py-2 fw-700">
                                                    {sale.product?.status}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="text-center py-4 text-muted fw-600">No sales yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>
        </>
    );
}