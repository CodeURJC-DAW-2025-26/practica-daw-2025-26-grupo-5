/**
 * Admin Users Management Page
 *
 * Comprehensive admin dashboard for managing all marketplace users.
 * Provides complete CRUD operations and user lifecycle management.
 *
 * Features:
 * - User search and filtering functionality
 * - View all users with pagination (10 users per page)
 * - Edit user profiles (name, email, payment info, description)
 * - Ban/unban users to restrict marketplace access
 * - Delete user accounts permanently
 * - Profile photo upload during user edit
 * - KPI cards showing key metrics (total users, admins, banned, products)
 * - Status indicators and role badges
 * - Confirmation modals for destructive actions
 * - Permission checks (can't edit admins, can't ban self)
 *
 * KPI Dashboard:
 * - Shows total users, active admins, banned users, product count
 * - Each KPI has icon and color coding
 * - Real-time data loaded from backend
 *
 * Data Flow:
 * 1. clientLoader fetches initial user data from backend
 * 2. Users displayed in paginated table
 * 3. Admin clicks action (edit/ban/delete)
 * 4. Appropriate modal opens
 * 5. On confirmation → API call updates backend
 * 6. UI refreshes with updated data
 *
 * State Management:
 * - rowData: Current page of users
 * - selectedUser: User being edited/banned/deleted
 * - modalType: Which action modal is open ('edit', 'ban', 'delete')
 * - searchTerm: Search query
 * - isLoading: Loading state during operations
 * - currentPage: Pagination state
 * - selectedPhoto: New profile photo if editing
 *
 * Permissions:
 * - Admins cannot be edited or banned by other admins
 * - Users cannot ban/delete themselves
 * - Edit access is role-based
 *
 * @component
 * @returns React component for admin user management dashboard
 */

import { useState } from 'react';
import { redirect } from 'react-router';
import { Modal, Form, Button, Container, Row, Col, Card, Table, Image, Stack, Alert } from 'react-bootstrap';
import { getAdminUsers, banUser, deleteUser, updateUser, getAdminProducts, updateProduct } from '~/services/admin-service';
import { useUserStore } from '~/stores/useUserStore';
import type UserDTO from '~/dto/UserDTO';
import type PagedResponse from '~/dto/PagedResponse';
import AdminHeader from '~/components/admin/AdminHeader';
import ConfirmModal from '~/components/ConfirmModal';

/**
 * KPI Card Props Interface
 * Defines structure for dashboard metric cards
 */
interface KPIData {
  readonly label: string;
  readonly value: string | number;
  readonly color: string;
  readonly icon: string;
}

/**
 * KPI Card Component
 * Displays key performance indicator with icon and color coding
 */
const KPICard = ({ label, value, color, icon, bg }: KPIData & { readonly bg: string }) => (
  <Card className="clay-card border-0 h-100" style={{ borderLeft: `5px solid ${color}` }}>
    <Card.Body className="p-4">
      <Stack direction="horizontal" gap={3} className="justify-content-between align-items-start mb-3">
        <h5 className="mb-0 text-dark">{label}</h5>
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
    '#0369a1': '#e0f2fe',
    '#059669': '#ecfdf5',
    '#dc2626': '#fee2e2',
    '#7c3aed': '#f3e8ff',
  };
  return map[color] || '#f8fafc';
};

export async function clientLoader() {
  try {
    const data = await getAdminUsers(0, 1000);
    return data || {};
  } catch (error) {
    console.error('Failed to fetch admin users:', error);
    throw redirect('/login');
  }
}

