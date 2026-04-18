import { useState } from 'react';
import { redirect, useRevalidator } from 'react-router';
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

  return (
    <>
      <AdminHeader
        title="Global Valorations"
        subtitle="Monitor and manage user feedback and platform integrity."
      />

      <div className="container-fluid">
        {/* KPI Row */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-sm-6 col-lg-4">
            <div className="clay-card p-4 text-center shadow-sm">
              <i className="fa-solid fa-star" style={{ fontSize: '2rem', color: '#fbbf24', marginBottom: '8px', display: 'block' }} />
              <p className="text-muted small mb-1">Total Reviews</p>
              <h3 className="fw-800 mb-0" style={{ color: '#fbbf24' }}>{totalReviews}</h3>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-4">
            <div className="clay-card p-4 text-center shadow-sm">
              <i className="fa-solid fa-chart-bar" style={{ fontSize: '2rem', color: '#06b6d4', marginBottom: '8px', display: 'block' }} />
              <p className="text-muted small mb-1">Average Rating</p>
              <h3 className="fw-800 mb-0" style={{ color: '#06b6d4' }}>{averageRating} / 5</h3>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-4">
            <div className="clay-card p-4 text-center shadow-sm">
              <i className="fa-solid fa-trophy" style={{ fontSize: '2rem', color: '#10b981', marginBottom: '8px', display: 'block' }} />
              <p className="text-muted small mb-1">5-Star Reviews</p>
              <h3 className="fw-800 mb-0" style={{ color: '#10b981' }}>{fiveStarCount}</h3>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="clay-card p-4 shadow-sm bg-white" style={{ borderRadius: '20px' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="table table-hover align-middle mb-0">
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
                        <button
                          type="button"
                          className="btn btn-sm fw-700"
                          style={{
                            backgroundColor: '#fee2e2',
                            color: '#dc3545',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '5px 10px',
                            fontSize: '0.7rem',
                            cursor: 'pointer',
                          }}
                          onClick={() => handleDeleteClick(val)}
                        >
                          <i className="fa-solid fa-trash" />
                        </button>
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
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
              <small className="text-muted">
                Showing {currentPage * itemsPerPage + 1} to {Math.min((currentPage + 1) * itemsPerPage, rowData.length)} of {rowData.length}
              </small>
              <div className="btn-group">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                >
                  <i className="fa-solid fa-chevron-left" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`btn btn-sm ${currentPage === i ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setCurrentPage(i)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage === totalPages - 1}
                >
                  <i className="fa-solid fa-chevron-right" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

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
    <div className="alert alert-danger m-5" role="alert">
      <h4 className="alert-heading">Error Loading Reviews!</h4>
      <p>{error instanceof Error ? error.message : 'An unexpected error occurred'}</p>
      <button className="btn btn-outline-danger" onClick={() => (globalThis.location.href = '/')}>
        Back to home
      </button>
    </div>
  );
}
