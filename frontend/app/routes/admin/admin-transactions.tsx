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
      <div className="container-fluid mb-5">
        <div className="row g-4">
          {/* Total Accumulated Volume */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="clay-card p-5 d-flex align-items-center justify-content-between shadow-sm" style={{ borderLeft: '5px solid #059669' }}>
              <div>
                <p className="label-categories mb-2 text-muted">TOTAL ACCUMULATED VOLUME</p>
                <h2 className="fw-800 mb-0" style={{ color: '#059669' }}>
                  {totalAccumulated.toFixed(0)} €
                </h2>
                <small className="text-muted">↑ Platform revenue</small>
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
                color: '#059669',
              }}>
                <i className="fa-solid fa-euro-sign" />
              </div>
            </div>
          </div>

          {/* Total Transactions */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="clay-card p-5 d-flex align-items-center justify-content-between shadow-sm" style={{ borderLeft: '5px solid #7c3aed' }}>
              <div>
                <p className="label-categories mb-2 text-muted">TOTAL TRANSACTIONS</p>
                <h2 className="fw-800 mb-0" style={{ color: '#7c3aed' }}>
                  {rowData.length}
                </h2>
                <small className="text-muted">✔️ {completedCount} Successful trades</small>
              </div>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '12px',
                backgroundColor: '#e0e7ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                color: '#7c3aed',
              }}>
                <i className="fa-solid fa-credit-card" />
              </div>
            </div>
          </div>

          {/* Average Transaction */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="clay-card p-5 d-flex align-items-center justify-content-between shadow-sm" style={{ borderLeft: '5px solid #f59e0b' }}>
              <div>
                <p className="label-categories mb-2 text-muted">AVERAGE TRANSACTION</p>
                <h2 className="fw-800 mb-0" style={{ color: '#f59e0b' }}>
                  {averageTransaction.toFixed(2)} €
                </h2>
                <small className="text-muted">Per transaction</small>
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
                color: '#f59e0b',
              }}>
                <i className="fa-solid fa-chart-line" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
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