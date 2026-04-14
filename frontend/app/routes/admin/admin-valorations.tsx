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
      <div className="container-fluid mb-5">
        <div className="row g-4">
          {/* Total Reviews */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="clay-card p-5 d-flex align-items-center justify-content-between shadow-sm" style={{ borderLeft: '5px solid #fbbf24' }}>
              <div>
                <p className="label-categories mb-2 text-muted">TOTAL REVIEWS</p>
                <h2 className="fw-800 mb-0" style={{ color: '#fbbf24' }}>
                  {totalReviews}
                </h2>
                <small className="text-muted">👥 User feedback count</small>
              </div>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '12px',
                backgroundColor: '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                color: '#fbbf24',
              }}>
                <i className="fa-solid fa-star" />
              </div>
            </div>
          </div>

          {/* Average Rating */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="clay-card p-5 d-flex align-items-center justify-content-between shadow-sm" style={{ borderLeft: '5px solid #06b6d4' }}>
              <div>
                <p className="label-categories mb-2 text-muted">AVERAGE RATING</p>
                <h2 className="fw-800 mb-0" style={{ color: '#06b6d4' }}>
                  {averageRating} / 5
                </h2>
                <small className="text-muted">📊 Platform satisfaction</small>
              </div>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '12px',
                backgroundColor: '#cffafe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                color: '#06b6d4',
              }}>
                <i className="fa-solid fa-chart-bar" />
              </div>
            </div>
          </div>

          {/* 5-Star Reviews */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="clay-card p-5 d-flex align-items-center justify-content-between shadow-sm" style={{ borderLeft: '5px solid #10b981' }}>
              <div>
                <p className="label-categories mb-2 text-muted">5-STAR REVIEWS</p>
                <h2 className="fw-800 mb-0" style={{ color: '#10b981' }}>
                  {fiveStarCount}
                </h2>
                <small className="text-muted">⭐ Excellent feedback</small>
              </div>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '12px',
                backgroundColor: '#dcfce7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                color: '#10b981',
              }}>
                <i className="fa-solid fa-trophy" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Valorations Table */}
      <div className="clay-card p-4 bg-white shadow-sm" style={{ borderRadius: '20px' }}>
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