import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { useUserStore } from '~/stores/useUserStore';
import { getUserDashboardStats } from '~/services/user-service';
import Chart from 'chart.js/auto';
import { Row, Col, Table, Badge } from 'react-bootstrap';

export async function clientLoader() {
  const stats = await getUserDashboardStats();
  const apiData = stats || {};
  return {
    userSales: apiData.salesCount || [],
    revenueLabels: apiData.chartLabels || [],
    revenueValues: apiData.chartValues || [],
    formattedTotalRevenue: apiData.totalRevenue?.toFixed(2) || "0.00",
    formattedBalance: apiData.balance?.toFixed(2) || "0.00",
    barLabels: apiData.barLabels || [],
    visitsByCategory: apiData.visitsByCategory || [],
    interestByCategory: apiData.interestByCategory || [],
    date: new Date().toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  };
}

export default function UserStatistics({ loaderData }: { loaderData: any }) {
  const { user } = useUserStore();
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);

  const revenueChartRef = useRef<HTMLCanvasElement>(null);
  const categoryChartRef = useRef<HTMLCanvasElement>(null);
  const visitsChartRef = useRef<HTMLCanvasElement>(null);

  const revenueChartInstance = useRef<any>(null);
  const categoryChartInstance = useRef<any>(null);
  const visitsChartInstance = useRef<any>(null);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  useEffect(() => {
    if (!revenueChartRef.current || !categoryChartRef.current || !visitsChartRef.current) return;

    // Destroy previous chart instances
    revenueChartInstance.current?.destroy();
    categoryChartInstance.current?.destroy();
    visitsChartInstance.current?.destroy();

    const revCtx = revenueChartRef.current.getContext("2d");
    const catCtx = categoryChartRef.current.getContext("2d");
    const visCtx = visitsChartRef.current.getContext("2d");

    // Monthly Revenue Trend - Line Chart
    revenueChartInstance.current = new Chart(revCtx!, {
      type: 'line',
      data: {
        labels: loaderData.revenueLabels || [],
        datasets: [{
          label: 'Monthly Revenue',
          data: loaderData.revenueValues || [],
          borderColor: '#2f6ced',
          backgroundColor: 'rgba(47, 108, 237, 0.05)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#2f6ced',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });

    // Sales by Category - Doughnut Chart
    categoryChartInstance.current = new Chart(catCtx!, {
      type: 'doughnut',
      data: {
        labels: loaderData.barLabels || [],
        datasets: [{
          data: loaderData.visitsByCategory || [],
          backgroundColor: ['#2f6ced', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'],
          borderColor: '#fff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });

    // Visits vs Interest - Bar Chart
    visitsChartInstance.current = new Chart(visCtx!, {
      type: 'bar',
      data: {
        labels: loaderData.barLabels || [],
        datasets: [
          {
            label: 'Visits',
            data: loaderData.visitsByCategory || [],
            backgroundColor: '#2f6ced',
            borderRadius: 4
          },
          {
            label: 'Interest',
            data: loaderData.interestByCategory || [],
            backgroundColor: '#60a5fa',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { position: 'bottom' }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });

    return () => {
      revenueChartInstance.current?.destroy();
      categoryChartInstance.current?.destroy();
      visitsChartInstance.current?.destroy();
    };
  }, [loaderData]);

  const downloadStatisticsPDF = async () => {
    setIsDownloading(true);
    try {
      const link = document.createElement('a');
      link.href = '/api/v1/users/me/statistics-report';
      link.download = 'Statistics_Report.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download PDF:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <main className="flex-grow-1 p-4 p-md-5 overflow-auto bg-light min-vh-100">
      {/* Header */}
      <header className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h1 className="fw-800 h2">Statistics</h1>
          <p className="text-muted small">Comprehensive performance and interest analysis.</p>
        </div>
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn-sell py-2 px-3 small d-flex align-items-center gap-2"
            onClick={downloadStatisticsPDF}
            disabled={isDownloading}
          >
            <i className={`fa-solid ${isDownloading ? 'fa-spinner fa-spin' : 'fa-file-pdf'}`}></i>
            {isDownloading ? 'Exporting...' : 'Export PDF'}
          </button>
          {user && (
            <Link to="/user/settings">
              <img
                src={`/api/v1/users/me/profile-photo?t=${Date.now()}`}
                className="rounded-circle border border-2 shadow-sm"
                width="40"
                height="40"
                alt="Profile"
                onError={(e) => (e.currentTarget.src = '/images/profile-photo.png')}
              />
            </Link>
          )}
        </div>
      </header>

      {/* KPI Cards */}
      <Row className="g-4 mb-4">
        <Col md={6} lg={3}>
          <div className="clay-card p-4 h-100">
            <p className="label-categories mb-1 text-uppercase small opacity-50">Total Sales</p>
            <h2 className="fw-800 text-success">${loaderData.formattedTotalRevenue}</h2>
            <span className="text-muted fw-600 small">Cumulative earnings</span>
          </div>
        </Col>
        <Col md={6} lg={3}>
          <div className="clay-card p-4 h-100">
            <p className="label-categories mb-1 text-uppercase small opacity-50">Items Sold</p>
            <h2 className="fw-800 text-primary">{loaderData.userSales?.length || 0}</h2>
            <span className="text-muted fw-600 small">Total transactions</span>
          </div>
        </Col>
        <Col md={6} lg={3}>
          <div className="clay-card p-4 h-100">
            <p className="label-categories mb-1 text-uppercase small opacity-50">Inventory Value</p>
            <h2 className="fw-800 text-warning">${loaderData.formattedBalance}</h2>
            <span className="text-muted fw-600 small">Active products worth</span>
          </div>
        </Col>
        <Col md={6} lg={3}>
          <div className="clay-card p-4 h-100">
            <p className="label-categories mb-1 text-uppercase small opacity-50">Average Rating</p>
            <h2 className="fw-800 text-info">0.0 ⭐</h2>
            <span className="text-muted fw-600 small">Community score</span>
          </div>
        </Col>
      </Row>

      {/* Charts Row 1 */}
      <Row className="g-4 mb-4">
        <Col lg={7}>
          <div className="clay-card p-4 h-100">
            <h3 className="fw-800 h5 mb-4">Monthly Revenue Trend</h3>
            {loaderData.revenueValues?.length > 0 ? (
              <canvas ref={revenueChartRef}></canvas>
            ) : (
              <div className="text-center py-5 opacity-50">
                <p className="small fw-600">No revenue data available yet</p>
              </div>
            )}
          </div>
        </Col>
        <Col lg={5}>
          <div className="clay-card p-4 h-100">
            <h3 className="fw-800 h5 mb-4">Sales by Category</h3>
            {loaderData.visitsByCategory?.length > 0 ? (
              <canvas ref={categoryChartRef}></canvas>
            ) : (
              <div className="text-center py-5 opacity-50">
                <p className="small fw-600">You have no sales yet</p>
              </div>
            )}
          </div>
        </Col>
      </Row>

      {/* Charts Row 2 */}
      <Row className="g-4 mb-4">
        <Col lg={12}>
          <div className="clay-card p-4 h-100">
            <h3 className="fw-800 h5 mb-4">Visits vs. Interest</h3>
            {loaderData.barLabels?.length > 0 ? (
              <canvas ref={visitsChartRef}></canvas>
            ) : (
              <div className="text-center py-5 opacity-50">
                <p className="small fw-600">No interaction data available yet</p>
              </div>
            )}
          </div>
        </Col>
      </Row>

      {/* Recent Sales Table */}
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
                    <td className="text-success">${sale.product?.formattedPrice}</td>
                    <td>
                      <Badge pill bg="success-subtle" className="text-success px-3 py-2">
                        {sale.product?.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-muted">
                    No sales yet. Start by uploading your first product!
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>
    </main>
  );
}
