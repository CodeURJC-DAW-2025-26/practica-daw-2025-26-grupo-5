import { useState } from 'react';
import { redirect, useNavigate } from 'react-router';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

import { getAdminUsers, banUser, deleteUser } from '~/services/adminService';
import type UserDTO from '~/dtos/UserDTO';
import type PagedResponse from '~/dtos/PagedResponse';
import AdminHeader from '~/components/admin/AdminHeader';
import ConfirmModal from '~/components/ConfirmModal';

/**
 * Client-side loader: Fetches all users for the admin panel
 */
export async function clientLoader() {
  try {
    const data = await getAdminUsers(0, 100);
    return data || {};
  } catch (error) {
    console.error('Failed to fetch admin users:', error);
    throw redirect('/login');
  }
}

/**
 * Admin Users Component
 * Displays a table of all users with actions (ban, delete)
 */
export default function AdminUsers({ loaderData }: { loaderData: any }) {
  const pagedData = loaderData as PagedResponse<UserDTO>;
  const users = pagedData.content || [];

  const [rowData, setRowData] = useState<UserDTO[]>(users);
  const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);
  const [modalType, setModalType] = useState<'ban' | 'delete' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  /**
   * Handle ban/unban action
   */
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

      // Update row data
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

  /**
   * Handle delete action
   */
  const handleDeleteClick = (user: UserDTO) => {
    setSelectedUser(user);
    setModalType('delete');
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    setIsLoading(true);
    try {
      await deleteUser(selectedUser.id);

      // Remove user from table
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

  /**
   * Column Definitions for ag-grid
   */
  const columnDefs: any[] = [
    {
      field: 'name',
      headerName: 'User',
      width: 200,
      cellRenderer: (params: any) => (
        <div className="d-flex align-items-center gap-2">
          <img
            src={`http://localhost:8443/user/${params.data.id}/profile-photo`}
            alt={params.data.name}
            width="36"
            height="36"
            style={{ borderRadius: '50%', objectFit: 'cover' }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23e2e8f0" width="100" height="100"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%2364748b" font-size="12">No img</text></svg>';
            }}
          />
          <div>
            <p className="fw-700 mb-0 text-dark">{params.data.name}</p>
            <p className="x-small text-muted mb-0">{params.data.email}</p>
          </div>
        </div>
      ),
    },
    {
      field: 'roles',
      headerName: 'Role',
      width: 120,
      cellRenderer: (params: any) => {
        const roles = params.data.roles || [];
        return (
          <span className="badge bg-light text-dark fw-700" style={{ fontSize: '0.75rem' }}>
            {roles.join(', ') || 'USER'}
          </span>
        );
      },
    },
    {
      field: 'banned',
      headerName: 'Status',
      width: 140,
      cellRenderer: (params: any) => (
        <span
          className={`status-pill badge ${params.data.banned ? 'bg-danger' : 'bg-success'}`}
          style={{
            backgroundColor: params.data.banned ? '#fee2e2' : '#dcfce7',
            color: params.data.banned ? '#c53030' : '#2f855a',
            padding: '5px 12px',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '0.75rem',
          }}
        >
          <i className={`fa-solid fa-${params.data.banned ? 'ban' : 'check-circle'}`} /> &nbsp;
          {params.data.banned ? 'BANNED' : 'ACTIVE'}
        </span>
      ),
    },
    {
      field: 'id',
      headerName: 'Actions',
      width: 200,
      cellRenderer: (params: any) => (
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-sm fw-700"
            style={{
              backgroundColor: params.data.banned ? '#dcfce7' : '#fee2e2',
              color: params.data.banned ? '#2f855a' : '#c53030',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '0.75rem',
              cursor: 'pointer',
            }}
            onClick={() => handleBanClick(params.data)}
          >
            <i className={`fa-solid fa-${params.data.banned ? 'unlock' : 'lock'}`} />
            &nbsp;{params.data.banned ? 'UNBAN' : 'BAN'}
          </button>
          <button
            type="button"
            className="btn btn-sm fw-700"
            style={{
              backgroundColor: '#fee2e2',
              color: '#dc3545',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '0.75rem',
              cursor: 'pointer',
            }}
            onClick={() => handleDeleteClick(params.data)}
          >
            <i className="fa-solid fa-trash" /> DELETE
          </button>
        </div>
      ),
    },
  ];

  /**
   * Default column settings
   */
  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  return (
    <>
      <AdminHeader
        title="User Management"
        subtitle={`Total users: ${rowData.length}`}
      />

      <div className="clay-card p-4 overflow-hidden shadow-sm bg-white" style={{ borderRadius: '20px' }}>
        <div className="ag-theme-quartz" style={{ height: "600px", width: "100%" }}>
          <AgGridReact
            key={rowData.length > 0 ? rowData[0].id : 'empty-grid'}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            pagination={true}
            paginationPageSize={10}
            suppressHorizontalScroll={false}
          />
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
      <button className="btn btn-outline-danger" onClick={() => (window.location.href = '/')}>
        Back to home
      </button>
    </div>
  );
}
