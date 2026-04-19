import { useEffect, useMemo, useState } from "react";
import { redirect } from "react-router";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Image,
  Badge,
  Pagination,
  Alert,
} from "react-bootstrap";
import { deleteTransaction, getAdminTransactions } from "~/services/admin-service";
import type TransactionDTO from "~/dto/TransactionDTO";
import type PagedResponse from "~/dto/PagedResponse";
import AdminHeader from "~/components/admin/AdminHeader";
import ConfirmModal from "~/components/confirm-modal";

export async function clientLoader() {
  try {
    const data = await getAdminTransactions(0, 100);
    return data || {};
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    throw redirect("/login");
  }
}

const KPICard = ({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string | number;
  color: string;
}) => (
  <Card
    className="border-0 h-100"
    style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.12)", borderRadius: "16px" }}
  >
    <Card.Body className="text-center p-5">
      <i
        className={`fa-solid ${icon}`}
        style={{ fontSize: "2.5rem", color, marginBottom: "12px", display: "block" }}
      />
      <p className="text-muted small fw-700 mb-2 text-uppercase" style={{ letterSpacing: "0.5px" }}>
        {label}
      </p>
      <h2 className="fw-900 mb-0" style={{ color, fontSize: "2rem" }}>
        {value}
      </h2>
    </Card.Body>
  </Card>
);

function isCompletedStatus(status?: string) {
  return (status ?? "").trim().toLowerCase() === "completed";
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value ?? 0);
}

