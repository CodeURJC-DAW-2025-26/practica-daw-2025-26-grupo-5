import { useState, useEffect } from 'react';
import { redirect } from 'react-router';
import { Container, Row, Col, Card, Table, Button, Image, Stack, Alert, Modal, Form } from 'react-bootstrap';
import { getAdminProducts, deleteProduct, createProduct, updateProduct, getAdminUsers } from '~/services/admin-service';
import type ProductDTO from '~/dto/ProductDTO';
import type UserDTO from '~/dto/UserDTO';
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
    '#7c3aed': '#f3e8ff',
    '#ea580c': '#fef3c7',
    '#059669': '#ecfdf5',
    '#0369a1': '#e0f2fe',
  };
  return map[color] || '#f8fafc';
};

export async function clientLoader() {
  try {
    const data = await getAdminProducts(0, 1000);
    return data || {};
  } catch (error) {
    throw redirect('/login');
  }
}

export default function AdminInventory({ loaderData }: { readonly loaderData: any }) {
  const pagedData = loaderData as PagedResponse<ProductDTO>;
  const products = pagedData.content || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Individual form field states for product modal
  const [productSellerId, setProductSellerId] = useState('');
  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productLocation, setProductLocation] = useState('');
  const [productStatus, setProductStatus] = useState('Active');
  const [productDescription, setProductDescription] = useState('');

  const [rowData, setRowData] = useState<ProductDTO[]>(products);
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductDTO | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    getAdminUsers(0, 1000).then(data => { if (data?.content) setUsers(data.content); });
  }, []);

  useEffect(() => {
    setRowData(pagedData.content || []);
    setCurrentPage(0);
  }, [pagedData.content]);

  const loadProducts = async (query = '') => {
    setIsSearching(true);
    try {
      const data = await getAdminProducts(0, 1000, query);
      setRowData(data.content || []);
      setCurrentPage(0);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await loadProducts(searchTerm);
  };

  const handleClearSearch = async () => {
    setSearchTerm('');
    await loadProducts('');
  };

  const handleAddProduct = () => {
    setFormError(null);
    setIsEditingProduct(false);
    setSelectedFile(null);
    setProductName('');
    setProductCategory('');
    setProductPrice('');
    setProductLocation('');
    setProductDescription('');
    setProductStatus('Active');
    setProductSellerId('');
    setShowAddModal(true);
  };

  const handleEditProduct = (product: ProductDTO) => {
    setFormError(null);
    setIsEditingProduct(true);
    setSelectedProduct(product);
    setSelectedFile(null);
    setProductSellerId(String(product.seller?.id || ''));
    setProductName(product.name);
    setProductCategory(product.category);
    setProductPrice(String(product.price));
    setProductLocation(product.location);
    setProductDescription(product.description);
    setProductStatus(product.status);
    setShowAddModal(true);
  };

  const handleProductFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setIsLoading(true);
    
    try {
      const formDataObj = new FormData();
      formDataObj.append('sellerId', productSellerId);
      formDataObj.append('name', productName);
      formDataObj.append('category', productCategory);
      formDataObj.append('price', productPrice);
      formDataObj.append('location', productLocation);
      formDataObj.append('description', productDescription);
      formDataObj.append('status', productStatus);
      if (selectedFile) formDataObj.append('image', selectedFile);

      if (isEditingProduct && selectedProduct) {
        await updateProduct(selectedProduct.id, formDataObj);
      } else {
        await createProduct(formDataObj);
      }

      setShowAddModal(false);
      setSelectedProduct(null);
      await loadProducts(searchTerm);
    } catch (error: any) {
      const errorMsg = error.message || 'Action failed. Please try again.';
      setFormError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (product: ProductDTO) => { setSelectedProduct(product); setShowDeleteModal(true); };

  const confirmDelete = async () => {
    if (!selectedProduct) return;
    setIsLoading(true);
    try {
      await deleteProduct(selectedProduct.id);
      setShowDeleteModal(false);
      setSelectedProduct(null);
      await loadProducts(searchTerm);
    } catch (error) {
      alert('Failed to delete product.');
    } finally { setIsLoading(false); }
  };

  const handleBanProduct = async (product: ProductDTO) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', product.name);
      formData.append('category', product.category);
      formData.append('price', String(product.price));
      formData.append('location', product.location);
      formData.append('description', product.description);
      formData.append('status', 'Banned');
      formData.append('sellerId', String(product.seller?.id || ''));
      await updateProduct(product.id, formData);
      await loadProducts(searchTerm);
    } catch (error) {
      alert('Failed to ban product.');
    } finally { setIsLoading(false); }
  };

  const totalProducts = rowData.length;
  const activeListings = rowData.filter(p => p.status?.toLowerCase() === "active" && !p.seller?.banned).length;
  const averagePrice = rowData.length > 0 ? rowData.reduce((sum, p) => sum + (p.price || 0), 0) / rowData.length : 0;
  const totalValue = rowData.reduce((sum, p) => sum + (p.price || 0), 0);

  const paginatedData = rowData.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);
  const totalPages = Math.ceil(rowData.length / itemsPerPage);

  return (
    <>
      <AdminHeader title="Global Inventory" subtitle="Audit, edit, or remove any listing on the platform." />

      <Card className="clay-card border-0 p-3 mb-4">
        <Card.Body>
          <Form onSubmit={handleSearchSubmit}>
            <Row className="g-3 align-items-end">
              <Col md={9}>
                <Form.Label className="fw-700 small text-uppercase text-muted">Search products by name or category</Form.Label>
                <Form.Control
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Type a product name or category..."
                  className="rounded-3 py-2 bg-light border-0"
                />
              </Col>
              <Col md={3}>
                <Stack direction="horizontal" gap={2} className="justify-content-end">
                  <Button type="submit" variant="dark" className="rounded-pill px-4 fw-700" disabled={isSearching}>
                    {isSearching ? 'Searching...' : 'Search'}
                  </Button>
                  <Button type="button" variant="light" className="rounded-pill px-4 fw-700" onClick={handleClearSearch} disabled={isSearching}>
                    Clear
                  </Button>
                </Stack>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <Row className="g-3 mb-4">
        <Col xs={12} sm={6} lg={3}>
          <KPICard label="Total Products" value={totalProducts} color="#7c3aed" icon="fa-box" bg={getKPIBg('#7c3aed')} />
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <KPICard label="Active Listings" value={activeListings} color="#ea580c" icon="fa-check-circle" bg={getKPIBg('#ea580c')} />
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <KPICard label="Average Price" value={`€${averagePrice.toFixed(0)}`} color="#059669" icon="fa-euro-sign" bg={getKPIBg('#059669')} />
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <KPICard label="Total Value" value={`€${totalValue.toFixed(0)}`} color="#0369a1" icon="fa-chart-line" bg={getKPIBg('#0369a1')} />
        </Col>
      </Row>

      <Card className="clay-card border-0 p-3">
        <Card.Body>
          <Stack direction="horizontal" className="justify-content-end mb-4">
            <Button variant="primary" className="fw-700 rounded-pill px-4" style={{ backgroundColor: '#7c3aed', border: 'none' }} onClick={handleAddProduct}>
              <i className="fa-solid fa-plus me-2" /> Add Product
            </Button>
          </Stack>

          <div style={{ overflowX: 'auto' }}>
            <Table hover responsive className="table-admin mb-0 align-middle">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>PRODUCT</th>
                  <th>CATEGORY</th>
                  <th>PRICE</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((product) => (
                    <tr key={product.id}>
                      <td className="text-muted small fw-700">#{product.id}</td>
                      <td>
                        <Stack direction="horizontal" gap={2} className="align-items-center">
                          <Image src={`/api/v1/products/${product.id}/image?t=${Date.now()}`} alt={product.name} width={36} height={36} rounded style={{ objectFit: 'cover', backgroundColor: '#e5e7eb' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          <span className="fw-700 small mb-0">{product.name}</span>
                        </Stack>
                      </td>
                      <td><span className="badge-cat cat-tech">{product.category}</span></td>
                      <td className="fw-800 text-success">€{product.price?.toFixed(2)}</td>
                      <td>
                         <span className={`badge-status ${product.status === 'Banned' ? 'status-banned' : 'status-active'}`}>
                            {product.status?.toUpperCase()}
                         </span>
                      </td>
                      <td>
                        <Stack direction="horizontal" gap={2}>
                          <Button variant="light" size="sm" className="btn-action-admin btn-edit" onClick={() => handleEditProduct(product)}><i className="fa-solid fa-edit" /></Button>
                          <Button variant="light" size="sm" className="btn-action-admin btn-ban" onClick={() => handleBanProduct(product)} disabled={product.status === 'Banned'}><i className="fa-solid fa-lock" /></Button>
                          <Button variant="light" size="sm" className="btn-action-admin btn-delete" onClick={() => handleDeleteClick(product)}><i className="fa-solid fa-trash" /></Button>
                        </Stack>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} className="text-center py-4 text-muted">No products found</td></tr>
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

      {/* Edit/Add Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg" centered contentClassName="bg-white border-0 shadow-lg clay-card">
         <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-800 text-dark">{isEditingProduct ? 'Edit Product' : 'Create Product For Any User'}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {formError && <Alert variant="danger">{formError}</Alert>}
          <Form onSubmit={handleProductFormSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-700 small text-uppercase text-muted">Seller</Form.Label>
                  <Form.Select required name="sellerId" value={productSellerId} onChange={(e) => setProductSellerId(e.target.value)} className="rounded-3 py-2 bg-light border-0" disabled={isLoading}>
                    <option value="">Select user</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name || u.email}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-700 small text-uppercase text-muted">Product Name</Form.Label>
                  <Form.Control type="text" name="name" value={productName} onChange={(e) => setProductName(e.target.value)} required className="rounded-3 py-2 bg-light border-0" disabled={isLoading} />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-700 small text-uppercase text-muted">Category</Form.Label>
                  <Form.Control type="text" name="category" value={productCategory} onChange={(e) => setProductCategory(e.target.value)} className="rounded-3 py-2 bg-light border-0" disabled={isLoading} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-700 small text-uppercase text-muted">Price (€)</Form.Label>
                  <Form.Control type="number" name="price" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} required className="rounded-3 py-2 bg-light border-0" disabled={isLoading} />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-700 small text-uppercase text-muted">Location</Form.Label>
                  <Form.Control type="text" name="location" value={productLocation} onChange={(e) => setProductLocation(e.target.value)} className="rounded-3 py-2 bg-light border-0" disabled={isLoading} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-700 small text-uppercase text-muted">Status</Form.Label>
                  <Form.Select name="status" value={productStatus} onChange={(e) => setProductStatus(e.target.value)} className="rounded-3 py-2 bg-light border-0" disabled={isLoading}>
                    <option value="Active">Active</option>
                    <option value="Hidden">Hidden</option>
                    <option value="Banned">Banned</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-4">
              <Form.Label className="fw-700 small text-uppercase text-muted">Description</Form.Label>
              <Form.Control as="textarea" name="description" rows={4} value={productDescription} onChange={(e) => setProductDescription(e.target.value)} className="rounded-3 py-2 bg-light border-0" disabled={isLoading} />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="fw-700 small text-uppercase text-muted">Image</Form.Label>
              <Form.Control type="file" name="image" onChange={(e: any) => setSelectedFile(e.target.files[0])} className="rounded-3 bg-light border-0" disabled={isLoading} />
            </Form.Group>
            <Stack direction="horizontal" gap={3} className="justify-content-end mt-4">
              <Button variant="light" className="rounded-pill px-4 fw-700" onClick={() => setShowAddModal(false)} disabled={isLoading}>Cancel</Button>
              <Button type="submit" variant="dark" className="rounded-pill px-4 fw-700" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Product'}</Button>
            </Stack>
          </Form>
        </Modal.Body>
      </Modal>

      <ConfirmModal
        show={showDeleteModal} title="Delete Product?" message={`Delete "${selectedProduct?.name}"? Cannot be undone.`} confirmText="Delete" cancelText="Cancel" variant="danger" isLoading={isLoading} onConfirm={confirmDelete} onCancel={() => setShowDeleteModal(false)}
      />
    </>
  );
}

export function ErrorBoundary({ error }: { readonly error: Error }) {
  return (
    <Container className="mt-5">
      <Alert variant="danger" className="clay-card">
        <Alert.Heading className="fw-800">Error Loading Inventory!</Alert.Heading>
        <p className="fw-600">{error instanceof Error ? error.message : 'An unexpected error occurred'}</p>
        <Button variant="outline-danger" className="fw-700 rounded-pill" onClick={() => (globalThis.location.href = '/')}>Back to home</Button>
      </Alert>
    </Container>
  );
}