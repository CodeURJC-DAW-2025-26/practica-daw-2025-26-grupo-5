import { useState } from 'react';
import { redirect, useRevalidator } from 'react-router';
import { Container, Row, Col, Card, Table, Button, Badge, Pagination, Alert } from 'react-bootstrap';
import { getAdminValorations, deleteValoration } from '~/services/admin-service';
import type ValorationDTO from '~/dto/ValorationDTO';
import type PagedResponse from '~/dto/PagedResponse';
import AdminHeader from '~/components/admin/AdminHeader';
import ConfirmModal from '~/components/confirm-modal';

export async function clientLoader() {
  try {
    const data = await getAdminValorations(0, 100);
    return data || {};
  } catch (error) {
    console.error('Failed to fetch valorations:', error);
    throw redirect('/login');
  }
}

const KPICard = ({ icon, label, value, color }: { icon: string; label: string; value: string | number; color: string }) => (
  <Card className="border-0 h-100" style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.12)', borderRadius: '16px' }}>
    <Card.Body className="text-center p-5">
      <i className={`fa-solid ${icon}`} style={{ fontSize: '2.5rem', color, marginBottom: '12px', display: 'block' }} />
      <p className="text-muted small fw-700 mb-2 text-uppercase" style={{ letterSpacing: '0.5px' }}>{label}</p>
      <h2 className="fw-900 mb-0" style={{ color, fontSize: '2rem' }}>
        {value}
      </h2>
    </Card.Body>
  </Card>
);

export default function AdminValorations({ loaderData }: { readonly loaderData: any }) {
  const revalidator = useRevalidator();
  const pagedData = loaderData as PagedResponse<ValorationDTO>;
  const valorations = pagedData.content || [];

  const [rowData, setRowData] = useState<ValorationDTO[]>(valorations);
  const [selectedVal, setSelectedVal] = useState<ValorationDTO | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  const handleDeleteClick = (val: ValorationDTO) => {
    setSelectedVal(val);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedVal) return;
    setIsLoading(true);
    try {
      await deleteValoration(selectedVal.id);
      setRowData((prev) => prev.filter((v) => v.id !== selectedVal.id));
      setShowDeleteModal(false);
      setSelectedVal(null);
      revalidator.revalidate();
    } catch (error) {
      console.error('Failed to delete valoration:', error);
      alert('Failed to delete review. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const totalReviews = rowData.length;
  const averageRating = totalReviews > 0 
    ? (rowData.reduce((sum, v) => sum + (v.rating || 0), 0) / totalReviews).toFixed(1)
    : '0';
  const fiveStarCount = rowData.filter(v => v.rating === 5).length;

  const paginatedData = rowData.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );
  const totalPages = Math.ceil(rowData.length / itemsPerPage);

  const handlePreviousPage = () => setCurrentPage(Math.max(0, currentPage - 1));
  const handleNextPage = () => setCurrentPage(Math.min(totalPages - 1, currentPage + 1));

  return (
    <>
      <AdminHeader
        title="Global Valorations"
        subtitle="Monitor and manage user feedback and platform integrity."
      />

      <Container fluid className="py-5" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #f0f4f8 100%)', minHeight: '100vh' }}>
        {/* KPI Row */}
        <Row className="g-4 mb-5">
          <Col xs={12} sm={6} lg={4}>
            <KPICard
              icon="fa-star"
              label="Total Reviews"
              value={totalReviews}
              color="#fbbf24"
            />
          </Col>
          <Col xs={12} sm={6} lg={4}>
            <KPICard
              icon="fa-chart-bar"
              label="Average Rating"
              value={`${averageRating} / 5`}
              color="#06b6d4"
            />
          </Col>
          <Col xs={12} sm={6} lg={4}>
            <KPICard
              icon="fa-trophy"
              label="5-Star Reviews"
              value={fiveStarCount}
              color="#10b981"
            />
          </Col>
        </Row>

        {/* Table Card */}
        <Card className="border-0 h-100" style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.12)', borderRadius: '16px' }}>
          <Card.Body className="p-0">
            <div style={{ overflowX: 'auto' }}>
              <Table hover responsive className="mb-0">
                <thead style={{ backgroundColor: '#f5f7fa', borderBottom: '2px solid #e5e7eb' }}>
                  <tr>
                    <th className="text-muted fw-700 small">VAL ID</th>
                    <th className="text-muted fw-700 small">BUYER</th>
                    <th className="text-muted fw-700 small">SELLER</th>
                    <th className="text-muted fw-700 small">RATING</th>
                    <th className="text-muted fw-700 small">COMMENT</th>
                    <th className="text-muted fw-700 small">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((val) => (
                      <tr key={val.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td className="text-muted small fw-700">#{val.id}</td>
                        <td className="text-muted small">{val.buyerName || 'Unknown'}</td>
                        <td className="text-muted small">{val.sellerName || 'Unknown'}</td>
                        <td>
                          <span className="fw-700 small" style={{ color: '#fbbf24' }}>
                            {val.rating} {val.rating > 0 && '★'}
                          </span>
                        </td>
                        <td className="text-muted small" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {val.comment || '-'}
                        </td>
                        <td>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="fw-700"
                            onClick={() => handleDeleteClick(val)}
                            style={{ fontSize: '0.7rem' }}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-4 pt-3 px-3 border-top">
                <small className="text-muted">
                  Showing {currentPage * itemsPerPage + 1} to{' '}
                  {Math.min((currentPage + 1) * itemsPerPage, rowData.length)} of {rowData.length}
                </small>
                <Pagination className="mb-0">
                  <Pagination.First
                    onClick={() => setCurrentPage(0)}
                    disabled={currentPage === 0}
                  />
                  <Pagination.Prev
                    onClick={handlePreviousPage}
                    disabled={currentPage === 0}
                  />
                  {Array.from({ length: totalPages }, (_, i) => (
                    <Pagination.Item
                      key={i}
                      active={currentPage === i}
                      onClick={() => setCurrentPage(i)}
                    >
                      {i + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages - 1}
                  />
                  <Pagination.Last
                    onClick={() => setCurrentPage(totalPages - 1)}
                    disabled={currentPage === totalPages - 1}
                  />
                </Pagination>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>

      {/* Confirm Modal */}
      <ConfirmModal
        show={showDeleteModal}
        title="Delete Review?"
        message={`Are you sure you want to permanently delete this review? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isLoading}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setSelectedVal(null);
        }}
      />
    </>
  );
}

export function ErrorBoundary({ error }: { readonly error: Error }) {
  return (
    <Container className="mt-5">
      <Alert variant="danger">
        <Alert.Heading>Error Loading Reviews!</Alert.Heading>
        <p>{error instanceof Error ? error.message : 'An unexpected error occurred'}</p>
        <Button
          variant="outline-danger"
          onClick={() => (globalThis.location.href = '/')}
        >
          Back to home
        </Button>
      </Alert>
    </Container>
  );
}
