import { useState } from 'react';
import { redirect, useRevalidator } from 'react-router';
import { Container, Row, Col, Card, Table, Button, Stack, Alert } from 'react-bootstrap';
import { getAdminValorations, deleteValoration } from '~/services/admin-service';
import type ValorationDTO from '~/dto/ValorationDTO';
import type PagedResponse from '~/dto/PagedResponse';
import AdminHeader from '~/components/admin/AdminHeader';
import ConfirmModal from '~/components/confirm-modal';

interface KPIData {
  readonly label: string;
  readonly value: string | number;
  readonly color: string;
  readonly icon: string;
}

const KPICard = ({ label, value, color, icon, bg }: KPIData & { readonly bg: string }) => (
  <Card className="clay-card border-0 h-100" style={{ borderLeft: `5px solid ${color}` }}>
    <Card.Body className="p-4">
      <Stack direction="horizontal" gap={3} className="justify-content-between align-items-start mb-3">
        <h5 className="fw-800 mb-0 text-dark">{label}</h5>
        <div style={{
          padding: '10px 14px',
          borderRadius: '10px',
          backgroundColor: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <i className={`fa-solid ${icon}`} style={{ color, fontSize: '1.2rem' }} />
        </div>
      </Stack>
      <h2 className="fw-800 mb-0" style={{ color, fontSize: '2.2rem' }}>{value}</h2>
    </Card.Body>
  </Card>
);

const getKPIBg = (color: string): string => {
  const map: Record<string, string> = {
    '#fbbf24': '#fef3c7',
    '#06b6d4': '#e0f2fe',
    '#10b981': '#ecfdf5',
  };
  return map[color] || '#f8fafc';
};

export async function clientLoader() {
  try {
    const data = await getAdminValorations(0, 100);
    return data || {};
  } catch (error) {
    console.error('Failed to fetch valorations:', error);
    throw redirect('/login');
  }
}

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

  const handleDeleteClick = (val: ValorationDTO) => { setSelectedVal(val); setShowDeleteModal(true); };

  const confirmDelete = async () => {
    if (!selectedVal) return;
    setIsLoading(true);
    try {
      await deleteValoration(selectedVal.id);
      setRowData((prev) => prev.filter((v) => v.id !== selectedVal.id));
      setShowDeleteModal(false); setSelectedVal(null); revalidator.revalidate();
    } catch (error) { alert('Failed to delete review.'); } finally { setIsLoading(false); }
  };

  const totalReviews = rowData.length;
  const averageRating = totalReviews > 0 ? (rowData.reduce((sum, v) => sum + (v.rating || 0), 0) / totalReviews).toFixed(1) : '0';
  const fiveStarCount = rowData.filter(v => v.rating === 5).length;

  const paginatedData = rowData.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);
  const totalPages = Math.ceil(rowData.length / itemsPerPage);

  return (
    <>
      <AdminHeader title="Global Valorations" subtitle="Monitor and manage user feedback and platform integrity." />

        {/* KPI Row */}
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

        {/* Table */}
        <Card className="clay-card border-0 p-3">
          <Card.Body>
            <div style={{ overflowX: 'auto' }}>
              <Table hover responsive className="table-admin mb-0 align-middle">
                <thead>
                  <tr>
                    <th>VAL ID</th>
                    <th>BUYER</th>
                    <th>SELLER</th>
                    <th>RATING</th>
                    <th>COMMENT</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((val) => (
                      <tr key={val.id}>
                        <td className="text-muted small fw-700">#{val.id}</td>
                        <td className="fw-600 small">{val.buyerName || 'Unknown'}</td>
                        <td className="fw-600 small">{val.sellerName || 'Unknown'}</td>
                        <td>
                          <span className="fw-800" style={{ color: '#fbbf24' }}>{val.rating} ★</span>
                        </td>
                        <td className="text-muted small fw-500" style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {val.comment || '-'}
                        </td>
                        <td>
                           <Button variant="light" size="sm" className="btn-action-admin btn-delete" onClick={() => handleDeleteClick(val)}>
                             <i className="fa-solid fa-trash" />
                           </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={6} className="text-center py-4 text-muted">No reviews found</td></tr>
                  )}
                </tbody>
              </Table>
            </div>

            {totalPages > 1 && (
              <Stack direction="horizontal" className="justify-content-between mt-4 pt-3 border-top">
                <span className="text-muted small fw-600">Showing {currentPage * itemsPerPage + 1} to {Math.min((currentPage + 1) * itemsPerPage, rowData.length)} of {rowData.length}</span>
                <div className="btn-group">
                  <Button variant="outline-secondary" size="sm" onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0}><i className="fa-solid fa-chevron-left" /></Button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <Button key={i} variant={currentPage === i ? 'primary' : 'outline-secondary'} size="sm" onClick={() => setCurrentPage(i)}>{i + 1}</Button>
                  ))}
                  <Button variant="outline-secondary" size="sm" onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))} disabled={currentPage === totalPages - 1}><i className="fa-solid fa-chevron-right" /></Button>
                </div>
              </Stack>
            )}
          </Card.Body>
        </Card>

      <ConfirmModal
        show={showDeleteModal} title="Delete Review?" message={`Are you sure you want to permanently delete this review?`} confirmText="Delete" cancelText="Cancel" variant="danger" isLoading={isLoading} onConfirm={confirmDelete} onCancel={() => setShowDeleteModal(false)}
      />
    </>
  );
}

export function ErrorBoundary({ error }: { readonly error: Error }) {
  return (
    <Container className="mt-5">
      <Alert variant="danger" className="clay-card">
        <Alert.Heading className="fw-800">Error Loading Reviews!</Alert.Heading>
        <p className="fw-600">{error instanceof Error ? error.message : 'An unexpected error occurred'}</p>
        <Button variant="outline-danger" className="fw-700 rounded-pill" onClick={() => (globalThis.location.href = '/')}>Back to home</Button>
      </Alert>
    </Container>
  );
}