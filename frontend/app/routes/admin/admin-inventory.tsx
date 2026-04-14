import { useState } from 'react';
import { redirect } from 'react-router';
import { getAdminProducts, deleteProduct, createProduct } from '~/services/admin-service';
import type ProductDTO from '~/dto/ProductDTO';
import type PagedResponse from '~/dto/PagedResponse';
import AdminHeader from '~/components/admin/AdminHeader';
import ConfirmModal from '~/components/confirm-modal';
import ProductForm from '~/components/ProductForm';

export async function clientLoader() {
  try {
    const data = await getAdminProducts(0, 100);
    return data || {};
  } catch (error) {
    console.error('Failed to fetch admin products:', error);
    throw redirect('/login');
  }
}

export default function AdminInventory({ loaderData }: { readonly loaderData: any }) {
  const pagedData = loaderData as PagedResponse<ProductDTO>;
  const products = pagedData.content || [];

  const [rowData, setRowData] = useState<ProductDTO[]>(products);
  const [selectedProduct, setSelectedProduct] = useState<ProductDTO | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const itemsPerPage = 10;

  const handleAddProduct = () => {
    setFormError(null);
    setShowAddModal(true);
  };

  const handleFormSubmit = async (formData: FormData) => {
    setIsPending(true);
    setFormError(null);
    try {
      const newProduct = await createProduct(formData);
      setRowData((prev) => [newProduct, ...prev]);
      setShowAddModal(false);
    } catch (error: any) {
      setFormError(error.response?.data?.message || 'Failed to create product. Please try again.');
      console.error('Failed to create product:', error);
    } finally {
      setIsPending(false);
    }
  };

  const handleDeleteClick = (product: ProductDTO) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;
    setIsLoading(true);
    try {
      await deleteProduct(selectedProduct.id);
      setRowData((prev) => prev.filter((p) => p.id !== selectedProduct.id));
      setShowDeleteModal(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Failed to delete product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const totalProducts = rowData.length;
  const averagePrice = totalProducts > 0 ? rowData.reduce((sum, p) => sum + (p.price || 0), 0) / totalProducts : 0;
  const totalValue = rowData.reduce((sum, p) => sum + (p.price || 0), 0);

  const paginatedData = rowData.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );
  const totalPages = Math.ceil(rowData.length / itemsPerPage);

  return (
    <>
      <AdminHeader
        title="Global Inventory"
        subtitle="Audit, edit, or remove any listing on the platform."
      />

      <div className="container-fluid">
        {/* KPI Row */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-sm-6 col-lg-4">
            <div className="clay-card p-4 text-center shadow-sm">
              <i className="fa-solid fa-box" style={{ fontSize: '2rem', color: '#7c3aed', marginBottom: '8px', display: 'block' }} />
              <p className="text-muted small mb-1">Total Products</p>
              <h3 className="fw-800 mb-0" style={{ color: '#7c3aed' }}>{totalProducts}</h3>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-4">
            <div className="clay-card p-4 text-center shadow-sm">
              <i className="fa-solid fa-euro-sign" style={{ fontSize: '2rem', color: '#059669', marginBottom: '8px', display: 'block' }} />
              <p className="text-muted small mb-1">Average Price</p>
              <h3 className="fw-800 mb-0" style={{ color: '#059669' }}>€{averagePrice.toFixed(0)}</h3>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-4">
            <div className="clay-card p-4 text-center shadow-sm">
              <i className="fa-solid fa-chart-line" style={{ fontSize: '2rem', color: '#0369a1', marginBottom: '8px', display: 'block' }} />
              <p className="text-muted small mb-1">Total Value</p>
              <h3 className="fw-800 mb-0" style={{ color: '#0369a1' }}>€{totalValue.toFixed(0)}</h3>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="clay-card p-4 shadow-sm bg-white" style={{ borderRadius: '20px' }}>
          {/* Add Product Button */}
          <div className="mb-4 d-flex justify-content-end">
            <button
              type="button"
              className="btn fw-700"
              style={{
                backgroundColor: '#7c3aed',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 16px',
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
              onClick={handleAddProduct}
            >
              <i className="fa-solid fa-plus" />
              {' '}
              Add Product
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table table-hover align-middle mb-0">
              <thead style={{ backgroundColor: '#f5f7fa', borderBottom: '2px solid #e5e7eb' }}>
                <tr>
                  <th className="text-muted fw-700 small">ID</th>
                  <th className="text-muted fw-700 small">PRODUCT</th>
                  <th className="text-muted fw-700 small">CATEGORY</th>
                  <th className="text-muted fw-700 small">PRICE</th>
                  <th className="text-muted fw-700 small">STATUS</th>
                  <th className="text-muted fw-700 small">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((product) => (
                    <tr key={product.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td className="text-muted small fw-700">#{product.id}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <img
                            src={`/api/v1/products/${product.id}/image`}
                            alt={product.name}
                            width="36"
                            height="36"
                            className="rounded"
                            style={{ objectFit: 'cover', backgroundColor: '#e5e7eb' }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                          <div>
                            <p className="fw-700 mb-0 small">{product.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-muted small">{product.category}</td>
                      <td className="fw-700 small" style={{ color: '#059669' }}>€{product.price?.toFixed(2)}</td>
                      <td>
                        <span
                          className={`badge fw-700`}
                          style={{
                            backgroundColor: product.status === 'Active' ? '#dcfce7' : '#fee2e2',
                            color: product.status === 'Active' ? '#2f855a' : '#c53030',
                            padding: '5px 10px',
                            borderRadius: '6px',
                            fontSize: '0.7rem',
                          }}
                        >
                          <i className={`fa-solid fa-${product.status === 'Active' ? 'check-circle' : 'circle'}`} />
                          &nbsp;{product.status?.toUpperCase()}
                        </span>
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
                          onClick={() => handleDeleteClick(product)}
                        >
                          <i className="fa-solid fa-trash" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-muted">
                      No products found
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

      {/* Add Product Modal */}
      {showAddModal && (
        <div
          className="modal-backdrop fade show"
          style={{
            display: 'block',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 2000,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            width: '100%',
            height: '100%',
            overflowY: 'auto',
            paddingTop: '2rem',
            paddingBottom: '2rem',
          }}
        >
          <div 
            style={{ 
              maxWidth: '900px',
              width: '90%',
              margin: '0 auto',
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden',
            }}
          >
              <ProductForm
                actionState={[
                  { success: false, error: formError },
                  handleFormSubmit,
                  isPending,
                ]}
                onCancel={() => {
                  setShowAddModal(false);
                  setFormError(null);
                }}
              />
            </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        show={showDeleteModal}
        title="Delete Product?"
        message={`Are you sure you want to permanently delete "${selectedProduct?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isLoading}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setSelectedProduct(null);
        }}
      />
    </>
  );
}
export function ErrorBoundary({ error }: { readonly error: Error }) {
  return (
    <div className="alert alert-danger m-5" role="alert">
      <h4 className="alert-heading">Error Loading Inventory!</h4>
      <p>{error instanceof Error ? error.message : 'An unexpected error occurred'}</p>
      <button className="btn btn-outline-danger" onClick={() => (globalThis.location.href = '/')}>
        Back to home
      </button>
    </div>
  );
}