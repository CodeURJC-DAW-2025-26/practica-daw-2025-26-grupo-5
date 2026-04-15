import { useState, useEffect } from 'react';
import { redirect } from 'react-router';
import { getAdminProducts, deleteProduct, createProduct, updateProduct, getAdminUsers } from '~/services/admin-service';
import type ProductDTO from '~/dto/ProductDTO';
import type UserDTO from '~/dto/UserDTO';
import type PagedResponse from '~/dto/PagedResponse';
import AdminHeader from '~/components/admin/AdminHeader';
import ConfirmModal from '~/components/confirm-modal';
import { Modal, Form, Button } from 'react-bootstrap';

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
  const [users, setUsers] = useState<UserDTO[]>([]); // Lista de usuarios para el selector
  const [selectedProduct, setSelectedProduct] = useState<ProductDTO | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isEditingProduct, setIsEditingProduct] = useState(false); // Modo edición vs creación
  const itemsPerPage = 10;

  // Estado del nuevo formulario de Admin
  const [adminFormData, setAdminFormData] = useState({
    name: '',
    category: '',
    price: '',
    location: '',
    description: '',
    status: 'Active',
    sellerId: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Cargar usuarios al montar el componente
  useEffect(() => {
    getAdminUsers(0, 100)
      .then(data => {
        if (data && data.content) {
          setUsers(data.content);
        }
      })
      .catch(err => console.error('Error fetching users:', err));
  }, []);

  const handleAddProduct = () => {
    setFormError(null);
    setIsEditingProduct(false);
    setAdminFormData({ name: '', category: '', price: '', location: '', description: '', status: 'Active', sellerId: '' });
    setSelectedFile(null);
    setShowAddModal(true);
  };

  const handleEditProduct = (product: ProductDTO) => {
    setFormError(null);
    setIsEditingProduct(true);
    setSelectedProduct(product);
    setAdminFormData({
      name: product.name,
      category: product.category,
      price: String(product.price),
      location: product.location,
      description: product.description,
      status: product.status,
      sellerId: String(product.seller?.id || '')
    });
    setSelectedFile(null);
    setShowAddModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setFormError(null);

    const formData = new FormData();
    formData.append('name', adminFormData.name);
    formData.append('category', adminFormData.category);
    formData.append('price', adminFormData.price);
    formData.append('location', adminFormData.location);
    formData.append('description', adminFormData.description);
    formData.append('status', adminFormData.status);
    formData.append('sellerId', adminFormData.sellerId); // ID del dueño elegido
    if (selectedFile) {
      formData.append('image', selectedFile);
    }

    try {
      if (isEditingProduct && selectedProduct) {
        // Editar producto existente
        const updatedProduct = await updateProduct(selectedProduct.id, formData);
        setRowData((prev) => prev.map((p) => (p.id === selectedProduct.id ? updatedProduct : p)));
        setShowAddModal(false);
        setIsEditingProduct(false);
        setSelectedProduct(null);
      } else {
        // Crear nuevo producto
        const newProduct = await createProduct(formData);
        setRowData((prev) => [newProduct, ...prev]);
        setShowAddModal(false);
      }
    } catch (error: any) {
      setFormError(error.response?.data?.message || (isEditingProduct ? 'Failed to update product. Please try again.' : 'Failed to create product. Please try again.'));
      console.error(isEditingProduct ? 'Failed to update product:' : 'Failed to create product:', error);
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
                            backgroundColor: product.status === 'Active' || product.status === 'Public' ? '#dcfce7' : '#fee2e2',
                            color: product.status === 'Active' || product.status === 'Public' ? '#2f855a' : '#c53030',
                            padding: '5px 10px',
                            borderRadius: '6px',
                            fontSize: '0.7rem',
                          }}
                        >
                          <i className={`fa-solid fa-${product.status === 'Active' || product.status === 'Public' ? 'check-circle' : 'circle'}`} />
                          &nbsp;{product.status?.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <button
                            type="button"
                            className="btn btn-sm fw-700"
                            style={{
                              backgroundColor: '#f3f4f6',
                              color: '#4b5563',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '5px 10px',
                              fontSize: '0.7rem',
                              cursor: 'pointer',
                            }}
                            onClick={() => handleEditProduct(product)}
                          >
                            <i className="fa-solid fa-edit" />
                          </button>
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
                        </div>
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

      {/* Add/Edit Product Modal (Admin Native Form) */}
      <Modal 
        show={showAddModal} 
        onHide={() => {
          setShowAddModal(false);
          setIsEditingProduct(false);
          setSelectedProduct(null);
        }}
        size="lg"
        centered
        contentClassName="bg-white border-0 shadow-lg" 
        style={{ borderRadius: '24px' }}
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-800" style={{ color: '#1e293b' }}>
            {isEditingProduct ? 'Edit Product' : 'Create Product For Any User'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {formError && <div className="alert alert-danger mb-4">{formError}</div>}
          
          <Form onSubmit={handleFormSubmit}>
            <div className="row">
              {/* SELLER (Usuario) */}
              <Form.Group className="col-md-6 mb-3">
                <Form.Label className="fw-700 small text-uppercase text-muted" style={{ letterSpacing: '1px' }}>Seller</Form.Label>
                <Form.Select 
                  required
                  value={adminFormData.sellerId}
                  onChange={(e) => setAdminFormData({...adminFormData, sellerId: e.target.value})}
                  className="rounded-3 py-2 bg-light border-0"
                >
                  <option value="">Select user</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name || u.email} ({u.email})</option>
                  ))}
                </Form.Select>
              </Form.Group>

              {/* PRODUCT NAME */}
              <Form.Group className="col-md-6 mb-3">
                <Form.Label className="fw-700 small text-uppercase text-muted" style={{ letterSpacing: '1px' }}>Product Name</Form.Label>
                <Form.Control 
                  type="text" 
                  value={adminFormData.name}
                  onChange={(e) => setAdminFormData({...adminFormData, name: e.target.value})}
                  required 
                  className="rounded-3 py-2 bg-light border-0"
                />
              </Form.Group>
            </div>

            <div className="row">
              {/* CATEGORY */}
              <Form.Group className="col-md-6 mb-3">
                <Form.Label className="fw-700 small text-uppercase text-muted" style={{ letterSpacing: '1px' }}>Category</Form.Label>
                <Form.Control 
                  type="text" 
                  value={adminFormData.category}
                  onChange={(e) => setAdminFormData({...adminFormData, category: e.target.value})}
                  className="rounded-3 py-2 bg-light border-0"
                />
              </Form.Group>

              {/* PRICE */}
              <Form.Group className="col-md-6 mb-3">
                <Form.Label className="fw-700 small text-uppercase text-muted" style={{ letterSpacing: '1px' }}>Price (€)</Form.Label>
                <Form.Control 
                  type="number" 
                  value={adminFormData.price}
                  onChange={(e) => setAdminFormData({...adminFormData, price: e.target.value})}
                  required 
                  className="rounded-3 py-2 bg-light border-0"
                />
              </Form.Group>
            </div>

            <div className="row">
              {/* LOCATION */}
              <Form.Group className="col-md-6 mb-3">
                <Form.Label className="fw-700 small text-uppercase text-muted" style={{ letterSpacing: '1px' }}>Location</Form.Label>
                <Form.Control 
                  type="text" 
                  value={adminFormData.location}
                  onChange={(e) => setAdminFormData({...adminFormData, location: e.target.value})}
                  className="rounded-3 py-2 bg-light border-0"
                />
              </Form.Group>
              
              {/* STATUS */}
              <Form.Group className="col-md-6 mb-3">
                <Form.Label className="fw-700 small text-uppercase text-muted" style={{ letterSpacing: '1px' }}>Status</Form.Label>
                <Form.Select 
                  value={adminFormData.status}
                  onChange={(e) => setAdminFormData({...adminFormData, status: e.target.value})}
                  className="rounded-3 py-2 bg-light border-0"
                >
                  <option value="Active">Active</option>
                  <option value="Hidden">Hidden</option>
                  <option value="Banned">Banned</option>
                </Form.Select>
              </Form.Group>
            </div>

            {/* DESCRIPTION */}
            <Form.Group className="mb-4">
              <Form.Label className="fw-700 small text-uppercase text-muted" style={{ letterSpacing: '1px' }}>Description</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={4} 
                value={adminFormData.description}
                onChange={(e) => setAdminFormData({...adminFormData, description: e.target.value})}
                className="rounded-3 py-2 bg-light border-0"
              />
            </Form.Group>

            {/* IMAGE */}
            <Form.Group className="mb-4">
              <Form.Label className="fw-700 small text-uppercase text-muted" style={{ letterSpacing: '1px' }}>Image</Form.Label>
              <Form.Control 
                type="file" 
                onChange={(e: any) => setSelectedFile(e.target.files[0])}
                className="rounded-3 border"
              />
            </Form.Group>

            {/* BUTTONS */}
            <div className="d-flex justify-content-end gap-3 mt-4">
              <Button 
                variant="light" 
                onClick={() => {
                  setShowAddModal(false);
                  setIsEditingProduct(false);
                  setSelectedProduct(null);
                }} 
                className="rounded-pill px-4 fw-700"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="dark" 
                className="rounded-pill px-4 fw-700" 
                disabled={isPending}
                style={{ backgroundColor: '#1e293b' }}
              >
                {isPending ? (isEditingProduct ? 'Updating...' : 'Creating...') : (isEditingProduct ? 'Update Product' : 'Create Product')}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

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