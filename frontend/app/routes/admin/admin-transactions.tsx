import { useState } from 'react';
import { redirect } from 'react-router';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

// Importamos el nombre correcto de la función: getAdminTransactions
import { getAdminTransactions } from '~/services/admin-service';
import type TransactionDTO from '~/dto/TransactionDTO';
import type PagedResponse from '~/dto/PagedResponse';
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

  // Calculate metrics
  const totalAccumulated = transactions.reduce((sum, t) => sum + (t.finalPrice || 0), 0);
  const completedCount = transactions.filter(t => t.transactionStatus === 'COMPLETED').length;
  const averageTransaction = transactions.length > 0 ? totalAccumulated / transactions.length : 0;

  const handleDeleteClick = (transaction: TransactionDTO) => {
    setSelectedTransaction(transaction);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedTransaction) return;
    setIsLoading(true);
    try {
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
      headerName: 'TRX ID',
      width: 120,
      cellRenderer: (params: any) => <span className="fw-700 text-muted small">#{params.value}</span>
    },
    {
      field: 'transactionDate',
      headerName: 'DATE',
      width: 200,
      cellRenderer: (params: any) => (
        <small className="text-muted">
          {new Date(params.data.transactionDate).toLocaleString()}
        </small>
      )
    },
    {
      field: 'product.name',
      headerName: 'PRODUCT',
      width: 280,
      cellRenderer: (params: any) => (
        <div className="d-flex align-items-center gap-2">
          <img 
            src={`/api/v1/products/${params.data.product?.id}/image`}
            width="32" height="32" className="rounded" style={{objectFit: 'cover'}}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <span className="fw-600 small">{params.data.product?.name || 'Deleted Product'}</span>
        </div>
      )
    },
    {
      field: 'buyer.name',
      headerName: 'BUYER',
      width: 130,
      cellRenderer: (params: any) => <span className="small">{params.data.buyer?.name || 'Unknown'}</span>
    },
    {
      field: 'seller.name',
      headerName: 'SELLER',
      width: 130,
      cellRenderer: (params: any) => <span className="small">{params.data.seller?.name || 'Unknown'}</span>
    },
    {
      field: 'finalPrice',
      headerName: 'AMOUNT',
      width: 120,
      cellRenderer: (params: any) => <span className="fw-700" style={{color: '#059669'}}>{params.value?.toFixed(2)} €</span>
    },
    {
      field: 'transactionStatus',
      headerName: 'STATUS',
      width: 130,
      cellRenderer: (params: any) => (
        <span className={`badge ${params.value === 'COMPLETED' ? 'bg-success' : 'bg-warning'}`}>
          {params.value === 'COMPLETED' ? '✓ COMPLETED' : 'PENDING'}
        </span>
      )
    },
    {
      field: 'transactionId',
      headerName: 'ACTIONS',
      width: 100,
      cellRenderer: (params: any) => (
        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteClick(params.data)} title="Delete record">
          <i className="fa-solid fa-trash" />
        </button>
      )
    }
  ];

  return (
    <>
      <AdminHeader title="Global Transactions" subtitle="Overview of all historical financial movements." />
      
      {/* KPI Cards */}
      <div className="row g-4 mb-4">
        {/* Total Accumulated Volume */}
        <div className="col-12 col-sm-6 col-lg-4">
          <div className="clay-card p-4 text-center shadow-sm">
            <i className="fa-solid fa-euro-sign" style={{ fontSize: '2rem', color: '#059669', marginBottom: '8px', display: 'block' }} />
            <p className="text-muted small mb-1">Total Accumulated Volume</p>
            <h3 className="fw-800 mb-0" style={{ color: '#059669' }}>{totalAccumulated.toFixed(0)} €</h3>
          </div>
        </div>

        {/* Total Transactions */}
        <div className="col-12 col-sm-6 col-lg-4">
          <div className="clay-card p-4 text-center shadow-sm">
            <i className="fa-solid fa-credit-card" style={{ fontSize: '2rem', color: '#7c3aed', marginBottom: '8px', display: 'block' }} />
            <p className="text-muted small mb-1">Total Transactions</p>
            <h3 className="fw-800 mb-0" style={{ color: '#7c3aed' }}>{rowData.length}</h3>
          </div>
        </div>

        {/* Average Transaction */}
        <div className="col-12 col-sm-6 col-lg-4">
          <div className="clay-card p-4 text-center shadow-sm">
            <i className="fa-solid fa-chart-line" style={{ fontSize: '2rem', color: '#f59e0b', marginBottom: '8px', display: 'block' }} />
            <p className="text-muted small mb-1">Average Transaction</p>
            <h3 className="fw-800 mb-0" style={{ color: '#f59e0b' }}>{averageTransaction.toFixed(2)} €</h3>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-800 mb-0">Transaction Details</h5>
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