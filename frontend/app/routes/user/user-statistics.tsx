/**
 * User Statistics / Seller Analytics Dashboard
 *
 * Comprehensive analytics and reporting dashboard for sellers.
 * Visualizes sales performance, revenue trends, and customer engagement.
 *
 * Features:
 * - KPI Summary Cards:
 *    - Total Revenue: Sum of all sales (formatted as €)
 *    - Current Balance: Available funds
 *    - Sales Count: Number of items sold
 *    - Average Sale Value: Revenue / sales count
 * - Revenue Chart (Line):
 *    - Shows monthly revenue trend
 *    - X-axis: Months (labels from backend)
 *    - Y-axis: Revenue amount in €
 *    - Point styling with blue color scheme
 * - Sales by Category (Doughnut):
 *    - Breakdown of sales by product category
 *    - Shows which categories sell best
 *    - Color-coded slices for each category
 * - Visits & Interest (Bar):
 *    - Grouped bars showing visits vs interest per category
 *    - Helps identify engagement patterns
 *    - Tracks potential customer interest
 * - Statistics Report:
 *    - PDF download button
 *    - Generates professional report
 *    - Includes all dashboard metrics
 *    - Timestamped with report generation date
 * - Responsive Layout:
 *    - Single column on mobile
 *    - Multi-column on desktop
 *    - Charts responsive to screen size
 *
 * Data Flow:
 * 1. Page loads with clientLoader() pre-fetching stats
 *    - GET /api/v1/users/me/dashboard-stats
 *    - Returns: salesCount, chartLabels, chartValues, totalRevenue, balance,
 *               barLabels, visitsByCategory, interestByCategory
 * 2. Component renders KPI cards with formatted values
 * 3. Three charts initialize with Chart.js:
 *    - Revenue line chart (time series)
 *    - Category doughnut (pie variant)
 *    - Visits/Interest bar chart (grouped)
 * 4. User can download PDF report:
 *    - GET /api/v1/users/me/statistics-report
 *    - Downloads: Statistics_Report.pdf
 * 5. Charts update if loaderData changes
 * 6. Charts destroyed and recreated to prevent memory leaks
 *
 * Chart Initialization:
 * - Revenue Chart:
 *    - Type: Line
 *    - Color: Blue (#2f6ced)
 *    - Features: Area fill (light blue background), smooth curves
 * - Category Chart:
 *    - Type: Doughnut (donut style pie)
 *    - Colors: 6 shades of blue (gradient)
 *    - Legend: Bottom position
 * - Visits Chart:
 *    - Type: Bar (grouped)
 *    - 2 datasets: Visits and Interest
 *    - Colors: Dark blue and light blue
 *    - Rounded corners on bars
 *
 * Client Loader:
 * - Pre-fetches stats from backend
 * - Transforms API data to chart-ready format
 * - Provides default values for safety
 * - Calculates current date for header
 * - No artificial delay (fast page load)
 *
 * Authentication:
 * - Requires logged-in user
 * - Redirects to login if not authenticated
 * - Uses useUserStore for auth check
 *
 * PDF Download:
 * - Triggered by download button
 * - Shows loading state during download
 * - Creates temporary link element
 * - Downloads to user's default download folder
 * - Filename: Statistics_Report.pdf
 * - Error handling with console logging
 *
 * State Management:
 * - loaderData: Pre-fetched statistics from backend
 * - isDownloading: Loading state for PDF download
 * - Chart refs: References to canvas elements (DOM)
 * - Chart instances: Stored for cleanup/destroy
 *
 * Performance:
 * - Chart.js initialization in useEffect
 * - Cleanup function destroys charts on unmount
 * - Prevents memory leaks with destroy() calls
 * - Re-initialization on loaderData changes
 * - No unnecessary re-renders
 *
 * Styling:
 * - KPI cards: Large text, color-coded
 * - Charts: Responsive canvas elements
 * - Buttons: Primary color with shadow
 * - Background: Light gray container
 * - Text: Dark font on light background
 *
 * Data Formatting:
 * - Currency: EUR format with 2 decimals (€)
 * - Numbers: Rounded/formatted for readability
 * - Dates: Locale-specific format
 * - Charts: Color-coded for visual hierarchy
 *
 * @component
 * @returns Analytics dashboard with charts and KPI cards
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { useUserStore } from '~/stores/useUserStore';
import { getUserDashboardStats } from '~/services/user-service';
import Chart from 'chart.js/auto';
import { Row, Col, Table, Badge, Card, Stack, Image, Button } from 'react-bootstrap';

/**
 * Client-side loader: Fetch User Dashboard Statistics
 * 
 * Process:
 * 1. Call getUserDashboardStats() from user service
 * 2. Extract and format statistics data
 * 3. Transform for chart.js compatibility
 * 4. Provide default values if missing
 * 5. Calculate current date for header display
 * 6. Return formatted data object
 * 
 * @returns Dashboard statistics with formatted values and chart data
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
    barLabels: apiData.barLabels || [],
    visitsByCategory: apiData.visitsByCategory || [],
    interestByCategory: apiData.interestByCategory || [],
    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  };
}

/**
 * User Statistics Component Implementation
 * 
 * Displays seller analytics with charts and KPI metrics.
 */
