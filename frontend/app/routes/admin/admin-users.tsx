import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { redirect, useRevalidator } from 'react-router';
import { getAdminUsers, banUser, deleteUser, updateUser } from '~/services/admin-service';
import { useUserStore } from '~/stores/useUserStore';
import type UserDTO from '~/dto/UserDTO';
import type PagedResponse from '~/dto/PagedResponse';
import AdminHeader from '~/components/admin/AdminHeader';
import ConfirmModal from '~/components/confirm-modal';
import { Modal, Form, Button, Container, Row, Col, Card, Table, Image, Stack, Alert } from 'react-bootstrap';

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
    '#0369a1': '#e0f2fe',
    '#059669': '#ecfdf5',
    '#dc2626': '#fee2e2',
    '#7c3aed': '#f3e8ff',
  };
  return map[color] || '#f8fafc';
};

interface UserEditFormData {
  name: string;
  email: string;
  description: string;
  cardNumber: string;
  cardExpiringDate: string;
  cardCvv: string;
}

export async function clientLoader() {
  try {
    const data = await getAdminUsers(0, 100);
    return data || {};
  } catch (error) {
    console.error('Failed to fetch admin users:', error);
    throw redirect('/login');
  }
}

export default function AdminUsers({ loaderData }: { readonly loaderData: any }) {
  const revalidator = useRevalidator();
  const pagedData = loaderData as PagedResponse<UserDTO>;
  const users = pagedData.content || [];
  const loggedInUser = useUserStore((state) => state.user);

  const { register, handleSubmit, reset } = useForm<UserEditFormData>({
    defaultValues: { name: '', email: '', description: '', cardNumber: '', cardExpiringDate: '', cardCvv: '' },
  });

  const [rowData, setRowData] = useState<UserDTO[]>(users);
  const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);
  const [modalType, setModalType] = useState<'ban' | 'delete' | 'edit' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const itemsPerPage = 10;

  const isUserAnAdmin = (user: UserDTO) => user.roles?.includes('ADMIN') || user.roles?.includes('ROLE_ADMIN');
  const canEditUser = (user: UserDTO) => user.id !== loggedInUser?.id;
  const canBanOrDeleteUser = (user: UserDTO) => !isUserAnAdmin(user) && user.id !== loggedInUser?.id;

  const handleEditClick = (user: UserDTO) => {
    setSelectedUser(user);
    reset({
      name: user.name || '', email: user.email || '', description: user.description || '',
      cardNumber: user.cardNumber || '', cardExpiringDate: user.cardExpiringDate || '', cardCvv: user.cardCvv || ''
    });
    setSelectedPhoto(null);
    setModalType('edit');
  };

  const onEditSubmit = async (formData: UserEditFormData) => {
    if (!selectedUser) return;
    setIsLoading(true);
    try {
      const formDataObj = new FormData();
      Object.entries(formData).forEach(([key, value]) => formDataObj.append(key, value));
      if (selectedPhoto) formDataObj.append('newProfilePhoto', selectedPhoto);

      const updatedUser = await updateUser(selectedUser.id, formDataObj as any);
      setRowData((prev) => prev.map((u) => (u.id === selectedUser.id ? updatedUser : u)));
      setModalType(null);
      setSelectedUser(null);
      revalidator.revalidate();
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Failed to update user. Please try again.');
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
      setModalType(null); setSelectedUser(null); revalidator.revalidate();
    } catch (error) {
      console.error('Failed to ban user:', error); alert('Failed to ban user. Please try again.');
    } finally { setIsLoading(false); }
  };

  const handleDeleteClick = (user: UserDTO) => { setSelectedUser(user); setModalType('delete'); };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    setIsLoading(true);
    try {
      await deleteUser(selectedUser.id);
      setRowData((prev) => prev.filter((u) => u.id !== selectedUser.id));
      setModalType(null); setSelectedUser(null); revalidator.revalidate();
    } catch (error) {
      console.error('Failed to delete user:', error); alert('Failed to delete user. Please try again.');
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
          <Form onSubmit={handleSubmit(onEditSubmit)}>
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
                    <Form.Control type="text" className="rounded-3 py-2 bg-light border-0" {...register('name')} disabled={isLoading} />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-700 small text-uppercase text-muted">Bio / Description</Form.Label>
                    <Form.Control as="textarea" rows={5} className="rounded-3 py-2 bg-light border-0" {...register('description')} disabled={isLoading} />
                  </Form.Group>
                </div>
              </Col>
              <Col md={7} className="ps-4">
                <h6 className="fw-700 text-uppercase text-muted mb-4">Account & Billing</h6>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-700 small text-muted">EMAIL ADDRESS</Form.Label>
                  <Form.Control type="email" className="rounded-3 py-2 bg-light border-0" {...register('email')} disabled={isLoading} />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-700 small text-muted">CARD NUMBER</Form.Label>
                  <Form.Control type="text" className="rounded-3 py-2 bg-light border-0" {...register('cardNumber')} disabled={isLoading} />
                </Form.Group>
                <Row>
                  <Col sm={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-700 small text-muted">EXPIRING DATE</Form.Label>
                      <Form.Control type="text" className="rounded-3 py-2 bg-light border-0" {...register('cardExpiringDate')} disabled={isLoading} />
                    </Form.Group>
                  </Col>
                  <Col sm={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-700 small text-muted">CVV</Form.Label>
                      <Form.Control type="text" className="rounded-3 py-2 bg-light border-0" {...register('cardCvv')} disabled={isLoading} />
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