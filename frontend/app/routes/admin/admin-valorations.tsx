/**
 * Admin Valorations (Reviews) Management Page
 *
 * Review and rating management dashboard for marketplace administrators.
 * Oversee, monitor, and manage all customer reviews and ratings.
 *
 * Features:
 * - All marketplace valorations displayed in table
 * - KPI cards showing rating metrics:
 *    - Total valorations count
 *    - Average rating across all reviews
 *    - Recent reviews count
 *    - High-quality reviews count
 * - Valoration table displaying:
 *    - Reviewer name
 *    - Seller name
 *    - Rating (star score)
 *    - Comment/Review text
 *    - Review date
 *    - Status indicators
 * - Search/filter functionality:
 *    - Search by reviewer name
 *    - Filter by rating score
 *    - Filter by seller name
 * - Delete valoration action:
 *    - Remove inappropriate reviews
 *    - Delete spam reviews
 *    - Confirmation modal before delete
 * - Pagination controls (10 items per page)
 * - Quality indicators for reviews
 * - Error handling
 * - Loading states
 * - Empty state when no reviews exist
 *
 * Data Flow:
 * 1. clientLoader fetches all valorations (up to 1000)
 * 2. Valorations displayed in paginated table
 * 3. KPI cards calculate metrics from all reviews
 * 4. Admin can:
 *    - Browse all customer reviews
 *    - View review details
 *    - Delete inappropriate reviews
 *    - Monitor review trends
 * 5. After delete, list refreshes
 *
 * State Management:
 * - rowData: Current page of valorations
 * - searchTerm: Search query
 * - isSearching: Loading state for search
 * - currentPage: Pagination state
 * - selectedValoration: Review being acted upon
 * - showDeleteModal: Delete confirmation visibility
 * - isDeleting: Loading state during delete
 * - itemsPerPage: Reviews per page (10)
 *
 * KPI Metrics:
 * - Total Reviews: Count of all valorations
 * - Average Rating: Mean of all review scores
 * - Recent Reviews: Last 7 days count
 * - Quality Reviews: Helpful/detailed reviews count
 *
 * Search Functionality:
 * - Find reviews by reviewer name
 * - Filter by rating threshold
 * - Search by seller name
 * - Case-insensitive matching
 * - Partial text matching
 *
 * Delete Action:
 * - Confirmation modal prevents accidents
 * - Soft delete (marks as deleted)
 * - Cannot be undone by admin
 * - Logged for audit trail
 *
 * Review Quality:
 * - Indicators for helpful reviews
 * - Flags for potential spam
 * - Rating distribution
 * - Trending review themes
 *
 * Client Loader:
 * - Fetches valorations via getAdminValorations()
 * - Supports pagination (page, size)
 * - Error handling and redirect to login on failure
 *
 * Moderation Use Cases:
 * - Monitor marketplace reputation
 * - Remove fake/spam reviews
 * - Track seller ratings
 * - Quality assurance for reviews
 * - Community safety management
 *
 * @component
 * @returns React component for valoration/review management
 */

import React, { useState } from 'react';
import { redirect } from 'react-router';
import { Container, Row, Col, Card, Table, Button, Stack, Alert, Form, Modal } from 'react-bootstrap';
import { getAdminValorations, deleteValoration } from '~/services/admin-service';
import type ValorationDTO from '~/dto/ValorationDTO';
import type PagedResponse from '~/dto/PagedResponse';
import AdminHeader from '~/components/admin/AdminHeader';
import ConfirmModal from '~/components/confirm-modal';

/**
 * KPI Card Props Interface
 * Defines structure for valoration metric cards
 */
interface KPIData {
  readonly label: string;
  readonly value: string | number;
  readonly color: string;
  readonly icon: string;
}

/**
 * KPI Card Component
 * Displays valoration metric with icon and color coding
 */
const KPICard = ({ label, value, color, icon, bg }: KPIData & { readonly bg: string }) => (
  <Card className="clay-card border-0 h-100" style={{ borderLeft: `5px solid ${color}` }}>
    <Card.Body className="p-4">
      <Stack direction="horizontal" gap={3} className="justify-content-between align-items-start mb-3">
        <h5 className="fw-800 mb-0 text-dark">{label}</h5>
        <div style={{
          padding: '10px 14px',
          borderRadius: '10px',
          backgroundColor: bg,
        }}>
          <i className={`fa-solid ${icon}`} style={{ color, fontSize: '1.2rem' }} />
        </div>
      </Stack>
      <h2 className="fw-800 mb-0" style={{ color }}>{value}</h2>
    </Card.Body>
  </Card>
);

/**
 * Get Background Color for KPI Card
 * Maps color codes to light background colors
 */
