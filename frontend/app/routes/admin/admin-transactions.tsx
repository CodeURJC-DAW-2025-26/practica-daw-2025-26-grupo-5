import { useState } from 'react';
import { redirect } from 'react-router';
import { getAdminTransactions } from '~/services/admin-service';
import type TransactionDTO from '~/dto/TransactionDTO';
import type PagedResponse from '~/dto/PagedResponse';
import AdminHeader from '~/components/admin/AdminHeader';

export async function clientLoader() {
  try {
    const data = await getAdminTransactions(0, 100);
    return data || {};
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    throw redirect('/login');
  }
}

export default function AdminTransactions({ loaderData }: { readonly loaderData: any }) {
  const pagedData = loaderData as PagedResponse<TransactionDTO>;
  const transactions = pagedData.content || [];

  const [rowData] = useState<TransactionDTO[]>(transactions);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  const totalAccumulated = transactions.reduce((sum, t) => sum + (t.finalPrice || 0), 0);
  const averageTransaction = transactions.length > 0 ? totalAccumulated / transactions.length : 0;

  const paginatedData = rowData.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );
  const totalPages = Math.ceil(rowData.length / itemsPerPage);

  return (
    <>
      <AdminHeader
        title="Global Transactions"
        subtitle="Overview of all historical financial movements."
      />

      <div className="container-fluid">
        {/* KPI Row */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-sm-6 col-lg-4">
            <div className="clay-card p-4 text-center shadow-sm">
              <i className="fa-solid fa-euro-sign" style={{ fontSize: '2rem', color: '#059669', marginBottom: '8px', display: 'block' }} />
              <p className="text-muted small mb-1">Total Accumulated Volume</p>
              <h3 className="fw-800 mb-0" style={{ color: '#059669' }}>€{totalAccumulated.toFixed(0)}</h3>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-4">
            <div className="clay-card p-4 text-center shadow-sm">
              <i className="fa-solid fa-credit-card" style={{ fontSize: '2rem', color: '#7c3aed', marginBottom: '8px', display: 'block' }} />
              <p className="text-muted small mb-1">Total Transactions</p>
              <h3 className="fw-800 mb-0" style={{ color: '#7c3aed' }}>{rowData.length}</h3>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-4">
            <div className="clay-card p-4 text-center shadow-sm">
              <i className="fa-solid fa-chart-line" style={{ fontSize: '2rem', color: '#f59e0b', marginBottom: '8px', display: 'block' }} />
              <p className="text-muted small mb-1">Average Transaction</p>
              <h3 className="fw-800 mb-0" style={{ color: '#f59e0b' }}>€{averageTransaction.toFixed(2)}</h3>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="clay-card p-4 shadow-sm bg-white" style={{ borderRadius: '20px' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="table table-hover align-middle mb-0">
              <thead style={{ backgroundColor: '#f5f7fa', borderBottom: '2px solid #e5e7eb' }}>
                <tr>
                  <th className="text-muted fw-700 small">TRX ID</th>
                  <th className="text-muted fw-700 small">DATE</th>
                  <th className="text-muted fw-700 small">PRODUCT</th>
                  <th className="text-muted fw-700 small">BUYER</th>
                  <th className="text-muted fw-700 small">SELLER</th>
                  <th className="text-muted fw-700 small">AMOUNT</th>
                  <th className="text-muted fw-700 small">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((transaction) => (
                    <tr key={transaction.transactionId} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td className="text-muted small fw-700">#{transaction.transactionId}</td>
                      <td className="text-muted small">
                        {transaction.formattedDate || new Date(transaction.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <img
                            src={`/api/v1/products/${transaction.product?.id}/image`}
                            alt={transaction.product?.name}
                            width="32"
                            height="32"
                            className="rounded"
                            style={{ objectFit: 'cover', backgroundColor: '#e5e7eb' }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                          <span className="fw-600 small">{transaction.product?.name || 'Deleted'}</span>
                        </div>
                      </td>
                      <td className="text-muted small">{transaction.buyer?.name || 'Unknown'}</td>
                      <td className="text-muted small">{transaction.seller?.name || 'Unknown'}</td>
                      <td className="fw-700 small" style={{ color: '#059669' }}>€{transaction.finalPrice?.toFixed(2)}</td>
                      <td>
                        <span
                          className={`badge fw-700`}
                          style={{
                            backgroundColor: transaction.transactionStatus === 'COMPLETED' ? '#dcfce7' : '#fef3c7',
                            color: transaction.transactionStatus === 'COMPLETED' ? '#2f855a' : '#b45309',
                            padding: '5px 10px',
                            borderRadius: '6px',
                            fontSize: '0.7rem',
                          }}
                        >
                          {transaction.transactionStatus === 'COMPLETED' ? '✓ COMPLETED' : 'PENDING'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-muted">
                      No transactions found
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
              <div className="btn-group">
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
    </>
  );
}

export function ErrorBoundary({ error }: { readonly error: Error }) {
  return (
    <div className="alert alert-danger m-5" role="alert">
      <h4 className="alert-heading">Error Loading Transactions!</h4>
      <p>{error instanceof Error ? error.message : 'An unexpected error occurred'}</p>
      <button className="btn btn-outline-danger" onClick={() => (globalThis.location.href = '/')}>
        Back to home
      </button>
    </div>
  );
}
