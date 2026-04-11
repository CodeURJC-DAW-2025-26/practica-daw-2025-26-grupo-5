import { useState } from 'react';
import { redirect } from 'react-router';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

// Importamos el nombre correcto: deleteValoration (sin el "Admin")
import { getAdminValorations, deleteValoration } from '~/services/adminService';
import type ValorationDTO from '~/dtos/ValorationDTO';
import type PagedResponse from '~/dtos/PagedResponse';
import AdminHeader from '~/components/admin/AdminHeader';
import ConfirmModal from '~/components/ConfirmModal';

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
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'valuator.name', headerName: 'Author', width: 150 },
    { field: 'valued.name', headerName: 'Target User', width: 150 },
    { 
      field: 'rating', 
      headerName: 'Stars', 
      width: 150,
      cellRenderer: (params: any) => (
        <span className="fw-700" style={{ color: '#FFB800' }}>
          {"★".repeat(params.value)}{"☆".repeat(5 - params.value)}
        </span>
      )
    },
    { field: 'comment', headerName: 'Comment', width: 300 },
    {
      field: 'id',
      headerName: 'Actions',
      width: 120,
      cellRenderer: (params: any) => (
        <button className="btn btn-sm btn-danger-clay" onClick={() => handleDeleteClick(params.data)}>
          <i className="fa-solid fa-trash" />
        </button>
      )
    }
  ];

  return (
    <>
      <AdminHeader title="Global Valorations" subtitle={`${rowData.length} reviews found`} />
      <div className="clay-card p-4 bg-white" style={{ borderRadius: '20px' }}>
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