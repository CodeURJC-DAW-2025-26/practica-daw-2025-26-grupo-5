import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getMyProducts, deleteProduct } from "~/services/products-service";
import Loader from "~/components/Loader";
import type ProductDTO from "~/dto/ProductDTO";

export default function MyProducts() {
    const [products, setProducts] = useState<ProductDTO[]>([]);
    const [loading, setLoading] = useState(true);

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

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this treasure?")) {
            try {
                await deleteProduct(id);
                setProducts(prev => prev.filter(p => p.id !== id));
            } catch (err) {
                alert("Could not delete. The item might be part of an active order.");
            }
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

                <Link to="/product-new" className="btn-sell py-2 px-4 shadow-sm text-decoration-none d-flex align-items-center" style={{ borderRadius: '12px' }}>
                    <i className="fa-solid fa-plus me-2"></i>Add Product
                </Link>
            </header>

            {/* Stats / Tabs */}
            <div className="d-flex gap-2 mb-5">
                <button className="btn btn-sm btn-dark rounded-pill px-4 fw-700 shadow-sm">
                    All ({products.length})
                </button>
            </div>

            {/* Product List */}
            <div className="d-flex flex-column gap-3">
                {products.map((product) => (
                    <div key={product.id} className="clay-card p-3 d-flex align-items-center justify-content-between flex-wrap gap-3">

                        <Link to={`/info-product/${product.id}`} className="d-flex align-items-center gap-4 text-decoration-none text-dark flex-grow-1">
                            <div className="product-img-preview rounded-4 bg-white d-flex align-items-center justify-content-center overflow-hidden shadow-inner"
                                style={{ width: '80px', height: '80px', border: '1px solid #f1f4f8', flexShrink: 0 }}>
                                <img
                                    src={`/api/v1/products/${product.id}/image`}
                                    alt={product.name}
                                    className="img-fluid"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => (e.currentTarget.src = "/images/placeholder.png")}
                                />
                            </div>

                            <div>
                                <h4 className="fw-800 h6 mb-1">{product.name}</h4>
                                <div className="d-flex align-items-center gap-3 mb-2">
                                    <span className="x-small text-muted fw-600">Ref: #ST-0{product.id}</span>
                                    <span className="x-small text-primary fw-700">
                                        <i className="fa-solid fa-eye me-1"></i>
                                        {product.userInteractions?.length || 0} views
                                    </span>
                                </div>

                                <div className="mb-0">
                                    {/* Mapeo del status del JSON (Active, Sold, etc.) */}
                                    {product.status === "Active" ? (
                                        <span className="badge rounded-pill bg-success-subtle text-success x-small px-3 fw-700">
                                            <i className="fa-solid fa-circle-check me-1"></i> Active
                                        </span>
                                    ) : (
                                        <span className="badge rounded-pill bg-danger-subtle text-danger x-small px-3 fw-700">
                                            <i className="fa-solid fa-circle-xmark me-1"></i> {product.status}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>

                        <div className="d-flex align-items-center gap-4">
                            <div className="text-end d-none d-md-block me-2">
                                <p className="x-small opacity-50 mb-0 fw-800 text-uppercase">Price</p>
                                <p className="fw-800 h5 mb-0" style={{ color: '#3b82f6' }}>
                                    {priceFormatter.format(product.price)}€
                                </p>
                            </div>

                            <div className="d-flex gap-2">
                                <Link to={`/edit-product/${product.id}`} className="btn-about p-2 rounded-3 text-dark text-decoration-none shadow-sm d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                    <i className="fa-solid fa-pen-to-square"></i>
                                </Link>

                                <button
                                    onClick={() => handleDelete(product.id)}
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
                        <p className="fw-700">Your inventory is empty.</p>
                    </div>
                )}
            </div>
        </div>
    );
}