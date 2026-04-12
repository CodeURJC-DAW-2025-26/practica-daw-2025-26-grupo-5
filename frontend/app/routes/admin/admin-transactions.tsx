import { useState } from 'react';
import { redirect } from 'react-router';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

// Importamos el nombre correcto de la función: getAdminTransactions
import { getAdminTransactions } from '~/services/admin-service';
import type TransactionDTO from '~/dtos/TransactionDTO';
import type PagedResponse from '~/dtos/PagedResponse';
import AdminHeader from '~/components/admin/AdminHeader';
import ConfirmModal from '~/components/confirm-modal';

export async function clientLoader() {
  try {
    const data = await getAdminTransactions(0, 100);
    return data || {};
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    throw redirect('/login');
  }
}

export default function AdminTransactions({ loaderData }: { loaderData: any }) {
  const pagedData = loaderData as PagedResponse<TransactionDTO>;
  const transactions = pagedData.content || [];

  const [rowData, setRowData] = useState<TransactionDTO[]>(transactions);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionDTO | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDeleteClick = (transaction: TransactionDTO) => {
    setSelectedTransaction(transaction);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedTransaction) return;
    setIsLoading(true);
    try {
      // Nota: Si el backend no permite borrar transacciones (común en contabilidad), 
      // esta función simplemente no se usa. Por ahora la marcamos como "Pending" 
      // o usa una función genérica si el backend lo soporta.
      console.log("Delete transaction:", selectedTransaction.transactionId);
      
      setRowData((prev) => prev.filter((t) => t.transactionId !== selectedTransaction.transactionId));
      setShowDeleteModal(false);
    } catch (error) {
      alert('Action not available');
    } finally {
      setIsLoading(false);
    }
  };

  const columnDefs: any[] = [
    {
      field: 'transactionId',
      headerName: 'ID',
      width: 100,
      cellRenderer: (params: any) => <span className="fw-700 text-muted">#{params.value}</span>
    },
    {
      field: 'product.name',
      headerName: 'Product',
      width: 250,
      valueGetter: (params: any) => params.data.product?.name || 'Deleted Product'
    },
    {
      field: 'finalPrice',
      headerName: 'Amount',
      width: 130,
      cellRenderer: (params: any) => <span className="fw-700 text-primary">{params.value?.toFixed(2)} €</span>
    },
    {
      field: 'transactionStatus',
      headerName: 'Status',
      width: 150,
      cellRenderer: (params: any) => (
        <span className={`badge ${params.value === 'COMPLETED' ? 'bg-success' : 'bg-warning'} text-white`}>
          {params.value}
        </span>
      )
    },
    {
      field: 'transactionId',
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
      <AdminHeader title="Transactions" subtitle={`History of ${rowData.length} operations`} />
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
        show={showDeleteModal}
        title="Delete Record?"
        message="Are you sure you want to remove this transaction record?"
        confirmText="Delete"
        variant="danger"
        isLoading={isLoading}
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </>
  );
}