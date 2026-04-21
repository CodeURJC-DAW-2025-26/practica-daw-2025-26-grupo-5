/**
 * Admin Transactions Management Page
 *
 * Transaction oversight dashboard for marketplace administrators.
 * Monitor, search, and manage all marketplace transactions/sales.
 *
 * Features:
 * - Transaction listing with search and filtering
 * - Search by:
 *    - Transaction ID
 *    - Seller username
 *    - Buyer username
 * - KPI cards showing transaction metrics:
 *    - Total transactions count
 *    - Total revenue from all sales
 *    - Average transaction value
 *    - Other relevant metrics
 * - Transaction table displaying:
 *    - Transaction ID
 *    - Product name
 *    - Seller name
 *    - Buyer name
 *    - Amount paid
 *    - Transaction date/time
 *    - Status (completed, pending, etc.)
 * - Quick actions:
 *    - View transaction details
 *    - Delete transaction
 * - Pagination controls
 * - Delete confirmation modal
 * - Error handling and display
 * - Loading states during search/operations
 * - Empty state when no transactions found
 *
 * Data Flow:
 * 1. clientLoader fetches initial transactions (up to 1000)
 * 2. Transactions displayed in paginated table
 * 3. Admin enters search query (ID, seller, or buyer)
 * 4. Search filters transactions
 * 5. Admin can:
 *    - View transaction details
 *    - Delete transaction if needed
 *    - Sort/filter in table
 * 6. After delete, list refreshes
 *
 * State Management:
 * - rowData: Current transactions displayed
 * - searchFilters: Active search parameters (id, seller, buyer)
 * - isSearching: Loading state during search
 * - currentPage: Pagination state
 * - selectedTransaction: Transaction being acted upon
 * - showDeleteModal: Delete confirmation visibility
 * - isDeleting: Loading state during delete
 *
 * Search Functionality:
 * - Case-insensitive search
 * - Filters by transaction ID (exact match)
 * - Filters by seller name (partial match)
 * - Filters by buyer name (partial match)
 * - Supports multiple filter types simultaneously
 *
 * Delete Action:
 * - Shows confirmation modal before deletion
 * - Prevents accidental data loss
 * - After deletion, list updates
 * - Shows error if delete fails
 *
 * KPI Calculations:
 * - Total transactions: Count of all transactions
 * - Total revenue: Sum of all transaction amounts
 * - Average transaction: Total revenue / transaction count
 * - Displayed in header cards
 *
 * Client Loader:
 * - Fetches transactions via getAdminTransactions()
 * - Supports pagination (page, size parameters)
 * - Can filter by ID, seller, buyer on backend
 * - Error handling for API failures
 *
 * @component
 * @returns React component for transaction management
 */

import React, { useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Image, Badge, Alert, Stack, Modal, Form } from 'react-bootstrap';
import { getAdminTransactions, deleteTransaction } from '~/services/admin-service';
import type TransactionDTO from '~/dto/TransactionDTO';
import type PagedResponse from '~/dto/PagedResponse';
import AdminHeader from '~/components/admin/AdminHeader';

/**
 * Client-side loader: Fetch transactions
 * 
 * Gets initial transaction list from backend.
 * Fetches up to 1000 transactions for client-side pagination.
 * 
 * @returns Paginated transaction data
 */
export async function clientLoader() {
  try {
    // Fetching up to 1000 items for client-side pagination example. 
    // Adjust this according to your backend API capabilities.
    const response = await getAdminTransactions(0, 1000);
    return response;
  } catch (error: any) {
    throw new Error(error.message || "Failed to load transactions");
  }
}

/**
 * KPI Card Props Interface
 * Defines structure for transaction metric cards
 */
interface KPIData {
  readonly label: string;
  readonly value: string | number;
  readonly color: string;
  readonly icon: string;
}

/**
 * Get Background Color for KPI Card
 * Maps color codes to light background colors
 */
const getKPIBg = (color: string): string => {
  const map: Record<string, string> = {
    '#059669': '#ecfdf5',
    '#7c3aed': '#f3e8ff',
    '#f59e0b': '#fef3c7',
  };
  return map[color] || '#f8fafc';
};

/**
 * KPI Card Component
 * Displays transaction metric with icon and color coding
 */
