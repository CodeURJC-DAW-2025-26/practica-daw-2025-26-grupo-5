import { useState } from 'react';
import { redirect } from 'react-router';
import { getAdminProducts, deleteProduct, createProduct } from '~/services/admin-service';
import type ProductDTO from '~/dto/ProductDTO';
import type PagedResponse from '~/dto/PagedResponse';
import AdminHeader from '~/components/admin/AdminHeader';
import ConfirmModal from '~/components/confirm-modal';
<<<<<<< Updated upstream
import ProductForm from '~/components/ProductForm';
=======
import FormInput from '~/components/form-input';
import FormSelect from '~/components/form-select';

// Styles obligatories of Ag-Grid Styles
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
  const handleAddProduct = () => {
    setFormError(null);
    setShowAddModal(true);
=======
  const methods = useForm<any>();

  // Open the modal to create (without item) or Edit (with item)
  const openForm = (item: ProductDTO | null = null) => {
    setSelected(item);
    methods.reset(item || { name: '', category: '', price: 0, status: 'Active', description: '', location: '' });
    setModalType('form');
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
  const paginatedData = rowData.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );
  const totalPages = Math.ceil(rowData.length / itemsPerPage);
=======
  // Definition of the columns with type any[] to avoid errors of TypeScript
  const columnDefs: any[] = [
    { field: 'id', headerName: 'ID', width: 80, cellRenderer: (p: any) => <small className="text-muted">#{p.data.id}</small> },
    { 
      field: 'name', headerName: 'Product', width: 250,
      cellRenderer: (p: any) => (
        <div className="d-flex align-items-center gap-2">
          <img 
            src={p.data.image?.id ? `http://localhost:8443/api/v1/images/${p.data.image.id}` : 'https://placehold.co/32x32?text=N/A'} 
            width="32" height="32" className="rounded shadow-sm" style={{objectFit: 'cover'}}
          />
          <div>
            <p className="fw-bold mb-0 small">{p.data.name}</p>
            <p className="x-small text-muted mb-0">{p.data.category}</p>
          </div>
        </div>
      )
    },
    { field: 'price', headerName: 'Price', width: 110, cellRenderer: (p: any) => <span className="fw-bold text-primary">{p.value?.toFixed(2)} €</span> },
    { field: 'stock', headerName: 'Stock', width: 90 },
    { 
      field: 'status', headerName: 'Status', width: 110,
      cellRenderer: (p: any) => (
        <span className={`badge ${p.value === 'Active' ? 'bg-success' : 'bg-secondary'}`} style={{fontSize: '0.7rem'}}>
          {p.value?.toUpperCase()}
        </span>
      )
    },
    {
      headerName: 'Actions', width: 150, sortable: false, filter: false,
      cellRenderer: (p: any) => (
        <div className="d-flex gap-2 pt-1">
          <button className="btn btn-sm btn-action-admin" onClick={() => openForm(p.data)}><i className="fa-solid fa-pen" /></button>
          <button className="btn btn-sm btn-danger-clay" onClick={() => { setSelected(p.data); setModalType('delete'); }}><i className="fa-solid fa-trash" /></button>
        </div>
      )
    }
  ];
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
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
=======
      {/* Modal Unified (Add/Edit) */}
      <Modal show={modalType === 'form'} onHide={() => setModalType(null)} centered size="lg">
        <Modal.Header closeButton className="border-0"><Modal.Title className="fw-bold">{selected ? 'Edit' : 'Add'} Product</Modal.Title></Modal.Header>
        <Modal.Body className="px-4 pb-4">
          <FormProvider {...methods}>
            <Form onSubmit={methods.handleSubmit(handleSave)}>
              <FormInput name="name" label="Product Name" required />
              <div className="row">
                <div className="col-md-6"><FormSelect name="category" label="Category" required options={[{value:'Tech', label:'Tech'}, {value:'Home', label:'Home'}, {value:'Cars', label:'Cars'}]} /></div>
                <div className="col-md-6"><FormInput name="price" label="Price (€)" type="number" required /></div>
              </div>
              <FormInput name="location" label="Location" required />
              <FormInput name="description" label="Description" required />
              <FormSelect name="status" label="Status" options={[{value:'Active', label:'Active'}, {value:'Sold', label:'Sold'}, {value:'Hidden', label:'Hidden'}]} />
              <Button type="submit" className="w-100 mt-4 btn-action-admin border-0 py-2 fw-bold" disabled={isLoading}>
                {isLoading ? 'Processing...' : (selected ? 'Update Product' : 'Create Product')}
              </Button>
            </Form>
          </FormProvider>
        </Modal.Body>
      </Modal>

      {/* Confirmation Deleted */}
      <ConfirmModal 
        show={modalType === 'delete'} 
        title="Delete Product?" 
        message={`Confirm deletion of "${selected?.name}"?`} 
        confirmText="Delete" variant="danger" isLoading={isLoading} 
        onConfirm={handleDelete} onCancel={() => setModalType(null)} 
>>>>>>> Stashed changes
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