export default function UserStatistics({ loaderData }: { loaderData: any }) {
  const { user } = useUserStore();
  const navigate = useNavigate();
  
  // Loading state for PDF download
  const [isDownloading, setIsDownloading] = useState(false);

  // Canvas element references for Chart.js
  const revenueChartRef = useRef<HTMLCanvasElement>(null);
  const categoryChartRef = useRef<HTMLCanvasElement>(null);
  const visitsChartRef = useRef<HTMLCanvasElement>(null);
  
  // Chart.js instance references (for cleanup)
  const revenueChartInstance = useRef<any>(null);
  const categoryChartInstance = useRef<any>(null);
  const visitsChartInstance = useRef<any>(null);

  /**
   * Check Authentication
   * 
   * Redirects to login if user not authenticated.
   * Ensures only logged-in sellers access statistics.
   */
  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  /**
   * Initialize Chart.js Charts
   * 
   * Process:
   * 1. Check if all canvas refs exist (if not, skip)
   * 2. Destroy previous chart instances to prevent memory leaks
   * 3. Get 2D contexts from canvas elements
   * 4. Create Revenue Chart (Line):
   *    - X-axis: Month labels from data
   *    - Y-axis: Revenue values
   *    - Styling: Blue color, area fill, smooth curves
   * 5. Create Category Chart (Doughnut):
   *    - Labels: Category names
   *    - Data: Sales count per category
   *    - Colors: 6-color blue gradient
   * 6. Create Visits Chart (Bar):
   *    - 2 datasets: Visits and Interest
   *    - Grouped bars for comparison
   *    - Colors: Dark blue (visits), light blue (interest)
   * 7. Return cleanup function that destroys all charts
   * 
   * Dependencies: Runs when loaderData changes (new stats)
   */
  useEffect(() => {
    if (!revenueChartRef.current || !categoryChartRef.current || !visitsChartRef.current) return;

    // Destroy previous instances
    revenueChartInstance.current?.destroy();
    categoryChartInstance.current?.destroy();
    visitsChartInstance.current?.destroy();

    const revCtx = revenueChartRef.current.getContext("2d");
    const catCtx = categoryChartRef.current.getContext("2d");
    const visCtx = visitsChartRef.current.getContext("2d");

    // Revenue Line Chart: Shows monthly revenue trend
    revenueChartInstance.current = new Chart(revCtx!, {
      type: 'line',
      data: {
        labels: loaderData.revenueLabels || [],
        datasets: [{ label: 'Monthly Revenue', data: loaderData.revenueValues || [], borderColor: '#2f6ced', backgroundColor: 'rgba(47, 108, 237, 0.05)', borderWidth: 2, fill: true, tension: 0.4, pointBackgroundColor: '#2f6ced', pointBorderColor: '#fff', pointBorderWidth: 2, pointRadius: 4 }]
      },
      options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });

    // Category Doughnut Chart: Sales breakdown by category
    categoryChartInstance.current = new Chart(catCtx!, {
      type: 'doughnut',
      data: {
        labels: loaderData.barLabels || [],
        datasets: [{ data: loaderData.visitsByCategory || [], backgroundColor: ['#2f6ced', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'], borderColor: '#fff', borderWidth: 2 }]
      },
      options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'bottom' } } }
    });

    // Visits & Interest Bar Chart: Engagement by category
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

    // Cleanup: Destroy charts on unmount to prevent memory leaks
    return () => {
      revenueChartInstance.current?.destroy();
      categoryChartInstance.current?.destroy();
      visitsChartInstance.current?.destroy();
    };
  }, [loaderData]);

  /**
   * Download Statistics Report as PDF
   * 
   * Process:
   * 1. Set loading state to true
   * 2. Create temporary link element
   * 3. Set href to /api/v1/users/me/statistics-report endpoint
   * 4. Set download attribute with filename
   * 5. Append to document body (required for Firefox)
   * 6. Click link to trigger download
   * 7. Remove link from DOM
   * 8. Clear loading state
   * 9. Catch and log errors gracefully
   */
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
          <button
            className="btn-sell py-2 px-3 small"
            style={{ height: 'auto', border: 'none' }}
            onClick={downloadStatisticsPDF}
            disabled={isDownloading}
          >
            <i className={`fa-solid ${isDownloading ? 'fa-spinner fa-spin' : 'fa-file-export'} me-2`}></i>
            {isDownloading ? 'Exporting...' : 'Export PDF'}
          </button>
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
            <Card.Body  style={{textAlign: 'center'}}>
              <p className="text-muted small fw-700 mb-2" style={{ letterSpacing: '0.5px' }}>Total Sales</p>
              <h2 className="fw-800 text-success mb-1">€{loaderData.formattedTotalRevenue}</h2>
              <span className="text-muted fw-600 small">Cumulative earnings</span>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="clay-card border-0 h-100 p-3">
            <Card.Body  style={{textAlign: 'center'}}>
              <p className="text-muted small fw-700 mb-2" style={{ letterSpacing: '0.5px' }}>Items Sold</p>
              <h2 className="fw-800 text-primary mb-1">{loaderData.userSales?.length || 0}</h2>
              <span className="text-muted fw-600 small">Total transactions</span>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="clay-card border-0 h-100 p-3">
            <Card.Body  style={{textAlign: 'center'}}>
              <p className="text-muted small fw-700 mb-2" style={{ letterSpacing: '0.5px' }}>Inventory Value</p>
              <h2 className="fw-800 text-warning mb-1">€{loaderData.formattedBalance}</h2>
              <span className="text-muted fw-600 small">Active products worth</span>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="clay-card border-0 h-100 p-3">
            <Card.Body  style={{textAlign: 'center'}}>
              <p className="text-muted small fw-700 mb-2" style={{ letterSpacing: '0.5px' }}>Average Rating</p>
              <h2 className="fw-800 text-info mb-1">0.0</h2>
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