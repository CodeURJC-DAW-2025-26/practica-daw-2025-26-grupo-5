import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Container, Button, Badge, Image, Stack, ListGroup } from "react-bootstrap";
import { getMyProducts, deleteProduct } from "~/services/products-service";
import Loader from "~/components/Loader";
import ConfirmModal from "~/components/confirm-modal";
import type ProductDTO from "~/dto/ProductDTO";

/**
 * MyProducts Component
 * Manages the user's personal inventory with specialized deletion feedback.
 */
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

    if (loading) return <Loader />;

    return (
        <Container className="py-4 animate-fade-in">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h1 className="fw-800 mb-1">My Products</h1>
                    <p className="text-muted small mb-0">Manage your design inventory and track performance.</p>
                </div>
                <Link to="/product/new" className="text-decoration-none">
                    <Button variant="primary" className="fw-600 d-flex align-items-center gap-2">
                        <i className="fa-solid fa-plus"></i>
                        Add Product
                    </Button>
                </Link>
            </div>

            {/* Product List */}
            {products.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="d-flex align-items-center justify-content-between flex-wrap gap-3 p-3"
                            style={{
                                backgroundColor: '#fff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                            }}
                        >
                            {/* Product Info */}
                            <Link
                                to={`/product/${product.id}`}
                                className="d-flex align-items-center gap-4 text-decoration-none text-dark flex-grow-1"
                                style={{ minWidth: '0' }}
                            >
                                {/* Product Image */}
                                <Image
                                    src={`/api/v1/products/${product.id}/image?t=${Date.now()}`}
                                    alt={product.name}
                                    rounded
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        objectFit: 'cover',
                                        flexShrink: 0,
                                        backgroundColor: '#f3f4f6',
                                        border: '1px solid #e5e7eb'
                                    }}
                                    onError={(e) => (e.currentTarget.src = "/images/placeholder.png")}
                                />

                                {/* Product Details */}
                                <div style={{ minWidth: '0' }}>
                                    <h6 className="fw-800 mb-2">{product.name}</h6>
                                    <Stack direction="horizontal" gap={3} className="flex-wrap">
                                        <small className="text-muted fw-600">
                                            Ref: #ST-0{product.id}
                                        </small>
                                        <Badge
                                            bg={product.status === 'Active' ? 'success' : 'danger'}
                                            className="px-3 py-2"
                                        >
                                            {product.status}
                                        </Badge>
                                    </Stack>
                                </div>
                            </Link>

                            {/* Price & Actions */}
                            <div className="d-flex align-items-center gap-4">
                                {/* Price - Hidden on small screens */}
                                <div className="d-none d-md-block text-end">
                                    <p className="fw-800 mb-0" style={{ color: '#3b82f6', fontSize: '18px' }}>
                                        {priceFormatter.format(product.price)}€
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <Stack direction="horizontal" gap={2}>
                                    <Link to={`/product/${product.id}/edit`} className="text-decoration-none">
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            className="d-flex align-items-center justify-content-center"
                                            style={{ width: '40px', height: '40px', padding: '0' }}
                                            title="Edit product"
                                        >
                                            <i className="fa-solid fa-pen-to-square"></i>
                                        </Button>
                                    </Link>

                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        className="d-flex align-items-center justify-content-center"
                                        style={{ width: '40px', height: '40px', padding: '0' }}
                                        onClick={() => handleDeleteClick(product.id)}
                                        title="Delete product"
                                    >
                                        <i className="fa-solid fa-trash-can"></i>
                                    </Button>
                                </Stack>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-5" style={{ opacity: '0.5' }}>
                    <i className="fa-solid fa-box-open fa-3x mb-3"></i>
                    <p className="fw-700">Empty inventory.</p>
                </div>
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
        </Container>
    );
}