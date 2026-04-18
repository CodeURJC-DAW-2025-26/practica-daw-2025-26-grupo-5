import { useState } from 'react';
import { redirect } from 'react-router';
import { Container, Row, Col, Card, Table, Button, Image, Badge, Pagination, Alert } from 'react-bootstrap';
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

const KPICard = ({ icon, label, value, color }: { icon: string; label: string; value: string | number; color: string }) => (
  <Card className="border-0 h-100" style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.12)', borderRadius: '16px' }}>
    <Card.Body className="text-center p-5">
      <i className={`fa-solid ${icon}`} style={{ fontSize: '2.5rem', color, marginBottom: '12px', display: 'block' }} />
      <p className="text-muted small fw-700 mb-2 text-uppercase" style={{ letterSpacing: '0.5px' }}>{label}</p>
      <h2 className="fw-900 mb-0" style={{ color, fontSize: '2rem' }}>
        {value}
      </h2>
    </Card.Body>
  </Card>
);

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

      <Container fluid className="py-5" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #f0f4f8 100%)', minHeight: '100vh' }}>
        {/* KPI Row */}
        <Row className="g-4 mb-4">
          <Col xs={12} sm={6} lg={4}>
            <KPICard
              icon="fa-euro-sign"
              label="Total Accumulated Volume"
              value={`€${totalAccumulated.toFixed(0)}`}
              color="#059669"
            />
          </Col>
          <Col xs={12} sm={6} lg={4}>
            <KPICard
              icon="fa-credit-card"
              label="Total Transactions"
              value={rowData.length}
              color="#7c3aed"
            />
          </Col>
          <Col xs={12} sm={6} lg={4}>
            <KPICard
              icon="fa-chart-line"
              label="Average Transaction"
              value={`€${averageTransaction.toFixed(2)}`}
              color="#f59e0b"
            />
          </Col>
        </Row>

        {/* Table Card */}
        <Card className="border-0" style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.12)', borderRadius: '16px' }}>
          <Card.Body className="p-4">
            <h5 className="fw-800 mb-4">Recent Transactions</h5>
            <div style={{ overflowX: 'auto' }}>
              <Table hover responsive className="mb-0">
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
                            <Image
                              src={`/api/v1/products/${transaction.product?.id}/image?t=${Date.now()}`}
                              alt={transaction.product?.name}
                              width={32}
                              height={32}
                              rounded
                              style={{ objectFit: 'cover', backgroundColor: '#e5e7eb' }}
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                            <span className="fw-600 small">{transaction.product?.name || 'Deleted'}</span>
                          </div>
                        </td>
                        <td className="text-muted small">{transaction.buyer?.name || 'Unknown'}</td>
                        <td className="text-muted small">{transaction.seller?.name || 'Unknown'}</td>
                        <td className="fw-700 small" style={{ color: '#059669' }}>
                          €{transaction.finalPrice?.toFixed(2)}
                        </td>
                        <td>
                          <Badge
                            bg={transaction.transactionStatus === 'COMPLETED' ? 'success' : 'warning'}
                            text={transaction.transactionStatus === 'COMPLETED' ? 'white' : 'dark'}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-4 pt-3 px-3 border-top">
                <small className="text-muted">
                  Showing {currentPage * itemsPerPage + 1} to{' '}
                  {Math.min((currentPage + 1) * itemsPerPage, rowData.length)} of {rowData.length}
                </small>
                <Pagination className="mb-0">
                  <Pagination.First
                    onClick={() => setCurrentPage(0)}
                    disabled={currentPage === 0}
                  />
                  <Pagination.Prev
                    onClick={handlePreviousPage}
                    disabled={currentPage === 0}
                  />
                  {Array.from({ length: totalPages }, (_, i) => (
                    <Pagination.Item
                      key={i}
                      active={currentPage === i}
                      onClick={() => setCurrentPage(i)}
                    >
                      {i + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages - 1}
                  />
                  <Pagination.Last
                    onClick={() => setCurrentPage(totalPages - 1)}
                    disabled={currentPage === totalPages - 1}
                  />
                </Pagination>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}

export function ErrorBoundary({ error }: { readonly error: Error }) {
  return (
    <Container className="mt-5">
      <Alert variant="danger">
        <Alert.Heading>Error Loading Transactions!</Alert.Heading>
        <p>{error instanceof Error ? error.message : 'An unexpected error occurred'}</p>
        <Button
          variant="outline-danger"
          onClick={() => (globalThis.location.href = '/')}
        >
          Back to home
        </Button>
      </Alert>
    </Container>
  );
}
