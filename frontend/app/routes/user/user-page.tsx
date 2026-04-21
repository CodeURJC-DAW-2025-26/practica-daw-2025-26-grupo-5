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

import { useEffect, useRef } from "react";
import { Row, Col, Table, Badge, Card, Stack, Image } from "react-bootstrap";
import { Link } from "react-router";
import { useUserStore } from "~/stores/useUserStore";
import type { Route } from "./+types/user-page";
import { getUserDashboardStats } from "~/services/user-service";
import Chart from "chart.js/auto";

/**
 * Client-side loader function
 * Fetches dashboard statistics for the currently logged-in seller
 * 
 * Process:
 * 1. Calls getUserDashboardStats() to get data from backend
 * 2. Formats revenue and balance to 2 decimal places
 * 3. Prepares chart data (labels and values)
 * 4. Formats current date in GB locale
 * 
 * @returns Object containing formatted stats for dashboard display
 */
export async function clientLoader() {
    const stats = await getUserDashboardStats();
    const apiData = stats || {};
    return {
        userSales: apiData.salesCount || [],
        revenueLabels: apiData.chartLabels || [],
        revenueValues: apiData.chartValues || [],
        formattedTotalRevenue: apiData.totalRevenue?.toFixed(2) || "0.00",
        formattedBalance: apiData.balance?.toFixed(2) || "0.00",
        date: new Date().toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
        })
    };
}

/**
 * User Dashboard Component
 * 
 * Main component for displaying seller analytics and performance metrics.
 * Renders header with user greeting, KPI cards, charts, and sales table.
 */
export default function UserPage({ loaderData }: Route.ComponentProps) {
    const { user } = useUserStore();
    const revenueChartRef = useRef<HTMLCanvasElement>(null);
    const categoryChartRef = useRef<HTMLCanvasElement>(null);

    /**
     * Initialize Chart.js Charts
     * 
     * Effect runs when loaderData changes (component mount or data refresh).
     * Creates two interactive charts:
     * 1. Line chart: Revenue trend over time (monthly data)
     * 2. Doughnut chart: Sales distribution by category
     * 
     * Cleanup: Destroys charts on unmount to prevent memory leaks
     */
    useEffect(() => {
        if (!revenueChartRef.current || !categoryChartRef.current) return;
        const revCtx = revenueChartRef.current.getContext("2d");
        const catCtx = categoryChartRef.current.getContext("2d");

        const chart1 = new Chart(revCtx!, {
            type: 'line',
            data: {
                labels: loaderData.revenueLabels,
                datasets: [{
                    label: 'Revenue',
                    data: loaderData.revenueValues,
                    borderColor: '#2f6ced',
                    backgroundColor: 'rgba(47, 108, 237, 0.05)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: { plugins: { legend: { display: false } } }
        });

        const chart2 = new Chart(catCtx!, {
            type: 'doughnut',
            data: {
                labels: loaderData.revenueLabels,
                datasets: [{
                    data: loaderData.revenueValues,
                    backgroundColor: ['#1e3a8a', '#2f6ced', '#93c5fd', '#60a5fa'],
                    borderWidth: 0
                }]
            },
            options: { plugins: { legend: { position: 'bottom' } } }
        });

        return () => { chart1.destroy(); chart2.destroy(); };
    }, [loaderData]);

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
                            <p className="text-muted small fw-700 mb-2 text-uppercase" style={{ letterSpacing: '0.5px' }}>Total Revenue</p>
                            <h2 className="fw-800 text-primary mb-1">{loaderData.formattedTotalRevenue} €</h2>
                            <span className="text-success fw-700 small">Keep going!</span>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="clay-card border-0 p-3 h-100">
                        <Card.Body>
                            <p className="text-muted small fw-700 mb-2 text-uppercase" style={{ letterSpacing: '0.5px' }}>Current Balance</p>
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
                            <canvas ref={revenueChartRef}></canvas>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={5}>
                    <Card className="clay-card border-0 p-3 h-100">
                        <Card.Body>
                            <h5 className="fw-800 text-dark mb-4">Sales by Category</h5>
                            <canvas ref={categoryChartRef}></canvas>
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
                                            <td className="text-primary fw-800">{sale.product?.formattedPrice} €</td>
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