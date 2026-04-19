import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { useUserStore } from '~/stores/useUserStore';
import { getUserDashboardStats } from '~/services/user-service';
import Chart from 'chart.js/auto';
import { Row, Col, Table, Badge, Card, Stack, Image, Button } from 'react-bootstrap';

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
    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
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

    revenueChartInstance.current?.destroy();
    categoryChartInstance.current?.destroy();
    visitsChartInstance.current?.destroy();

    const revCtx = revenueChartRef.current.getContext("2d");
    const catCtx = categoryChartRef.current.getContext("2d");
    const visCtx = visitsChartRef.current.getContext("2d");

    revenueChartInstance.current = new Chart(revCtx!, {
      type: 'line',
      data: {
        labels: loaderData.revenueLabels || [],
        datasets: [{ label: 'Monthly Revenue', data: loaderData.revenueValues || [], borderColor: '#2f6ced', backgroundColor: 'rgba(47, 108, 237, 0.05)', borderWidth: 2, fill: true, tension: 0.4, pointBackgroundColor: '#2f6ced', pointBorderColor: '#fff', pointBorderWidth: 2, pointRadius: 4 }]
      },
      options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });

    categoryChartInstance.current = new Chart(catCtx!, {
      type: 'doughnut',
      data: {
        labels: loaderData.barLabels || [],
        datasets: [{ data: loaderData.visitsByCategory || [], backgroundColor: ['#2f6ced', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'], borderColor: '#fff', borderWidth: 2 }]
      },
      options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'bottom' } } }
    });

    visitsChartInstance.current = new Chart(visCtx!, {
      type: 'bar',
      data: {
        labels: loaderData.barLabels || [],
        datasets: [
          { label: 'Visits', data: loaderData.visitsByCategory || [], backgroundColor: '#2f6ced', borderRadius: 4 },
          { label: 'Interest', data: loaderData.interestByCategory || [], backgroundColor: '#60a5fa', borderRadius: 4 }
        ]
      },
      options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true } } }
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
    <>
      <header className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h1 className="fw-800 h2 text-dark">Statistics</h1>
          <p className="text-muted small fw-600 mb-0">Comprehensive performance and interest analysis.</p>
        </div>
        <Stack direction="horizontal" gap={3}>
          <Button variant="outline-primary" className="fw-700 rounded-pill px-4" onClick={downloadStatisticsPDF} disabled={isDownloading}>
            <i className={`fa-solid ${isDownloading ? 'fa-spinner fa-spin' : 'fa-file-pdf'} me-2`} />
            {isDownloading ? 'Exporting...' : 'Export PDF'}
          </Button>
          {user && (
            <Link to="/user/settings">
              <Image 
                src={`/api/v1/users/me/profile-photo?t=${Date.now()}`} 
                className="rounded-circle border border-2 shadow-sm" 
                width="48" 
                height="48" 
                alt="Profile" 
                onError={(e) => (e.currentTarget.src = '/images/profile-photo.png')} 
              />
            </Link>
          )}
        </Stack>
      </header>

      {/* KPI Cards */}
      <Row className="g-4 mb-4">
        <Col md={6} lg={3}>
          <Card className="clay-card border-0 h-100 p-3">
            <Card.Body>
              <p className="text-muted small fw-700 mb-2 text-uppercase" style={{ letterSpacing: '0.5px' }}>Total Sales</p>
              <h2 className="fw-800 text-success mb-1">€{loaderData.formattedTotalRevenue}</h2>
              <span className="text-muted fw-600 small">Cumulative earnings</span>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="clay-card border-0 h-100 p-3">
            <Card.Body>
              <p className="text-muted small fw-700 mb-2 text-uppercase" style={{ letterSpacing: '0.5px' }}>Items Sold</p>
              <h2 className="fw-800 text-primary mb-1">{loaderData.userSales?.length || 0}</h2>
              <span className="text-muted fw-600 small">Total transactions</span>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="clay-card border-0 h-100 p-3">
            <Card.Body>
              <p className="text-muted small fw-700 mb-2 text-uppercase" style={{ letterSpacing: '0.5px' }}>Inventory Value</p>
              <h2 className="fw-800 text-warning mb-1">€{loaderData.formattedBalance}</h2>
              <span className="text-muted fw-600 small">Active products worth</span>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="clay-card border-0 h-100 p-3">
            <Card.Body>
              <p className="text-muted small fw-700 mb-2 text-uppercase" style={{ letterSpacing: '0.5px' }}>Average Rating</p>
              <h2 className="fw-800 text-info mb-1">0.0 <i className="fa-solid fa-star small"></i></h2>
              <span className="text-muted fw-600 small">Community score</span>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts Row 1 */}
      <Row className="g-4 mb-4">
        <Col lg={7}>
          <Card className="clay-card border-0 h-100 p-3">
            <Card.Body>
              <h5 className="fw-800 text-dark mb-4">Monthly Revenue Trend</h5>
              {loaderData.revenueValues?.length > 0 ? (
                <canvas ref={revenueChartRef}></canvas>
              ) : (
                <div className="text-center py-5 opacity-50"><p className="fw-600 text-dark">No revenue data available yet</p></div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={5}>
          <Card className="clay-card border-0 h-100 p-3">
            <Card.Body>
              <h5 className="fw-800 text-dark mb-4">Sales by Category</h5>
              {loaderData.visitsByCategory?.length > 0 ? (
                <canvas ref={categoryChartRef}></canvas>
              ) : (
                <div className="text-center py-5 opacity-50"><p className="fw-600 text-dark">You have no sales yet</p></div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts Row 2 */}
      <Row className="g-4 mb-4">
        <Col lg={12}>
          <Card className="clay-card border-0 h-100 p-3">
            <Card.Body>
              <h5 className="fw-800 text-dark mb-4">Visits vs. Interest</h5>
              {loaderData.barLabels?.length > 0 ? (
                <canvas ref={visitsChartRef}></canvas>
              ) : (
                <div className="text-center py-5 opacity-50"><p className="fw-600 text-dark">No interaction data available yet</p></div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Sales Table */}
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
                      <td className="fw-800 text-success">€{sale.product?.formattedPrice}</td>
                      <td><Badge bg="success" className="fw-700 px-3 py-2 rounded-pill">{sale.product?.status}</Badge></td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} className="text-center py-4 text-muted fw-600">No sales yet. Start by uploading your first product!</td></tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </>
  );
}