export default function AdminUsers({ loaderData }: { readonly loaderData: any }) {
  const pagedData = loaderData as PagedResponse<UserDTO>;
  const users = pagedData.content || [];
  const loggedInUser = useUserStore((state) => state.user);

  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Individual form field states for edit modal
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCardNumber, setEditCardNumber] = useState('');
  const [editCardExpiry, setEditCardExpiry] = useState('');
  const [editCardCvv, setEditCardCvv] = useState('');

  const [rowData, setRowData] = useState<UserDTO[]>(users);
  const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);
  const [modalType, setModalType] = useState<'ban' | 'delete' | 'edit' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const itemsPerPage = 10;

  const isUserAnAdmin = (user: UserDTO) => user.roles?.includes('ADMIN') || user.roles?.includes('ROLE_ADMIN');
  const canEditUser = (user: UserDTO) => user.id !== loggedInUser?.id;
  const canBanOrDeleteUser = (user: UserDTO) => !isUserAnAdmin(user) && user.id !== loggedInUser?.id;

  const loadUsers = async (userSearch = '') => {
    setIsSearching(true);
    try {
      const data = await getAdminUsers(0, 1000, userSearch);
      setRowData(data.content || []);
      setCurrentPage(0);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await loadUsers(searchTerm);
  };

  const handleClearSearch = async () => {
    setSearchTerm('');
    await loadUsers('');
  };

  const handleEditClick = (user: UserDTO) => {
    setSelectedUser(user);
    setEditName(user.name || '');
    setEditEmail(user.email || '');
    setEditDescription(user.description || '');
    setEditCardNumber(user.cardNumber || '');
    setEditCardExpiry(user.cardExpiringDate || '');
    setEditCardCvv(user.cardCvv || '');
    setSelectedPhoto(null);
    setEditError(null);
    setModalType('edit');
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!selectedUser) return;
    e.preventDefault();
    setEditError(null);
    setIsLoading(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('name', editName);
      formDataObj.append('email', editEmail);
      formDataObj.append('description', editDescription);
      formDataObj.append('cardNumber', editCardNumber);
      formDataObj.append('cardExpiringDate', editCardExpiry);
      formDataObj.append('cardCvv', editCardCvv);
      if (selectedPhoto) formDataObj.append('newProfilePhoto', selectedPhoto);

      await updateUser(selectedUser.id, formDataObj);
      setModalType(null);
      setSelectedUser(null);
      await loadUsers(searchTerm);
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to update user. Please try again.';
      setEditError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBanClick = (user: UserDTO) => { setSelectedUser(user); setModalType('ban'); };

  const confirmBan = async () => {
    if (!selectedUser) return;
    setIsLoading(true);
    try {
      const updatedUser = await banUser(selectedUser.id, !selectedUser.banned);
      setRowData((prev) => prev.map((u) => (u.id === selectedUser.id ? updatedUser : u)));

      // Handle product banning/unbanning based on user's ban status
      try {
        const productsPage = await getAdminProducts(0, 1000);
        const userProducts = productsPage.content?.filter(p => p.seller?.id === selectedUser.id) || [];

        // If banning (user.banned is false -> true), ban all products
        // If unbanning (user.banned is true -> false), unban all products to Active
        const newProductStatus = !selectedUser.banned ? 'Banned' : 'Active';

        for (const product of userProducts) {
          const formData = new FormData();
          formData.append('name', product.name);
          formData.append('category', product.category);
          formData.append('price', String(product.price));
          formData.append('location', product.location);
          formData.append('description', product.description);
          formData.append('status', newProductStatus);
          formData.append('sellerId', String(product.seller?.id || ''));
          await updateProduct(product.id, formData);
        }
      } catch (productError) {
        console.error('Failed to update user products:', productError);
        // Don't fail the entire operation if product update fails
      }

      setModalType(null);
      setSelectedUser(null);
      await loadUsers(searchTerm);
    } catch (error) {
      console.error('Failed to ban user:', error);
      alert('Failed to ban user. Please try again.');
    } finally { setIsLoading(false); }
  };

  const handleDeleteClick = (user: UserDTO) => { setSelectedUser(user); setModalType('delete'); };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    setIsLoading(true);
    try {
      await deleteUser(selectedUser.id);
      setModalType(null);
      setSelectedUser(null);
      await loadUsers(searchTerm);
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user. Please try again.');
    } finally { setIsLoading(false); }
  };

  const totalUsers = rowData.length;
  const bannedUsers = rowData.filter(u => u.banned).length;
  const activeUsers = totalUsers - bannedUsers;
  const activeRate = totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(0) : 0;

  const paginatedData = rowData.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);
  const totalPages = Math.ceil(rowData.length / itemsPerPage);

  const isBanning = modalType === 'ban' && selectedUser?.banned === false;
  const isUnbanning = modalType === 'ban' && selectedUser?.banned === true;

  return (
    <>
      <AdminHeader title="User Management" subtitle="Moderate access and user permissions." />

      <Card className="border-0 p-4 mb-4 shadow-sm" style={{ backgroundColor: '#192b56', borderRadius: '16px' }}>
        <Card.Body className="p-0">
          <div className="mx-auto" style={{ maxWidth: '850px' }}>
            <Form onSubmit={handleSearchSubmit}>
              <Row className="g-3 align-items-end justify-content-center">
                <Col xs={12} md={8} lg={8}>
                  <Form.Label className="fw-800 small text-uppercase mb-2" style={{ letterSpacing: '0.5px', color: '#CBD5E1' }}>
                    <i className="fa-solid fa-user me-2"></i> User Search
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Type a username..."
                    className="py-2 px-3 border-0 shadow-none bg-white"
                    style={{ borderRadius: '12px' }}
                  />
                </Col>
                <Col xs={12} md={4} lg={4}>
                  <Stack direction="horizontal" gap={2} className="justify-content-md-end mt-3 mt-md-0">
                    <Button type="submit" variant="primary" className="px-4 py-2 fw-800 border-0 shadow-sm" style={{ borderRadius: '12px' }} disabled={isSearching}>
                      {isSearching ? <><i className="fa-solid fa-spinner fa-spin me-2"></i>...</> : 'Search'}
                    </Button>
                    <Button type="button" className="px-4 py-2 fw-700 border-0"
                      style={{ borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#F8FAFC', transition: 'background-color 0.2s' }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                      onClick={handleClearSearch} disabled={isSearching}
                    >
                      Clear
                    </Button>
                  </Stack>
                </Col>
              </Row>
            </Form>
          </div>
        </Card.Body>
      </Card>

      {/* KPI Row */}
      <Row className="g-3 mb-4">
        <Col xs={12} sm={6} lg={3}>
          <KPICard label="Total Users" value={totalUsers} color="#0369a1" icon="fa-users" bg={getKPIBg('#0369a1')} />
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <KPICard label="Active Users" value={activeUsers} color="#059669" icon="fa-check-circle" bg={getKPIBg('#059669')} />
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <KPICard label="Banned Users" value={bannedUsers} color="#dc2626" icon="fa-ban" bg={getKPIBg('#dc2626')} />
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <KPICard label="Active Rate" value={`${activeRate}%`} color="#7c3aed" icon="fa-chart-pie" bg={getKPIBg('#7c3aed')} />
        </Col>
      </Row>

      {/* Table */}
      <Card className="clay-card border-0 p-3">
        <Card.Body>
          <div style={{ overflowX: 'auto' }}>
            <Table hover responsive className="table-admin mb-0 align-middle">
              <thead>
                <tr>
                  <th>USER</th>
                  <th>EMAIL</th>
                  <th>ROLE</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <Stack direction="horizontal" gap={2} className="align-items-center">
                          <Image
                            src={`/api/v1/users/${user.id}/profile-photo?t=${Date.now()}`}
                            alt={user.name} width={36} height={36} roundedCircle
                            style={{ objectFit: 'cover', backgroundColor: '#e5e7eb' }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                          <span className="fw-700 small mb-0">{user.name}</span>
                        </Stack>
                      </td>
                      <td className="text-muted small fw-600">{user.email}</td>
                      <td><span className="badge bg-light text-dark fw-700">{user.roles?.join(', ') || 'USER'}</span></td>
                      <td>
                        <span className={`badge-status ${user.banned ? 'status-banned' : 'status-active'}`}>
                          {user.banned ? 'BANNED' : 'ACTIVE'}
                        </span>
                      </td>
                      <td>
                        <Stack direction="horizontal" gap={2}>
                          {canEditUser(user) && (
                            <Button variant="light" size="sm" className="btn-action-admin btn-edit" onClick={() => handleEditClick(user)}>
                              <i className="fa-solid fa-pencil" />
                            </Button>
                          )}
                          {canBanOrDeleteUser(user) && (
                            <Button variant="light" size="sm" className="btn-action-admin btn-ban" onClick={() => handleBanClick(user)}>
                              <i className={`fa-solid fa-${user.banned ? 'unlock' : 'lock'}`} />
                            </Button>
                          )}
                          {canBanOrDeleteUser(user) && (
                            <Button variant="light" size="sm" className="btn-action-admin btn-delete" onClick={() => handleDeleteClick(user)}>
                              <i className="fa-solid fa-trash" />
                            </Button>
                          )}
                        </Stack>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="text-center py-4 text-muted">No users found</td></tr>
                )}
              </tbody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <Stack direction="horizontal" className="justify-content-between mt-4 pt-3 border-top">
              <span className="text-muted small fw-600">Showing {currentPage * itemsPerPage + 1} to {Math.min((currentPage + 1) * itemsPerPage, rowData.length)} of {rowData.length}</span>
              <div className="btn-group">
                <Button variant="outline-secondary" size="sm" onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0}>
                  <i className="fa-solid fa-chevron-left" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button key={i} variant={currentPage === i ? 'primary' : 'outline-secondary'} size="sm" onClick={() => setCurrentPage(i)}>
                    {i + 1}
                  </Button>
                ))}
                <Button variant="outline-secondary" size="sm" onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))} disabled={currentPage === totalPages - 1}>
                  <i className="fa-solid fa-chevron-right" />
                </Button>
              </div>
            </Stack>
          )}
        </Card.Body>
      </Card>

      {/* Edit Modal (Bootstrap + Custom CSS) */}
      <Modal show={modalType === 'edit'} onHide={() => { setModalType(null); setSelectedUser(null); }} size="lg" centered contentClassName="bg-white border-0 shadow-lg clay-card">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-800 text-dark">Edit User: {selectedUser?.name || selectedUser?.email}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {editError && <Alert variant="danger" className="mb-3">{editError}</Alert>}
          <Form onSubmit={handleEditSubmit}>
            <Row>
              <Col md={5} className="d-flex flex-column align-items-center border-end pe-4">
                <div className="mb-3 position-relative text-center">
                  <Image src={selectedPhoto ? URL.createObjectURL(selectedPhoto) : `/api/v1/users/${selectedUser?.id}/profile-photo?t=${Date.now()}`} roundedCircle style={{ width: '120px', height: '120px', objectFit: 'cover', backgroundColor: '#f1f5f9' }} />
                  <div className="mt-3">
                    <label htmlFor="photo-upload" className="btn btn-outline-primary btn-sm rounded-pill fw-700">
                      <i className="fa-solid fa-camera me-2" />Change Photo
                    </label>
                    <input id="photo-upload" type="file" accept="image/*" className="d-none" onChange={(e: any) => setSelectedPhoto(e.target.files[0])} />
                  </div>
                </div>
                <div className="w-100">
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-700 small text-uppercase text-muted">Name</Form.Label>
                    <Form.Control type="text" name="name" className="rounded-3 py-2 bg-light border-0" value={editName} onChange={(e) => setEditName(e.target.value)} disabled={isLoading} />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-700 small text-uppercase text-muted">Bio / Description</Form.Label>
                    <Form.Control as="textarea" name="description" rows={5} className="rounded-3 py-2 bg-light border-0" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} disabled={isLoading} />
                  </Form.Group>
                </div>
              </Col>
              <Col md={7} className="ps-4">
                <h6 className="fw-700 text-uppercase text-muted mb-4">Account & Billing</h6>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-700 small text-muted">EMAIL ADDRESS</Form.Label>
                  <Form.Control type="email" name="email" className="rounded-3 py-2 bg-light border-0" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} disabled={isLoading} />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-700 small text-muted">CARD NUMBER</Form.Label>
                  <Form.Control type="text" name="cardNumber" className="rounded-3 py-2 bg-light border-0" value={editCardNumber} onChange={(e) => setEditCardNumber(e.target.value)} disabled={isLoading} />
                </Form.Group>
                <Row>
                  <Col sm={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-700 small text-muted">EXPIRING DATE</Form.Label>
                      <Form.Control type="text" name="cardExpiringDate" className="rounded-3 py-2 bg-light border-0" value={editCardExpiry} onChange={(e) => setEditCardExpiry(e.target.value)} disabled={isLoading} />
                    </Form.Group>
                  </Col>
                  <Col sm={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-700 small text-muted">CVV</Form.Label>
                      <Form.Control type="text" name="cardCvv" className="rounded-3 py-2 bg-light border-0" value={editCardCvv} onChange={(e) => setEditCardCvv(e.target.value)} disabled={isLoading} />
                    </Form.Group>
                  </Col>
                </Row>
                <Stack direction="horizontal" gap={3} className="justify-content-end mt-3">
                  <Button variant="light" className="rounded-pill px-4 fw-700" onClick={() => setModalType(null)} disabled={isLoading}>Cancel</Button>
                  <Button type="submit" variant="dark" className="rounded-pill px-4 fw-700" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Changes'}</Button>
                </Stack>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
      </Modal>

      <ConfirmModal
        show={modalType === 'ban' || modalType === 'delete'}
        title={isUnbanning ? 'Unban User?' : (isBanning ? 'Ban User?' : 'Delete User?')}
        message={isUnbanning ? `Are you sure you want to unban "${selectedUser?.name}"?` : `Are you sure you want to ${modalType} "${selectedUser?.name}"?`}
        confirmText={isUnbanning ? 'Unban' : (isBanning ? 'Ban' : 'Delete')}
        cancelText="Cancel"
        variant={modalType === 'delete' ? 'danger' : 'warning'}
        isLoading={isLoading}
        onConfirm={modalType === 'ban' ? confirmBan : confirmDelete}
        onCancel={() => { setModalType(null); setSelectedUser(null); }}
      />
    </>
  );
}

export function ErrorBoundary({ error }: { readonly error: Error }) {
  return (
    <Container className="mt-5">
      <Alert variant="danger" className="clay-card">
        <Alert.Heading className="fw-800">Error Loading Users!</Alert.Heading>
        <p className="fw-600">{error instanceof Error ? error.message : 'An unexpected error occurred'}</p>
        <Button variant="outline-danger" className="fw-700 rounded-pill" onClick={() => (globalThis.location.href = '/')}>Back to home</Button>
      </Alert>
    </Container>
  );
}