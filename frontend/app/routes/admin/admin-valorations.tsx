import { useState } from 'react';
import { redirect } from 'react-router';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

// Importamos el nombre correcto: deleteValoration (sin el "Admin")
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

export default function AdminValorations({ loaderData }: { loaderData: any }) {
  const pagedData = loaderData as PagedResponse<ValorationDTO>;
  const [rowData, setRowData] = useState<ValorationDTO[]>(pagedData.content || []);
  const [selectedVal, setSelectedVal] = useState<ValorationDTO | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate metrics
  const totalReviews = rowData.length;
  const averageRating = totalReviews > 0 
    ? (rowData.reduce((sum, v) => sum + (v.rating || 0), 0) / totalReviews).toFixed(1)
    : '0';
  const fiveStarCount = rowData.filter(v => v.rating === 5).length;

  const handleDeleteClick = (val: ValorationDTO) => {
    setSelectedVal(val);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedVal) return;
    setIsLoading(true);
    try {
      await deleteValoration(selectedVal.id); // Nombre corregido aquí
      setRowData(prev => prev.filter(v => v.id !== selectedVal.id));
      setShowModal(false);
    } catch (error) {
      alert('Error deleting valoration');
    } finally {
      setIsLoading(false);
    }
  };

  const columnDefs: any[] = [
    { 
      field: 'id', 
      headerName: 'VAL ID', 
      width: 90,
      cellRenderer: (params: any) => <span className="fw-700 text-muted small">#{params.value}</span>
    },
    { 
      field: 'valuator.name', 
      headerName: 'BUYER', 
      width: 150,
      cellRenderer: (params: any) => <span className="small">{params.data.valuator?.name || 'Unknown'}</span>
    },
    { 
      field: 'valued.name', 
      headerName: 'SELLER', 
      width: 150,
      cellRenderer: (params: any) => <span className="small">{params.data.valued?.name || 'Unknown'}</span>
    },
    { 
      field: 'rating', 
      headerName: 'RATING', 
      width: 150,
      cellRenderer: (params: any) => (
        <span className="fw-700" style={{ color: '#FFB800' }}>
          {params.value} {params.value > 0 && "★"}
        </span>
      )
    },
    { 
      field: 'comment', 
      headerName: 'COMMENT', 
      width: 350,
      cellRenderer: (params: any) => <span className="small text-muted text-truncate">{params.value || '-'}</span>
    },
    {
      field: 'id',
      headerName: 'ACTIONS',
      width: 100,
      cellRenderer: (params: any) => (
        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteClick(params.data)} title="Delete review">
          <i className="fa-solid fa-trash" />
        </button>
      )
    }
  ];

  return (
    <>
      <AdminHeader title="Global Valorations" subtitle="Monitor and manage user feedback and platform integrity." />
      
      {/* KPI Cards */}
      <div className="row g-4 mb-4">
        {/* Total Reviews */}
        <div className="col-12 col-sm-6 col-lg-4">
          <div className="clay-card p-4 text-center shadow-sm">
            <i className="fa-solid fa-star" style={{ fontSize: '2rem', color: '#fbbf24', marginBottom: '8px', display: 'block' }} />
            <p className="text-muted small mb-1">Total Reviews</p>
            <h3 className="fw-800 mb-0" style={{ color: '#fbbf24' }}>{totalReviews}</h3>
          </div>
        </div>

        {/* Average Rating */}
        <div className="col-12 col-sm-6 col-lg-4">
          <div className="clay-card p-4 text-center shadow-sm">
            <i className="fa-solid fa-chart-bar" style={{ fontSize: '2rem', color: '#06b6d4', marginBottom: '8px', display: 'block' }} />
            <p className="text-muted small mb-1">Average Rating</p>
            <h3 className="fw-800 mb-0" style={{ color: '#06b6d4' }}>{averageRating} / 5</h3>
          </div>
        </div>

        {/* 5-Star Reviews */}
        <div className="col-12 col-sm-6 col-lg-4">
          <div className="clay-card p-4 text-center shadow-sm">
            <i className="fa-solid fa-trophy" style={{ fontSize: '2rem', color: '#10b981', marginBottom: '8px', display: 'block' }} />
            <p className="text-muted small mb-1">5-Star Reviews</p>
            <h3 className="fw-800 mb-0" style={{ color: '#10b981' }}>{fiveStarCount}</h3>
          </div>
        </div>
      </div>

      {/* Valorations Table */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-800 mb-0">Review Details</h5>
      </div>

      <div className="clay-card p-3 bg-white shadow-sm" style={{ borderRadius: '15px' }}>
        <div className="ag-theme-quartz" style={{ height: "600px", width: "100%" }}>
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            pagination={true}
            paginationPageSize={10}
          />
        </div>
      </div>

      <ConfirmModal
        show={showModal}
        title="Delete Review?"
        message="This will remove the review permanently."
        confirmText="Delete"
        variant="danger"
        isLoading={isLoading}
        onConfirm={confirmDelete}
        onCancel={() => setShowModal(false)}
      />
    </>
  );
}