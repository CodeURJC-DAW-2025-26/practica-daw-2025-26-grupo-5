import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Button, Badge, Image, Stack, Card, Row, Col, Spinner } from "react-bootstrap";
import { getMyProducts, deleteProduct } from "~/services/products-service";
import ConfirmModal from "~/components/confirm-modal";
import type ProductDTO from "~/dto/ProductDTO";

export default function MyProducts() {
    const [products, setProducts] = useState<ProductDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [idToDelete, setIdToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const priceFormatter = new Intl.NumberFormat('de-DE', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const data = await getMyProducts();
            setProducts(data);
        } catch (error) {
            console.error("Error fetching inventory:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (id: number) => {
        setIdToDelete(id);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (idToDelete === null) return;
        setIsDeleting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            await deleteProduct(idToDelete);
            setProducts(prev => prev.filter(p => p.id !== idToDelete));
            setShowDeleteModal(false);
        } catch (err) {
            console.error("Delete failed:", err);
            alert("Could not delete. The item might be part of an active transaction.");
        } finally {
            setIsDeleting(false);
            setIdToDelete(null);
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center py-5 w-100">
            <Spinner animation="border" variant="primary" />
        </div>
    );

    return (
        <>
            {/* Header */}
            <header className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h1 className="fw-800 h2 text-dark">My Products</h1>
                    <p className="text-muted small fw-600 mb-0">Manage your design inventory and track performance.</p>
                </div>

                {/* AQUÍ ESTÁ LA CORRECCIÓN: Link envolviendo al Button */}
                <Link to="/product/new" className="text-decoration-none">
                    <Button variant="primary" className="fw-700 rounded-pill px-4" style={{ backgroundColor: '#2f6ced', border: 'none' }}>
                        <i className="fa-solid fa-plus me-2"></i>Add Product
                    </Button>
                </Link>

            </header>

            {/* Product List */}
            {products.length > 0 ? (
                <Stack gap={3}>
                    {products.map((product) => (
                        <Card key={product.id} className="clay-card border-0 overflow-hidden">
                            <Card.Body className="p-3">
                                <Row className="align-items-center g-3">
                                    <Col xs={12} md={8}>
                                        <Link to={`/product/${product.id}`} className="text-decoration-none text-dark d-flex align-items-center gap-3">
                                            <Image
                                                src={`/api/v1/products/${product.id}/image?t=${Date.now()}`}
                                                alt={product.name}
                                                rounded
                                                style={{ width: '80px', height: '80px', objectFit: 'cover', backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb' }}
                                                onError={(e) => (e.currentTarget.src = "/images/placeholder.png")}
                                            />
                                            <div>
                                                <h6 className="fw-800 mb-2 text-dark">{product.name}</h6>
                                                <Stack direction="horizontal" gap={3}>
                                                    <span className="text-muted small fw-700 text-uppercase" style={{ letterSpacing: '0.5px' }}>Ref: #ST-0{product.id}</span>
                                                    <Badge bg={product.status === 'Active' ? 'success' : 'danger'} className="fw-700 px-3 py-2 rounded-pill">
                                                        {product.status}
                                                    </Badge>
                                                </Stack>
                                            </div>
                                        </Link>
                                    </Col>

                                    <Col xs={12} md={4} className="d-flex justify-content-md-end align-items-center gap-4">
                                        <div className="d-none d-md-block text-end">
                                            <h4 className="fw-800 mb-0 text-primary">
                                                {priceFormatter.format(product.price)}€
                                            </h4>
                                        </div>
                                        <Stack direction="horizontal" gap={2}>
                                            <Link to={`/product/${product.id}/edit`} className="text-decoration-none">
                                                <Button variant="outline-secondary" size="sm" className="d-flex align-items-center justify-content-center border-0 bg-light" style={{ width: '40px', height: '40px', padding: '0', borderRadius: '8px' }} title="Edit product">
                                                    <i className="fa-solid fa-pen-to-square text-secondary"></i>
                                                </Button>
                                            </Link>
                                            <Button variant="outline-danger" size="sm" className="d-flex align-items-center justify-content-center border-0" style={{ width: '40px', height: '40px', padding: '0', borderRadius: '8px', backgroundColor: '#fef2f2' }} onClick={() => handleDeleteClick(product.id)} title="Delete product">
                                                <i className="fa-solid fa-trash-can text-danger"></i>
                                            </Button>
                                        </Stack>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    ))}
                </Stack>
            ) : (
                <Card className="clay-card border-0">
                    <Card.Body className="text-center py-5 opacity-50">
                        <i className="fa-solid fa-box-open fa-3x mb-3 text-muted"></i>
                        <h5 className="fw-800 text-dark">Empty inventory</h5>
                        <p className="text-muted fw-600 mb-0">You haven't uploaded any products yet.</p>
                    </Card.Body>
                </Card>
            )}

            {/* Confirmation Modal */}
            <ConfirmModal
                show={showDeleteModal}
                title="Remove Treasure"
                message="Are you sure you want to delete this treasure? This action is permanent and cannot be undone."
                confirmText="Delete Forever"
                cancelText="Keep Product"
                variant="danger"
                isLoading={isDeleting}
                onConfirm={handleConfirmDelete}
                onCancel={() => !isDeleting && setShowDeleteModal(false)}
            />
        </>
    );
}