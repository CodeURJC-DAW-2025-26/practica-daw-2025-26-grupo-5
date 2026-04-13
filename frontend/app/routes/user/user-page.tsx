import { useEffect, useRef } from "react";
import { Row, Col, Table, Badge } from "react-bootstrap";
import { useUserStore } from "~/stores/useUserStore";
import type { Route } from "./+types/user-page";
import { getUserDashboardStats } from "~/services/user-service";
import Chart from "chart.js/auto";

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

export default function UserPage({ loaderData }: Route.ComponentProps) {
    const { user } = useUserStore();
    const revenueChartRef = useRef<HTMLCanvasElement>(null);
    const categoryChartRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!revenueChartRef.current || !categoryChartRef.current) return;
        const revCtx = revenueChartRef.current.getContext("2d");
        const catCtx = categoryChartRef.current.getContext("2d");

        const chart1 = new Chart(revCtx!, {
            type: 'line',
            data: {
                labels: loaderData.revenueLabels,
                datasets: [{ label: 'Revenue', data: loaderData.revenueValues, borderColor: '#3b82f6', tension: 0.4 }]
            }
        });

        const chart2 = new Chart(catCtx!, {
            type: 'doughnut',
            data: {
                labels: loaderData.revenueLabels,
                datasets: [{ data: loaderData.revenueValues, backgroundColor: ['#1e3a8a', '#3b82f6', '#93c5fd', '#60a5fa'] }]
            }
        });

        return () => { chart1.destroy(); chart2.destroy(); };
    }, [loaderData]);

    return (
        <>
            <header className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h1 className="fw-800 h2">Hello, {user?.name || 'User'}!</h1>
                    <p className="text-muted small">Tracking your design treasures performance.</p>
                </div>
                <div className="d-none d-md-flex">
                    <span className="btn-about py-2 px-3 small"><i className="fa-solid fa-calendar-day me-2"></i> {loaderData.date}</span>
                </div>
            </header>

            {/* --- STAT CARDS --- */}
            <Row className="g-4 mb-4">
                <Col md={6}>
                    <div className="clay-card p-4">
                        <p className="label-categories mb-1 text-uppercase small opacity-50">Total Revenue</p>
                        <h2 className="fw-800 text-primary">{loaderData.formattedTotalRevenue} €</h2>
                        <span className="text-success fw-700 small">Keep going!</span>
                    </div>
                </Col>
                <Col md={6}>
                    <div className="clay-card p-4">
                        <p className="label-categories mb-1 text-uppercase small opacity-50">Current Balance</p>
                        <h2 className="fw-800 text-dark">{loaderData.formattedBalance} €</h2>
                        <span className="text-primary fw-700 small">Wow!</span>
                    </div>
                </Col>
            </Row>

            {/* --- CHARTS --- */}
            <Row className="g-4 mb-4">
                <Col lg={7}>
                    <div className="clay-card p-4 h-100">
                        <h3 className="fw-800 h5 mb-4">Monthly Revenue Trend</h3>
                        <canvas ref={revenueChartRef}></canvas>
                    </div>
                </Col>
                <Col lg={5}>
                    <div className="clay-card p-4 h-100">
                        <h3 className="fw-800 h5 mb-4">Sales by Category</h3>
                        <canvas ref={categoryChartRef}></canvas>
                    </div>
                </Col>
            </Row>

            {/* --- RECENT SALES TABLE --- */}
            <div className="clay-card p-4 mb-5">
                <h3 className="fw-800 h5 mb-4">Recent Sales</h3>
                <div className="table-responsive">
                    <Table hover className="align-middle border-light">
                        <thead className="x-small text-muted fw-800 text-uppercase">
                            <tr>
                                <th className="pb-3">Item Name</th>
                                <th className="pb-3">Category</th>
                                <th className="pb-3">Amount</th>
                                <th className="pb-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="fw-700 small">
                            {loaderData.userSales?.length > 0 ? (
                                loaderData.userSales.map((sale: any) => (
                                    <tr key={sale.id}>
                                        <td className="py-3">{sale.product?.name}</td>
                                        <td className="opacity-50">{sale.product?.category}</td>
                                        <td className="text-primary">{sale.product?.formattedPrice} €</td>
                                        <td>
                                            <Badge pill bg="success-subtle" className="text-success px-3 py-2">
                                                {sale.product?.status}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-4 text-muted">No sales yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </div>
        </>
    );
}