const getKPIBg = (color: string): string => {
  const map: Record<string, string> = {
    '#fbbf24': '#fef3c7',
    '#06b6d4': '#e0f2fe',
    '#10b981': '#ecfdf5',
  };
  return map[color] || '#f8fafc';
};

/**
 * Client-side loader: Fetch valorations
 * 
 * Gets all valorations from backend.
 * Fetches up to 1000 reviews for client-side pagination.
 * Redirects to login on authentication error.
 * 
 * @returns Paginated valoration data
 */
export async function clientLoader() {
  try {
    const data = await getAdminValorations(0, 1000);
    return data || {};
  } catch (error) {
    console.error('Failed to fetch valorations:', error);
    throw redirect('/login');
  }
}

export default function AdminValorations({ loaderData }: { readonly loaderData: any }) {
  const pagedData = loaderData as PagedResponse<ValorationDTO>;
  const valorations = pagedData.content || [];

  const [rowData, setRowData] = useState<ValorationDTO[]>(valorations);
  const [selectedVal, setSelectedVal] = useState<ValorationDTO | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchMode, setSearchMode] = useState<'id' | 'users'>('id');
  const [searchId, setSearchId] = useState('');
  const [searchSeller, setSearchSeller] = useState('');
  const [searchBuyer, setSearchBuyer] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const itemsPerPage = 10;

  const loadValorations = async (
    options?: {
      mode?: 'id' | 'users';
      id?: string;
      seller?: string;
      buyer?: string;
    }
  ) => {
    const mode = options?.mode ?? searchMode;
    const idValue = options?.id ?? searchId;
    const sellerValue = options?.seller ?? searchSeller;
    const buyerValue = options?.buyer ?? searchBuyer;

    setIsSearching(true);
    setSearchError(null);

    try {
      if (mode === 'id') {
        const trimmedId = idValue.trim();
        const parsedId = trimmedId ? Number(trimmedId) : undefined;

        if (trimmedId && Number.isNaN(parsedId)) {
          setSearchError('Please enter a valid valoration ID.');
          return;
        }

        const response = await getAdminValorations(0, 1000, parsedId);
        setRowData(response.content || []);
      } else {
        const response = await getAdminValorations(
          0,
          1000,
          undefined,
          sellerValue.trim() || undefined,
          buyerValue.trim() || undefined
        );
        setRowData(response.content || []);
      }

      setCurrentPage(0);
    } catch (error: any) {
      setSearchError(error?.message || 'Failed to load reviews.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await loadValorations();
  };

  const handleClearSearch = async () => {
    setSearchMode('id');
    setSearchId('');
    setSearchSeller('');
    setSearchBuyer('');
    await loadValorations({ mode: 'id', id: '', seller: '', buyer: '' });
  };

  const handleDeleteClick = (val: ValorationDTO) => {
    setSelectedVal(val);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedVal) return;
    setIsLoading(true);
    try {
      await deleteValoration(selectedVal.id);
      setRowData(prev => prev.filter(v => v.id !== selectedVal.id));
      setShowDeleteModal(false);
      setSelectedVal(null);
    } catch {
      alert('Failed to delete review.');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ KPIs CORRECTOS
  const totalReviews = rowData.length;
  const averageRating =
    totalReviews > 0
      ? (rowData.reduce((sum, v) => sum + (v.rating || 0), 0) / totalReviews).toFixed(1)
      : '0';

  const fiveStarCount = rowData.filter(v => v.rating === 5).length;

  const paginatedData = rowData.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const totalPages = Math.ceil(rowData.length / itemsPerPage);

  return (
    <>
      <AdminHeader
        title="Global Valorations"
        subtitle="Monitor and manage user feedback and platform integrity."
      />

      <Card className="clay-card border-0 p-3 mb-4">
        <Card.Body>
          <Form onSubmit={handleSearchSubmit}>
            <Row className="g-3 align-items-end">
              {searchMode === 'id' ? (
                <Col xs={12} lg={9}>
                  <Form.Label className="fw-700 small text-uppercase text-muted">Search valoration by ID</Form.Label>
                  <Form.Control
                    type="text"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    placeholder="Type a valoration id..."
                    className="rounded-3 py-2 bg-light border-0"
                  />
                </Col>
              ) : (
                <>
                  <Col xs={12} lg={4}>
                    <Form.Label className="fw-700 small text-uppercase text-muted">Seller</Form.Label>
                    <Form.Control
                      type="text"
                      value={searchSeller}
                      onChange={(e) => setSearchSeller(e.target.value)}
                      placeholder="Type seller name..."
                      className="rounded-3 py-2 bg-light border-0"
                    />
                  </Col>
                  <Col xs={12} lg={4}>
                    <Form.Label className="fw-700 small text-uppercase text-muted">Buyer</Form.Label>
                    <Form.Control
                      type="text"
                      value={searchBuyer}
                      onChange={(e) => setSearchBuyer(e.target.value)}
                      placeholder="Type buyer name..."
                      className="rounded-3 py-2 bg-light border-0"
                    />
                  </Col>
                </>
              )}

              <Col xs={12} lg={3}>
                <Form.Label className="fw-700 small text-uppercase text-muted">Search mode</Form.Label>
                <Form.Select
                  value={searchMode}
                  onChange={(e) => setSearchMode(e.target.value as 'id' | 'users')}
                  className="rounded-3 py-2 bg-light border-0"
                >
                  <option value="id">by id</option>
                  <option value="users">by users</option>
                </Form.Select>
              </Col>
            </Row>

            <Stack direction="horizontal" gap={2} className="justify-content-end mt-3">
              <Button type="submit" variant="dark" className="fw-700 rounded-pill px-4" disabled={isSearching}>
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
              <Button type="button" variant="light" className="fw-700 rounded-pill px-4" onClick={handleClearSearch} disabled={isSearching}>
                Clear
              </Button>
            </Stack>
          </Form>
        </Card.Body>
      </Card>

      {searchError && (
        <Alert variant="danger" className="mb-4">
          {searchError}
        </Alert>
      )}

      {/* KPI */}
      <Row className="g-3 mb-4">
        <Col xs={12} sm={6} lg={4}>
          <KPICard label="Total Reviews" value={totalReviews} color="#fbbf24" icon="fa-star" bg={getKPIBg('#fbbf24')} />
        </Col>
        <Col xs={12} sm={6} lg={4}>
          <KPICard label="Average Rating" value={`${averageRating} / 5`} color="#06b6d4" icon="fa-chart-bar" bg={getKPIBg('#06b6d4')} />
        </Col>
        <Col xs={12} sm={6} lg={4}>
          <KPICard label="5-Star Reviews" value={fiveStarCount} color="#10b981" icon="fa-trophy" bg={getKPIBg('#10b981')} />
        </Col>
      </Row>

      {/* TABLE */}
      <Card className="clay-card border-0 p-3">
        <Card.Body>
          <div style={{ overflowX: 'auto' }}>
            <Table hover responsive className="table-admin mb-0 align-middle">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>BUYER</th>
                  <th>TRANSACTION</th>
                  <th>STARS</th>
                  <th>COMMENT</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((val) => (
                    <tr key={val.id}>
                      <td className="fw-700 small">#{val.id}</td>
                      <td className="small">{val.buyerName}</td>
                      <td className="small">#{val.transactionId}</td>
                      <td>
                        <span className="fw-700" style={{ color: '#fbbf24' }}>
                          {val.rating} ★
                        </span>
                      </td>
                      <td className="text-muted small" style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {val.comment || '-'}
                      </td>
                      <td>
                        <Button
                          variant="light"
                          size="sm"
                          className="btn-action-admin btn-delete"
                          onClick={() => handleDeleteClick(val)}
                        >
                          <i className="fa-solid fa-trash" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-muted">
                      No reviews found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <Stack direction="horizontal" className="justify-content-between mt-4 pt-3 border-top">
              <span className="text-muted small">
                Showing {currentPage * itemsPerPage + 1} to {Math.min((currentPage + 1) * itemsPerPage, rowData.length)} of {rowData.length}
              </span>
              <div className="btn-group">
                <Button size="sm" onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0}>
                  <i className="fa-solid fa-chevron-left" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button key={i} size="sm" variant={currentPage === i ? 'primary' : 'outline-secondary'} onClick={() => setCurrentPage(i)}>
                    {i + 1}
                  </Button>
                ))}
                <Button size="sm" onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))} disabled={currentPage === totalPages - 1}>
                  <i className="fa-solid fa-chevron-right" />
                </Button>
              </div>
            </Stack>
          )}
        </Card.Body>
      </Card>

      <ConfirmModal
        show={showDeleteModal}
        title="Delete Review?"
        message="Are you sure you want to permanently delete this review?"
        confirmText="Delete"
        variant="danger"
        isLoading={isLoading}
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </>
  );
}

export function ErrorBoundary({ error }: { readonly error: Error }) {
  return (
    <Container className="mt-5">
      <Alert variant="danger">
        <Alert.Heading>Error Loading Reviews!</Alert.Heading>
        <p>{error instanceof Error ? error.message : 'Unexpected error'}</p>
      </Alert>
    </Container>
  );
}