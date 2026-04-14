import { useState } from 'react';
import { redirect } from 'react-router';
import { getAdminUsers, banUser, deleteUser } from '~/services/admin-service';
import type UserDTO from '~/dto/UserDTO';
import type PagedResponse from '~/dto/PagedResponse';
import AdminHeader from '~/components/admin/AdminHeader';
import ConfirmModal from '~/components/confirm-modal';

export async function clientLoader() {
  try {
    const data = await getAdminUsers(0, 100);
    return data || {};
  } catch (error) {
    console.error('Failed to fetch admin users:', error);
    throw redirect('/login');
  }
}

export default function AdminUsers({ loaderData }: { loaderData: any }) {
  const pagedData = loaderData as PagedResponse<UserDTO>;
  const users = pagedData.content || [];

  const [rowData, setRowData] = useState<UserDTO[]>(users);
  const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);
  const [modalType, setModalType] = useState<'ban' | 'delete' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  const handleBanClick = (user: UserDTO) => {
    setSelectedUser(user);
    setModalType('ban');
  };

  const confirmBan = async () => {
    if (!selectedUser) return;
    setIsLoading(true);
    try {
      const isBanned = selectedUser.banned;
      await banUser(selectedUser.id, !isBanned);
      setRowData((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? { ...u, banned: !isBanned } : u))
      );
      setModalType(null);
      setSelectedUser(null);
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
                            src={`/api/v1/users/${user.id}/profile-photo`}
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
              <div className="btn-group" role="group">
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
        show={modalType !== null}
        title={
          modalType === 'ban'
            ? selectedUser?.banned
              ? 'Unban User?'
              : 'Ban User?'
            : 'Delete User?'
        }
        message={
          modalType === 'ban'
            ? selectedUser?.banned
              ? `Are you sure you want to unban "${selectedUser?.name}"? They will regain access.`
              : `Are you sure you want to ban "${selectedUser?.name}"? They will be unable to access the platform.`
            : `Are you sure you want to permanently delete "${selectedUser?.name}"? This action cannot be undone.`
        }
        confirmText={modalType === 'ban' ? (selectedUser?.banned ? 'Unban' : 'Ban') : 'Delete'}
        cancelText="Cancel"
        variant={modalType === 'delete' ? 'danger' : 'warning'}
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

export function ErrorBoundary({ error }: { error: Error }) {
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
