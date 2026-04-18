import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getMyProducts, deleteProduct } from "~/services/products-service";
import Loader from "~/components/Loader";
import ConfirmModal from "~/components/confirm-modal"; // As requested
import type ProductDTO from "~/dto/ProductDTO";

/**
 * MyProducts Component
 * Manages the user's personal inventory with specialized deletion feedback.
 */
export default function MyProducts() {
    const [products, setProducts] = useState<ProductDTO[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal and loading states for deletion
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [idToDelete, setIdToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false); // Controls the spinner in ConfirmModal

    const priceFormatter = new Intl.NumberFormat('de-DE', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    /**
     * Fetches user products from the backend.
     */
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

    /**
     * Opens the confirmation modal and prepares the ID.
     */
    const handleDeleteClick = (id: number) => {
        setIdToDelete(id);
        setShowDeleteModal(true);
    };

    /**
     * Executes the deletion with a forced wait time to show the loader.
     */
    const handleConfirmDelete = async () => {
        if (idToDelete === null) return;

        // 1. Start the loading state (shows spinner in modal button)
        setIsDeleting(true);

        try {
            /** * 2. ARTIFICIAL DELAY (Crucial for UX)
             * We force a 1-second wait so the user can actually see the "Deleting..." state.
             */
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 3. Call the actual delete endpoint
            await deleteProduct(idToDelete);
            
            // 4. Update UI: remove the item and close the modal
            setProducts(prev => prev.filter(p => p.id !== idToDelete));
            setShowDeleteModal(false);
        } catch (err) {
            console.error("Delete failed:", err);
            alert("Could not delete. The item might be part of an active transaction.");
        } finally {
            // 5. Clean up states
            setIsDeleting(false);
            setIdToDelete(null);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <header className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h1 className="fw-800 h2">My Products</h1>
                    <p className="text-muted small">Manage your design inventory and track performance.</p>
                </div>

                <Link to="/product/new" className="btn-sell py-2 px-4 shadow-sm text-decoration-none d-flex align-items-center" style={{ borderRadius: '12px' }}>
                    <i className="fa-solid fa-plus me-2"></i>Add Product
                </Link>
            </header>

            {/* Product List */}
            <div className="d-flex flex-column gap-3">
                {products.map((product) => (
                    <div key={product.id} className="clay-card p-3 d-flex align-items-center justify-content-between flex-wrap gap-3">

                        <Link to={`/product/${product.id}`} className="d-flex align-items-center gap-4 text-decoration-none text-dark flex-grow-1">
                            <div className="product-img-preview rounded-4 bg-white d-flex align-items-center justify-content-center overflow-hidden shadow-inner"
                                style={{ width: '80px', height: '80px', border: '1px solid #f1f4f8', flexShrink: 0 }}>
                                <img
                                    src={`/api/v1/products/${product.id}/image?t=${Date.now()}`}
                                    alt={product.name}
                                    className="img-fluid"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => (e.currentTarget.src = "/images/placeholder.png")}
                                />
                            </div>

                            <div>
                                <h4 className="fw-800 h6 mb-1">{product.name}</h4>
                                <div className="d-flex align-items-center gap-3">
                                    <span className="x-small text-muted fw-600">Ref: #ST-0{product.id}</span>
                                    <span className={`badge rounded-pill x-small px-3 fw-700 ${product.status === 'Active' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                                        {product.status}
                                    </span>
                                </div>
                            </div>
                        </Link>

                        <div className="d-flex align-items-center gap-4">
                            <div className="text-end d-none d-md-block">
                                <p className="fw-800 h5 mb-0" style={{ color: '#3b82f6' }}>
                                    {priceFormatter.format(product.price)}€
                                </p>
                            </div>

                            <div className="d-flex gap-2">
                                <Link to={`/product/${product.id}/edit`} className="btn-about p-2 rounded-3 text-dark text-decoration-none shadow-sm d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                    <i className="fa-solid fa-pen-to-square"></i>
                                </Link>

                                <button
                                    onClick={() => handleDeleteClick(product.id)}
                                    className="btn-about p-2 rounded-3 text-danger border-0 bg-white shadow-sm d-flex align-items-center justify-content-center"
                                    style={{ width: '40px', height: '40px' }}
                                >
                                    <i className="fa-solid fa-trash-can"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {products.length === 0 && (
                    <div className="text-center py-5 opacity-50">
                        <i className="fa-solid fa-box-open fa-3x mb-3"></i>
                        <p className="fw-700">Empty inventory.</p>
                    </div>
                )}
            </div>

            {/* 3. CONFIRMATION MODAL INTEGRATION */}
            <ConfirmModal 
                show={showDeleteModal}
                title="Remove Treasure"
                message="Are you sure you want to delete this treasure? This action is permanent and cannot be undone."
                confirmText="Delete Forever"
                cancelText="Keep Product"
                variant="danger"
                isLoading={isDeleting} // Passes the loading state to show the spinner
                onConfirm={handleConfirmDelete}
                onCancel={() => !isDeleting && setShowDeleteModal(false)} // Prevents closing while loading
            />
        </div>
    );
}