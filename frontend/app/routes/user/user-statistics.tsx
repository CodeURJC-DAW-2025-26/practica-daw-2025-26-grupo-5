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

import { useState, useEffect, useRef } from 'react';
import { redirect, Link, useNavigate, useLoaderData } from 'react-router';
import { useUserStore } from '~/stores/useUserStore';
import { getUserDashboardStats, downloadStatisticsReport } from '~/services/user-service';
import Chart from 'chart.js/auto';
import { Row, Col, Table, Badge, Card, Stack, Image } from 'react-bootstrap';
import RevenueChart from "~/components/RevenueChart";
import SalesByCategoryChart from "~/components/SalesByCategoryChart";
import VisitsInterestChart from "~/components/VisitsInterestChart";

/**
 * Client-side loader: Fetch and Format User Dashboard Statistics
 * Strictly mapped to your API response.
 */
export async function clientLoader() {
  const currentUser = useUserStore.getState().user;
  if (!currentUser) throw redirect('/login');

  try {
    const apiData = await getUserDashboardStats();
    
    return {
      userSales: apiData.salesCount || [], 
      // Doughnut
      chartLabels: apiData.chartLabels || [],
      chartValues: apiData.chartValues || [],
      // Lines
      revenueLabels: apiData.revenueLabels || [],
      revenueValues: apiData.revenueValues || [],
      // Bars
      barLabels: apiData.barLabels || ["No Data"],
      visitsByCategory: apiData.visitsByCategory || [0],
      interestByCategory: apiData.interestByCategory || [0],
      
      formattedTotalRevenue: (apiData.totalRevenue || 0).toFixed(2),
      formattedInventoryValue: (apiData.balance || 0).toFixed(2),
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    };
  } catch (error: any) {
    if (error.status === 401 || error.response?.status === 401) {
      useUserStore.getState().setUser(null);
      throw redirect('/login');
    }
    throw error;
  }
}

export default function UserStatistics() {
  const loaderData = useLoaderData() as any;
  const { user } = useUserStore();
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadStatisticsPDF = async () => {
    setIsDownloading(true);
    try {
      const pdfBlob = await downloadStatisticsReport();
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Stilnovo_Report_${loaderData.date}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <header className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h1 className="fw-800 h2 text-dark">Statistics</h1>
          <p className="text-muted small fw-600 mb-0">Analysis updated on {loaderData.date}</p>
        </div>
        <Stack direction="horizontal" gap={3}>
          <button className="btn-sell py-2 px-3 small" onClick={downloadStatisticsPDF} disabled={isDownloading}>
            <i className={`fa-solid ${isDownloading ? 'fa-spinner fa-spin' : 'fa-file-export'} me-2`}></i>
            {isDownloading ? 'Exporting...' : 'Export PDF'}
          </button>
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

      {/* KPI Cards*/}
      <Row className="g-4 mb-4">
        <Col md={6} lg={3}>
          <Card className="clay-card border-0 h-100 p-3 shadow-sm">
            <Card.Body className="text-center">
              <p className="text-muted small fw-700 mb-2">Total Revenue</p>
              <h2 className="fw-800 text-success mb-1 text-nowrap">€{loaderData.formattedTotalRevenue}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="clay-card border-0 h-100 p-3 shadow-sm">
            <Card.Body className="text-center">
              <p className="text-muted small fw-700 mb-2">Items Sold</p>
              <h2 className="fw-800 text-primary mb-1 text-nowrap">{loaderData.userSales?.length || 0}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="clay-card border-0 h-100 p-3 shadow-sm">
            <Card.Body className="text-center">
              <p className="text-muted small fw-700 mb-2">Inventory Value</p>
              <h2 className="fw-800 text-warning mb-1 text-nowrap">€{loaderData.formattedInventoryValue}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="clay-card border-0 h-100 p-3 shadow-sm">
            <Card.Body className="text-center">
              <p className="text-muted small fw-700 mb-2">Reputation</p>
              <h2 className="fw-800 text-info mb-1 text-nowrap">{user?.rating?.toFixed(1) || "0.0"}</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row className="g-4 mb-4">
        <Col lg={7}>
          <Card className="clay-card border-0 p-4 shadow-sm">
            <h5 className="fw-800 text-dark mb-4">Revenue Trend</h5>
            <div style={{ height: '300px' }}>
              <RevenueChart
                labels={loaderData.revenueLabels}
                values={loaderData.revenueValues}
              />
            </div>
          </Card>
        </Col>
        <Col lg={5}>
          <Card className="clay-card border-0 p-4 shadow-sm">
            <h5 className="fw-800 text-dark mb-4">Sales by Category</h5>
            <div style={{ height: '300px' }}>
              <SalesByCategoryChart
                chartLabels={loaderData.chartLabels}
                chartValues={loaderData.chartValues}
              />
            </div>
          </Card>
        </Col>
      </Row>
      <Row className="g-4 mb-4">
        <Col lg={12}>
          <Card className="clay-card border-0 p-4 shadow-sm">
            <h5 className="fw-800 text-dark mb-4">Visits & Interest</h5>
            <div style={{ height: '300px' }}>
              <VisitsInterestChart
                labels={loaderData.barLabels}
                visits={loaderData.visitsByCategory}
                interest={loaderData.interestByCategory}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Sales Table */}
      <Card className="clay-card border-0 shadow-sm overflow-hidden mb-5">
        <div className="bg-white p-4 border-bottom">
          <h5 className="fw-800 text-dark mb-0">Recent Transactions</h5>
        </div>
        <Table hover responsive className="mb-0 align-middle">
          <thead className="bg-light">
            <tr>
              <th className="ps-4 py-3 text-muted small fw-700">PRODUCT</th>
              <th className="py-3 text-muted small fw-700 text-end">PRICE</th>
              <th className="py-3 text-muted small fw-700 text-center pe-4">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {loaderData.userSales.length > 0 ? (
              loaderData.userSales.map((sale: any, idx: number) => (
                <tr key={idx}>
                  <td className="ps-4 fw-700 text-dark">{sale.product?.name || 'N/A'}</td>
                  <td className="fw-800 text-dark text-end">€{(sale.finalPrice || 0).toFixed(2)}</td>
                  <td className="text-center pe-4">
                    <Badge bg="success" className="rounded-pill px-3">{sale.transactionStatus || 'Completed'}</Badge>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={3} className="text-center py-5 text-muted">No sales found in salesCount.</td></tr>
            )}
          </tbody>
        </Table>
      </Card>
    </>
  );
}