const KPICard = ({ label, value, color, icon, bg }: KPIData & { readonly bg: string }) => (
  <Card className="clay-card border-0 h-100" style={{ borderLeft: `5px solid ${color}` }}>
    <Card.Body className="p-4">
      <Stack direction="horizontal" gap={3} className="justify-content-between align-items-start mb-3">
        <h5 className="fw-800 mb-0 text-dark">{label}</h5>
        <div style={{
          padding: '10px 14px',
          borderRadius: '10px',
          backgroundColor: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <i className={`fa-solid ${icon}`} style={{ color, fontSize: '1.2rem' }} />
        </div>
      </Stack>
      <h2 className="fw-800 mb-0" style={{ color, fontSize: '2.2rem' }}>{value}</h2>
    </Card.Body>
  </Card>
);

// 3. Main Component
export default function AdminTransactions({ loaderData }: { readonly loaderData: any }) {
  const pagedData = loaderData as PagedResponse<TransactionDTO>;
  const rowData = pagedData.content || [];

  // Local state controlled pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [transactions, setTransactions] = useState<TransactionDTO[]>(rowData);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionDTO | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<'id' | 'users'>('id');
  const [searchId, setSearchId] = useState('');
  const [searchSeller, setSearchSeller] = useState('');
  const [searchBuyer, setSearchBuyer] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const itemsPerPage = 10;

  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const paginatedData = transactions.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  // KPI Calculations
  const totalAccumulated = transactions.reduce((acc, curr) => acc + (curr.finalPrice || 0), 0);
  const averageTransaction = transactions.length > 0 ? totalAccumulated / transactions.length : 0;

  const loadTransactions = async (
    options?: {
      mode?: 'id' | 'users';
      id?: string;
      seller?: string;
      buyer?: string;
    }
  ) => {
    const mode = options?.mode ?? searchMode;
    const idValue = options?.id ?? searchId;
    const sellerValue = options?.seller ?? searchSeller;
    const buyerValue = options?.buyer ?? searchBuyer;

    setIsSearching(true);
    try {
      if (mode === 'id') {
        const trimmedId = idValue.trim();
        const parsedId = trimmedId ? Number(trimmedId) : undefined;

        if (trimmedId && Number.isNaN(parsedId)) {
          alert('Please enter a valid transaction ID.');
          return;
        }

        const response = await getAdminTransactions(0, 1000, parsedId);
        setTransactions(response.content || []);
      } else {
        const response = await getAdminTransactions(
          0,
          1000,
          undefined,
          sellerValue.trim() || undefined,
          buyerValue.trim() || undefined
        );
        setTransactions(response.content || []);
      }

      setCurrentPage(0);
    } catch (error: any) {
      setDeleteError(error?.message || 'Failed to load transactions');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await loadTransactions();
  };

  const handleClearSearch = async () => {
    setSearchMode('id');
    setSearchId('');
    setSearchSeller('');
    setSearchBuyer('');
    await loadTransactions({ mode: 'id', id: '', seller: '', buyer: '' });
  };

  return (
    <>
      <AdminHeader title="Financial Overview" subtitle="Overview of all historical financial movements." />
      

      <Card className="border-0 p-4 mb-4 shadow-sm" style={{ backgroundColor: '#192b56', borderRadius: '16px' }}>
        <Card.Body className="p-0">
          <div className="mx-auto" style={{ maxWidth: '850px' }}>
            <Form onSubmit={handleSearchSubmit}>
              <Row className="g-3 align-items-end justify-content-center">

                {searchMode === 'id' ? (
                  <Col xs={12} lg={6}>
                    <Form.Label className="fw-800 small text-uppercase mb-2" style={{ letterSpacing: '0.5px', color: '#CBD5E1' }}>
                      <i className="fa-solid fa-hashtag me-2"></i> Search by ID
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={searchId}
                      onChange={(e) => setSearchId(e.target.value)}
                      placeholder="Type the ID number..."
                      className="py-2 px-3 border-0 shadow-none bg-white"
                      style={{ borderRadius: '12px' }}
                    />
                  </Col>
                ) : (
                  <>
                    <Col xs={12} lg={3}>
                      <Form.Label className="fw-800 small text-uppercase mb-2" style={{ letterSpacing: '0.5px', color: '#CBD5E1' }}>Seller</Form.Label>
                      <Form.Control type="text" value={searchSeller} onChange={(e) => setSearchSeller(e.target.value)} placeholder="Type seller name..." className="py-2 px-3 border-0 shadow-none bg-white" style={{ borderRadius: '12px' }} />
                    </Col>
                    <Col xs={12} lg={3}>
                      <Form.Label className="fw-800 small text-uppercase mb-2" style={{ letterSpacing: '0.5px', color: '#CBD5E1' }}>Buyer</Form.Label>
                      <Form.Control type="text" value={searchBuyer} onChange={(e) => setSearchBuyer(e.target.value)} placeholder="Type buyer name..." className="py-2 px-3 border-0 shadow-none bg-white" style={{ borderRadius: '12px' }} />
                    </Col>
                  </>
                )}

                <Col xs={12} lg={2}>
                  <Form.Label className="fw-800 small text-uppercase mb-2" style={{ letterSpacing: '0.5px', color: '#CBD5E1' }}>Search Mode</Form.Label>
                  <Form.Select
                    value={searchMode}
                    onChange={(e) => setSearchMode(e.target.value as 'id' | 'users')}
                    className="py-2 px-3 border-0 shadow-none bg-white"
                    style={{ borderRadius: '12px' }}
                  >
                    <option value="id">By ID</option>
                    <option value="users">By Users</option>
                  </Form.Select>
                </Col>

                <Col xs={12} md={4} lg={4}>
                  <Stack direction="horizontal" gap={2} className="justify-content-md-end mt-3 mt-md-0">
                    <Button type="submit" variant="primary" className="px-4 py-2 fw-800 border-0 shadow-sm" style={{ borderRadius: '12px' }} disabled={isSearching}>
                      {isSearching ? <><i className="fa-solid fa-spinner fa-spin me-2"></i>...</> : 'Search'}
                    </Button>
                    <Button type="button" className="px-4 py-2 fw-700 border-0"
                      style={{ borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#F8FAFC', transition: 'background-color 0.2s' }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                      onClick={handleClearSearch} disabled={isSearching}
                    >
                      Clear
                    </Button>
                  </Stack>
                </Col>

              </Row>
            </Form>
          </div>
        </Card.Body>
      </Card>

      {/* KPI Row */}
      <Row className="g-3 mb-4">
        <Col xs={12} sm={6} lg={4}>
          <KPICard
            label="Total Volume"
            value={`€${totalAccumulated.toFixed(0)}`}
            color="#059669"
            icon="fa-euro-sign"
            bg={getKPIBg('#059669')}
          />
        </Col>
        <Col xs={12} sm={6} lg={4}>
          <KPICard
            label="Total Transactions"
            value={transactions.length}
            color="#7c3aed"
            icon="fa-credit-card"
            bg={getKPIBg('#7c3aed')}
          />
        </Col>
        <Col xs={12} sm={6} lg={4}>
          <KPICard
            label="Average Transaction"
            value={`€${averageTransaction.toFixed(2)}`}
            color="#f59e0b"
            icon="fa-chart-line"
            bg={getKPIBg('#f59e0b')}
          />
        </Col>
      </Row>

      {/* Table Card */}
      <Card className="clay-card border-0 p-3 mb-5">
        <Card.Body>
          <h5 className="fw-800 text-dark mb-4">Recent Transactions</h5>
          <div style={{ overflowX: 'auto' }}>
            <Table hover responsive className="table-admin mb-0 align-middle">
              <thead>
                <tr>
                  <th>TRX ID</th>
                  <th>DATE</th>
                  <th>PRODUCT</th>
                  <th>BUYER</th>
                  <th>SELLER</th>
                  <th>AMOUNT</th>
                  <th>STATUS</th>
                  <th style={{ width: '50px' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((transaction) => (
                    <tr key={transaction.transactionId}>
                      <td className="text-muted small fw-700">#{transaction.transactionId}</td>
                      <td className="text-muted small fw-600">
                        {transaction.formattedDate || new Date(transaction.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <Stack direction="horizontal" gap={2} className="align-items-center">
                          <Image
                            src={`/api/v1/products/${transaction.product?.id}/image?t=${Date.now()}`}
                            alt={transaction.product?.name}
                            width={36}
                            height={36}
                            rounded
                            style={{ objectFit: 'cover', backgroundColor: '#e5e7eb' }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                          <span className="fw-700 small mb-0">{transaction.product?.name || 'Deleted'}</span>
                        </Stack>
                      </td>
                      <td className="text-muted small fw-600">{transaction.buyer?.name || 'Unknown'}</td>
                      <td className="text-muted small fw-600">{transaction.seller?.name || 'Unknown'}</td>
                      <td className="fw-800 text-success">
                        €{transaction.finalPrice?.toFixed(2)}
                      </td>
                      <td>
                        <Badge
                          bg={transaction.transactionStatus === 'COMPLETED' ? 'success' : 'warning'}
                          text={transaction.transactionStatus === 'COMPLETED' ? 'white' : 'dark'}
                          className="fw-700 px-3 py-2 rounded-pill"
                        >
                          {transaction.transactionStatus === 'COMPLETED' ? '✓ COMPLETED' : 'PENDING'}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          variant="danger"
                          size="sm"
                          className="fw-700 rounded-pill"
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setShowDeleteModal(true);
                            setDeleteError(null);
                          }}
                          title="Delete transaction"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-5 text-muted fw-600">
                      <i className="fa-solid fa-receipt fa-2x mb-3 opacity-50 d-block"></i>
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          {/* Custom Pagination Controls */}
          {totalPages > 1 && (
            <Stack direction="horizontal" className="justify-content-between mt-4 pt-4 border-top">
              <span className="text-muted small fw-600">
                Showing {currentPage * itemsPerPage + 1} to{' '}
                {Math.min((currentPage + 1) * itemsPerPage, transactions.length)} of {transactions.length}
              </span>

              <div className="btn-group gap-1">
                <Button
                  className="fw-800 rounded-3 border-0"
                  style={{
                    background: currentPage === 0 ? '#e5e7eb' : 'linear-gradient(135deg, #2f6ced 0%, #1e479a 100%)',
                    color: currentPage === 0 ? '#9ca3af' : 'white',
                    padding: '8px 14px',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                >
                  <i className="fa-solid fa-chevron-left" />
                </Button>

                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i}
                    className="fw-800 rounded-3 border-0"
                    style={{
                      background: currentPage === i
                        ? 'linear-gradient(135deg, #2f6ced 0%, #1e479a 100%)'
                        : '#f3f4f6',
                      color: currentPage === i ? 'white' : '#4b5563',
                      padding: '8px 16px',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => setCurrentPage(i)}
                  >
                    {i + 1}
                  </Button>
                ))}

                <Button
                  className="fw-800 rounded-3 border-0"
                  style={{
                    background: currentPage === totalPages - 1 ? '#e5e7eb' : 'linear-gradient(135deg, #2f6ced 0%, #1e479a 100%)',
                    color: currentPage === totalPages - 1 ? '#9ca3af' : 'white',
                    padding: '8px 14px',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage === totalPages - 1}
                >
                  <i className="fa-solid fa-chevron-right" />
                </Button>
              </div>
            </Stack>
          )}
        </Card.Body>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => !isDeleting && setShowDeleteModal(false)} centered backdrop={isDeleting ? "static" : true}>
        <Modal.Header closeButton={!isDeleting} className="border-0 pb-0">
          <div className="bg-danger-subtle text-danger rounded-circle d-inline-flex align-items-center justify-content-center me-3" style={{ width: '50px', height: '50px' }}>
            <i className="fa-solid fa-triangle-exclamation fa-lg"></i>
          </div>
        </Modal.Header>
        <Modal.Body className="text-center pt-2">
          <h5 className="fw-800 text-danger mb-3">Confirm Transaction Deletion</h5>
          {selectedTransaction && (
            <div className="mb-4">
              <p className="text-muted fw-600 mb-3">
                Are you sure you want to delete transaction <strong>#{selectedTransaction.transactionId}</strong>?
              </p>
              <Alert variant="info" className="small mb-0">
                <i className="fa-solid fa-info-circle me-2"></i>
                The product will return to <strong>Active</strong> status and seller balance will be adjusted.
              </Alert>
            </div>
          )}
          {deleteError && (
            <Alert variant="danger" className="small mb-3">
              {deleteError}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button
            variant="light"
            className="fw-700 rounded-pill px-4"
            onClick={() => setShowDeleteModal(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            className="fw-700 rounded-pill px-4"
            onClick={async () => {
              if (!selectedTransaction?.transactionId) return;

              setIsDeleting(true);
              setDeleteError(null);

              try {
                await deleteTransaction(selectedTransaction.transactionId);

                // Remove from transactions list
                await loadTransactions();

                setShowDeleteModal(false);
                setSelectedTransaction(null);
              } catch (error: any) {
                setDeleteError(error.response?.data?.message || error.message || 'Failed to delete transaction');
              } finally {
                setIsDeleting(false);
              }
            }}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Deleting...
              </>
            ) : (
              <>
                <i className="fa-solid fa-trash me-2"></i>
                Delete Forever
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

// 4. Error Boundary for load handling
export function ErrorBoundary({ error }: { readonly error: Error }) {
  return (
    <Container className="mt-5">
      <Alert variant="danger" className="clay-card border-0">
        <Alert.Heading className="fw-800">
          <i className="fa-solid fa-triangle-exclamation me-2"></i>Error Loading Transactions!
        </Alert.Heading>
        <p className="fw-600 mb-4">
          {error instanceof Error ? error.message : 'An unexpected error occurred while fetching data.'}
        </p>
        <Button
          variant="outline-danger"
          className="fw-700 rounded-pill px-4"
          onClick={() => (globalThis.location.href = '/')}
        >
          Back to home
        </Button>
      </Alert>
    </Container>
  );
}