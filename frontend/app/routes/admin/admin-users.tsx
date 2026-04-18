import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { redirect, useRevalidator } from 'react-router';
import { getAdminUsers, banUser, deleteUser, updateUser } from '~/services/admin-service';
import { useUserStore } from '~/stores/useUserStore';
import type UserDTO from '~/dto/UserDTO';
import type PagedResponse from '~/dto/PagedResponse';
import AdminHeader from '~/components/admin/AdminHeader';
import ConfirmModal from '~/components/confirm-modal';
import { Modal, Form, Button } from 'react-bootstrap';

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
    defaultValues: {
      name: '',
      email: '',
      description: '',
      cardNumber: '',
      cardExpiringDate: '',
      cardCvv: '',
    },
  });

  const [rowData, setRowData] = useState<UserDTO[]>(users);
  const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);
  const [modalType, setModalType] = useState<'ban' | 'delete' | 'edit' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const itemsPerPage = 10;

  // Check if a user is admin
  const isUserAnAdmin = (user: UserDTO) => user.roles?.includes('ADMIN') || user.roles?.includes('ROLE_ADMIN');

  // Check if user can perform action
  const canEditUser = (user: UserDTO) => user.id !== loggedInUser?.id;
  const canBanOrDeleteUser = (user: UserDTO) => !isUserAnAdmin(user) && user.id !== loggedInUser?.id;

  const handleEditClick = (user: UserDTO) => {
    setSelectedUser(user);
    reset({
      name: user.name || '',
      email: user.email || '',
      description: user.description || '',
      cardNumber: user.cardNumber || '',
      cardExpiringDate: user.cardExpiringDate || '',
      cardCvv: user.cardCvv || '',
    });
    setSelectedPhoto(null);
    setModalType('edit');
  };

  const onEditSubmit = async (formData: UserEditFormData) => {
    if (!selectedUser) return;
    setIsLoading(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('name', formData.name);
      formDataObj.append('email', formData.email);
      formDataObj.append('description', formData.description);
      formDataObj.append('cardNumber', formData.cardNumber);
      formDataObj.append('cardExpiringDate', formData.cardExpiringDate);
      formDataObj.append('cardCvv', formData.cardCvv);
      
      if (selectedPhoto) {
        formDataObj.append('newProfilePhoto', selectedPhoto);
      }

      const updatedUser = await updateUser(selectedUser.id, formDataObj as any);
      
      setRowData((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? updatedUser : u))
      );
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

  const handleBanClick = (user: UserDTO) => {
    setSelectedUser(user);
    setModalType('ban');
  };

  const confirmBan = async () => {
    if (!selectedUser) return;
    setIsLoading(true);
    try {
      const isBanned = selectedUser.banned;
      const updatedUser = await banUser(selectedUser.id, !isBanned);
      setRowData((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? updatedUser : u))
      );
      setModalType(null);
      setSelectedUser(null);
      revalidator.revalidate();
    } catch (error) {
      console.error('Failed to ban user:', error);
      alert('Failed to ban user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (user: UserDTO) => {
    setSelectedUser(user);
    setModalType('delete');
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    setIsLoading(true);
    try {
      await deleteUser(selectedUser.id);
      setRowData((prev) => prev.filter((u) => u.id !== selectedUser.id));
      setModalType(null);
      setSelectedUser(null);
      revalidator.revalidate();
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const totalUsers = rowData.length;
  const bannedUsers = rowData.filter(u => u.banned).length;
  const activeUsers = totalUsers - bannedUsers;
  const activeRate = totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(0) : 0;

  const paginatedData = rowData.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );
  const totalPages = Math.ceil(rowData.length / itemsPerPage);

  // Compute modal titles and messages
  const isBanning = modalType === 'ban' && selectedUser?.banned === false;
  const isUnbanning = modalType === 'ban' && selectedUser?.banned === true;

  let modalTitle = 'Delete User?';
  if (isUnbanning) {
    modalTitle = 'Unban User?';
  } else if (isBanning) {
    modalTitle = 'Ban User?';
  }

  let modalMessage = `Are you sure you want to permanently delete "${selectedUser?.name}"? This action cannot be undone.`;
  if (isUnbanning) {
    modalMessage = `Are you sure you want to unban "${selectedUser?.name}"? They will regain access.`;
  } else if (isBanning) {
    modalMessage = `Are you sure you want to ban "${selectedUser?.name}"? They will be unable to access the platform.`;
  }

  let confirmText = 'Delete';
  if (isUnbanning) {
    confirmText = 'Unban';
  } else if (isBanning) {
    confirmText = 'Ban';
  }

  const modalVariant = modalType === 'delete' ? 'danger' : 'warning';

  return (
    <>
      <AdminHeader
        title="User Management"
        subtitle="Moderate access and user permissions."
      />

      <div className="container-fluid">
        {/* KPI Row */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="clay-card p-4 text-center shadow-sm">
              <i className="fa-solid fa-users" style={{ fontSize: '2rem', color: '#0369a1', marginBottom: '8px', display: 'block' }} />
              <p className="text-muted small mb-1">Total Users</p>
              <h3 className="fw-800 mb-0" style={{ color: '#0369a1' }}>{totalUsers}</h3>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="clay-card p-4 text-center shadow-sm">
              <i className="fa-solid fa-check-circle" style={{ fontSize: '2rem', color: '#059669', marginBottom: '8px', display: 'block' }} />
              <p className="text-muted small mb-1">Active Users</p>
              <h3 className="fw-800 mb-0" style={{ color: '#059669' }}>{activeUsers}</h3>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="clay-card p-4 text-center shadow-sm">
              <i className="fa-solid fa-ban" style={{ fontSize: '2rem', color: '#dc2626', marginBottom: '8px', display: 'block' }} />
              <p className="text-muted small mb-1">Banned Users</p>
              <h3 className="fw-800 mb-0" style={{ color: '#dc2626' }}>{bannedUsers}</h3>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="clay-card p-4 text-center shadow-sm">
              <i className="fa-solid fa-chart-pie" style={{ fontSize: '2rem', color: '#7c3aed', marginBottom: '8px', display: 'block' }} />
              <p className="text-muted small mb-1">Active Rate</p>
              <h3 className="fw-800 mb-0" style={{ color: '#7c3aed' }}>{activeRate}%</h3>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="clay-card p-4 shadow-sm bg-white" style={{ borderRadius: '20px' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="table table-hover align-middle mb-0">
              <thead style={{ backgroundColor: '#f5f7fa', borderBottom: '2px solid #e5e7eb' }}>
                <tr>
                  <th className="text-muted fw-700 small">USER</th>
                  <th className="text-muted fw-700 small">EMAIL</th>
                  <th className="text-muted fw-700 small">ROLE</th>
                  <th className="text-muted fw-700 small">STATUS</th>
                  <th className="text-muted fw-700 small">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((user) => (
                    <tr key={user.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <img
                            src={`/api/v1/users/${user.id}/profile-photo?t=${Date.now()}`}
                            alt={user.name}
                            width="36"
                            height="36"
                            style={{ borderRadius: '50%', objectFit: 'cover', backgroundColor: '#e5e7eb' }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                          <div>
                            <p className="fw-700 mb-0 small">{user.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-muted small">{user.email}</td>
                      <td>
                        <span className="badge bg-light text-dark fw-700" style={{ fontSize: '0.7rem' }}>
                          {user.roles?.join(', ') || 'USER'}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge fw-700`}
                          style={{
                            backgroundColor: user.banned ? '#fee2e2' : '#dcfce7',
                            color: user.banned ? '#c53030' : '#2f855a',
                            padding: '5px 10px',
                            borderRadius: '6px',
                            fontSize: '0.7rem',
                          }}
                        >
                          <i className={`fa-solid fa-${user.banned ? 'ban' : 'check-circle'}`} />
                          &nbsp;{user.banned ? 'BANNED' : 'ACTIVE'}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          {/* EDIT Button */}
                          {canEditUser(user) && (
                            <button
                              type="button"
                              className="btn btn-sm fw-700"
                              style={{
                                backgroundColor: '#e0f2fe',
                                color: '#0369a1',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '5px 10px',
                                fontSize: '0.7rem',
                                cursor: 'pointer',
                              }}
                              onClick={() => handleEditClick(user)}
                            >
                              <i className="fa-solid fa-pencil" />
                            </button>
                          )}
                          
                          {/* BAN/UNBAN Button */}
                          {canBanOrDeleteUser(user) && (
                            <button
                              type="button"
                              className="btn btn-sm fw-700"
                              style={{
                                backgroundColor: user.banned ? '#dcfce7' : '#fee2e2',
                                color: user.banned ? '#2f855a' : '#c53030',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '5px 10px',
                                fontSize: '0.7rem',
                                cursor: 'pointer',
                              }}
                              onClick={() => handleBanClick(user)}
                            >
                              <i className={`fa-solid fa-${user.banned ? 'unlock' : 'lock'}`} />
                            </button>
                          )}

                          {/* DELETE Button */}
                          {canBanOrDeleteUser(user) && (
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
                              onClick={() => handleDeleteClick(user)}
                            >
                              <i className="fa-solid fa-trash" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-muted">
                      No users found
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
              <div className="btn-group" style={{ display: 'flex', gap: '4px' }}>
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

      {/* Full Edit Modal */}
      <Modal 
        show={modalType === 'edit'} 
        onHide={() => { setModalType(null); setSelectedUser(null); }} 
        size="lg"
        centered
        contentClassName="bg-white border-0 shadow-lg"
        style={{ borderRadius: '24px' }}
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-800" style={{ color: '#1e293b' }}>
            Edit User: {selectedUser?.name || selectedUser?.email}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleSubmit(onEditSubmit)}>
            <div className="row">
              {/* Columna Izquierda: Perfil y Bio */}
              <div className="col-md-5 d-flex flex-column align-items-center border-end pe-4">
                
                <div className="mb-3 position-relative text-center">
                  <img
                    src={selectedPhoto ? URL.createObjectURL(selectedPhoto) : `/api/v1/users/${selectedUser?.id}/profile-photo?t=${Date.now()}`}
                    alt="Profile"
                    className="rounded-circle shadow-sm mb-3"
                    style={{ width: '120px', height: '120px', objectFit: 'cover', backgroundColor: '#f1f5f9' }}
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=User&background=random'; }}
                  />
                  <div>
                    <label htmlFor="photo-upload" className="btn btn-outline-primary btn-sm rounded-pill fw-700">
                      <i className="fa-solid fa-camera me-2"></i>Change Photo
                    </label>
                    <input 
                      id="photo-upload" 
                      type="file" 
                      accept="image/*" 
                      className="d-none" 
                      onChange={(e: any) => setSelectedPhoto(e.target.files[0])}
                    />
                  </div>
                </div>

                <div className="w-100">
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-700 small text-uppercase text-muted" style={{ letterSpacing: '1px' }}>Name</Form.Label>
                    <Form.Control
                      type="text"
                      className="rounded-3 py-2 bg-light border-0"
                      {...register('name')}
                      disabled={isLoading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-700 small text-uppercase text-muted" style={{ letterSpacing: '1px' }}>Bio / Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      className="rounded-3 py-2 bg-light border-0"
                      {...register('description')}
                      disabled={isLoading}
                    />
                  </Form.Group>
                </div>
              </div>

              {/* Columna Derecha: Account & Billing */}
              <div className="col-md-7 ps-4">
                <h6 className="fw-700 text-uppercase text-muted mb-4" style={{ letterSpacing: '1px' }}>Account & Billing</h6>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-700 small text-muted">EMAIL ADDRESS</Form.Label>
                  <Form.Control
                    type="email"
                    className="rounded-3 py-2 bg-light border-0"
                    {...register('email')}
                    disabled={isLoading}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-700 small text-muted">CARD NUMBER</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="xxxx xxxx xxxx xxxx"
                    className="rounded-3 py-2 bg-light border-0"
                    {...register('cardNumber')}
                    disabled={isLoading}
                  />
                </Form.Group>

                <div className="row">
                  <Form.Group className="col-sm-6 mb-4">
                    <Form.Label className="fw-700 small text-muted">EXPIRING DATE</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="MM/YY"
                      className="rounded-3 py-2 bg-light border-0"
                      {...register('cardExpiringDate')}
                      disabled={isLoading}
                    />
                  </Form.Group>

                  <Form.Group className="col-sm-6 mb-4">
                    <Form.Label className="fw-700 small text-muted">CVV</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="123"
                      className="rounded-3 py-2 bg-light border-0"
                      {...register('cardCvv')}
                      disabled={isLoading}
                    />
                  </Form.Group>
                </div>

                {/* Botones de acción alineados a la derecha */}
                <div className="d-flex gap-3 justify-content-end mt-3">
                  <Button
                    variant="light"
                    type="button"
                    className="rounded-pill px-4 fw-700"
                    onClick={() => {
                      setModalType(null);
                      setSelectedUser(null);
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="dark"
                    className="rounded-pill px-4 fw-700"
                    style={{ backgroundColor: '#1e293b' }}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Confirm Modal for Ban/Delete */}
      <ConfirmModal
        show={modalType === 'ban' || modalType === 'delete'}
        title={modalTitle}
        message={modalMessage}
        confirmText={confirmText}
        cancelText="Cancel"
        variant={modalVariant}
        isLoading={isLoading}
        onConfirm={modalType === 'ban' ? confirmBan : confirmDelete}
        onCancel={() => {
          setModalType(null);
          setSelectedUser(null);
        }}
      />
    </>
  );
}

export function ErrorBoundary({ error }: { readonly error: Error }) {
  return (
    <div className="alert alert-danger m-5" role="alert">
      <h4 className="alert-heading">Error Loading Users!</h4>
      <p>{error instanceof Error ? error.message : 'An unexpected error occurred'}</p>
      <button className="btn btn-outline-danger" onClick={() => (globalThis.location.href = '/')}>
        Back to home
      </button>
    </div>
  );
}