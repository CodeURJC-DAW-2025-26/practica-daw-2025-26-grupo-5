import { useState } from 'react';
import { redirect } from 'react-router';
import { Container, Row, Col, Card, Table, Button, Image, Badge, Pagination, Alert, Stack } from 'react-bootstrap';
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

interface KPIData {
  readonly label: string;
  readonly value: string | number;
  readonly color: string;
  readonly icon: string;
}

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

const getKPIBg = (color: string): string => {
  const map: Record<string, string> = {
    '#059669': '#ecfdf5',
    '#7c3aed': '#f3e8ff',
    '#f59e0b': '#fef3c7',
  };
  return map[color] || '#f8fafc';
};

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

  const handlePreviousPage = () => setCurrentPage(Math.max(0, currentPage - 1));
  const handleNextPage = () => setCurrentPage(Math.min(totalPages - 1, currentPage + 1));

  return (
    <>
      <AdminHeader
        title="Global Transactions"
        subtitle="Overview of all historical financial movements."
      />

        {/* KPI Row */}
        <Row className="g-3 mb-4">
          <Col xs={12} sm={6} lg={4}>
            <KPICard label="Total Volume" value={`€${totalAccumulated.toFixed(0)}`} color="#059669" icon="fa-euro-sign" bg={getKPIBg('#059669')} />
          </Col>
          <Col xs={12} sm={6} lg={4}>
            <KPICard label="Total Transactions" value={rowData.length} color="#7c3aed" icon="fa-credit-card" bg={getKPIBg('#7c3aed')} />
          </Col>
          <Col xs={12} sm={6} lg={4}>
            <KPICard label="Average Transaction" value={`€${averageTransaction.toFixed(2)}`} color="#f59e0b" icon="fa-chart-line" bg={getKPIBg('#f59e0b')} />
          </Col>
        </Row>

        {/* Table Card */}
        <Card className="clay-card border-0 p-3">
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
              </Table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <Stack direction="horizontal" className="justify-content-between mt-4 pt-3 border-top">
                <span className="text-muted small fw-600">
                  Showing {currentPage * itemsPerPage + 1} to{' '}
                  {Math.min((currentPage + 1) * itemsPerPage, rowData.length)} of {rowData.length}
                </span>
                
                <div className="btn-group">
                  <Button 
                    className="fw-800 rounded-3 border-0"
                    style={{
                      background: currentPage === 0 ? '#e5e7eb' : 'linear-gradient(135deg, #2f6ced 0%, #1e479a 100%)',
                      color: currentPage === 0 ? '#9ca3af' : 'white',
                      padding: '8px 12px',
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
                        padding: '8px 12px',
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
                      padding: '8px 12px',
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
    </>
  );
}

export function ErrorBoundary({ error }: { readonly error: Error }) {
  return (
    <Container className="mt-5">
      <Alert variant="danger" className="clay-card">
        <Alert.Heading className="fw-800">Error Loading Transactions!</Alert.Heading>
        <p className="fw-600">{error instanceof Error ? error.message : 'An unexpected error occurred'}</p>
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