export default function AdminTransactions({ loaderData }: { readonly loaderData: any }) {
  const pagedData = loaderData as PagedResponse<TransactionDTO>;
  const transactions = pagedData?.content || [];

  const [rowData, setRowData] = useState<TransactionDTO[]>(transactions);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionDTO | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    setRowData(transactions);
  }, [transactions]);

  const completedTransactions = useMemo(
    () => rowData.filter((transaction) => isCompletedStatus(transaction.transactionStatus)),
    [rowData]
  );

  const totalVolume = useMemo(
    () => completedTransactions.reduce((sum, transaction) => sum + (transaction.finalPrice || 0), 0),
    [completedTransactions]
  );

  const paginatedData = useMemo(
    () => rowData.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage),
    [rowData, currentPage]
  );

  const totalPages = Math.ceil(rowData.length / itemsPerPage);

  useEffect(() => {
    if (currentPage > 0 && currentPage >= totalPages) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [currentPage, totalPages]);

  const handlePreviousPage = () => setCurrentPage(Math.max(0, currentPage - 1));
  const handleNextPage = () => setCurrentPage(Math.min(totalPages - 1, currentPage + 1));

  const handleDeleteClick = (transaction: TransactionDTO) => {
    setSelectedTransaction(transaction);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedTransaction) return;

    setIsDeleting(true);
    try {
      await deleteTransaction(selectedTransaction.transactionId);
      setRowData((prev) =>
        prev.filter((transaction) => transaction.transactionId !== selectedTransaction.transactionId)
      );
      setShowDeleteModal(false);
      setSelectedTransaction(null);
    } catch (error) {
      console.error("Failed to delete transaction:", error);
      alert("Could not delete the transaction.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <AdminHeader
        title="Global Transactions"
        subtitle="Overview of all historical financial movements."
      />

      <Container
        fluid
        className="py-5"
        style={{ background: "linear-gradient(135deg, #f5f7fa 0%, #f0f4f8 100%)", minHeight: "100vh" }}
      >
        <Row className="g-4 mb-4">
          <Col xs={12} sm={6} lg={6}>
            <KPICard
              icon="fa-euro-sign"
              label="Total Volume"
              value={formatMoney(totalVolume)}
              color="#059669"
            />
          </Col>
          <Col xs={12} sm={6} lg={6}>
            <KPICard
              icon="fa-credit-card"
              label="Completed Transactions"
              value={completedTransactions.length}
              color="#7c3aed"
            />
          </Col>
        </Row>

        <Card className="border-0" style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.12)", borderRadius: "16px" }}>
          <Card.Body className="p-4">
            <h5 className="fw-800 mb-4">Recent Transactions</h5>
            <div style={{ overflowX: "auto" }}>
              <Table hover responsive className="mb-0">
                <thead style={{ backgroundColor: "#f5f7fa", borderBottom: "2px solid #e5e7eb" }}>
                  <tr>
                    <th className="text-muted fw-700 small">TRX ID</th>
                    <th className="text-muted fw-700 small">DATE</th>
                    <th className="text-muted fw-700 small">PRODUCT</th>
                    <th className="text-muted fw-700 small">BUYER</th>
                    <th className="text-muted fw-700 small">SELLER</th>
                    <th className="text-muted fw-700 small">AMOUNT</th>
                    <th className="text-muted fw-700 small">STATUS</th>
                    <th className="text-muted fw-700 small">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((transaction) => (
                      <tr key={transaction.transactionId} style={{ borderBottom: "1px solid #e5e7eb" }}>
                        <td className="text-muted small fw-700">#{transaction.transactionId}</td>
                        <td className="text-muted small fw-600">
                          {transaction.formattedDate || new Date(transaction.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <Image
                              src={`/api/v1/products/${transaction.product?.id}/image?t=${Date.now()}`}
                              alt={transaction.product?.name}
                              width={36}
                              height={36}
                              rounded
                              style={{ objectFit: "cover", backgroundColor: "#e5e7eb" }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                            <span className="fw-600 small">{transaction.product?.name || "Deleted"}</span>
                          </div>
                        </td>
                        <td className="text-muted small">{transaction.buyer?.name || "Unknown"}</td>
                        <td className="text-muted small">{transaction.seller?.name || "Unknown"}</td>
                        <td className="fw-700 small" style={{ color: "#059669" }}>
                          {formatMoney(transaction.finalPrice || 0)}
                        </td>
                        <td>
                          <Badge
                            bg={isCompletedStatus(transaction.transactionStatus) ? "success" : "warning"}
                            text={isCompletedStatus(transaction.transactionStatus) ? "white" : "dark"}
                          >
                            {isCompletedStatus(transaction.transactionStatus) ? "✓ COMPLETED" : "PENDING"}
                          </Badge>
                        </td>
                        <td>
                          <Button
                            variant="link"
                            className="p-0 text-danger"
                            onClick={() => handleDeleteClick(transaction)}
                            aria-label={`Delete transaction ${transaction.transactionId}`}
                          >
                            <i className="fa-solid fa-trash" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="text-center py-4 text-muted">
                        No transactions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-4 pt-3 px-3 border-top">
                <small className="text-muted">
                  Showing {currentPage * itemsPerPage + 1} to{" "}
                  {Math.min((currentPage + 1) * itemsPerPage, rowData.length)} of {rowData.length}
                </small>
                <Pagination className="mb-0">
                  <Pagination.First onClick={() => setCurrentPage(0)} disabled={currentPage === 0} />
                  <Pagination.Prev onClick={handlePreviousPage} disabled={currentPage === 0} />
                  {Array.from({ length: totalPages }, (_, i) => (
                    <Pagination.Item key={i} active={currentPage === i} onClick={() => setCurrentPage(i)}>
                      {i + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next onClick={handleNextPage} disabled={currentPage === totalPages - 1} />
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

      <ConfirmModal
        show={showDeleteModal}
        title="Delete Record?"
        message="Are you sure you want to remove this transaction record?"
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setSelectedTransaction(null);
        }}
      />
    </>
  );
}

export function ErrorBoundary({ error }: { readonly error: Error }) {
  return (
    <Container className="mt-5">
      <Alert variant="danger">
        <Alert.Heading>Error Loading Transactions!</Alert.Heading>
        <p>{error instanceof Error ? error.message : "An unexpected error occurred"}</p>
        <Button variant="outline-danger" onClick={() => (globalThis.location.href = "/")}>
          Back to home
        </Button>
      </Alert>
    </Container>
  );
}