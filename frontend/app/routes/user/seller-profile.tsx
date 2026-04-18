import { getUserProfile } from "~/services/user-service";
import type { Route } from "./+types/seller-profile";
import { Link } from "react-router";
import { useState } from "react";

// we need the seller id; we use { params }: Route.ClientLoaderArgs
export async function clientLoader({ params }: Route.ClientLoaderArgs) {
    const sellerId = params.id;
    const seller = await getUserProfile(sellerId);

    //seller object includes user, his products and his valorations
    return seller;
}

export default function SellerProfile({ loaderData }: Route.ComponentProps) {
    const { seller, products, valorations, fullStars, owner } = loaderData;
    const [activeTab, setActiveTab] = useState("items");

    return (
        <main className="flex-grow-1">
            <div className="container pt-5 pb-4">
                {/* Hero Card of the seller */}
                <div className="seller-hero-card p-4 p-md-5 shadow-sm bg-white" style={{ borderRadius: "24px" }}>
                    <div className="row align-items-center g-4">
                        <div className="col-md-auto text-center text-md-start">
                            <img
                                src={`/api/v1/users/${seller.id}/profile-photo?t=${Date.now()}`}
                                alt={seller.name}
                                className="rounded-circle border border-4 border-white shadow-sm"
                                width="125" height="125"
                                style={{ objectFit: "cover" }}
                                onError={(e) => { (e.target as HTMLImageElement).src = '/assets/no-profile-picture.png' }}
                            />
                        </div>
                        <div className="col-md text-center text-md-start">
                            <span className="x-small fw-800 text-uppercase text-muted mb-1 d-block">Verified Seller</span>
                            <h1 className="fw-800 display-6 mb-3 text-dark">{seller.name}</h1>
                            <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-3">
                                <div className="stat-pill px-3 py-2 bg-light rounded-pill">
                                    <span className="fw-800 text-primary">{seller.rating}</span>
                                    <span className="x-small fw-700 text-muted ms-1">SCORE</span>
                                </div>
                                <div className="stat-pill px-3 py-2 bg-light rounded-pill">
                                    <span className="fw-800 text-primary">{seller.numRatings}</span>
                                    <span className="x-small fw-700 text-muted ms-1">REVIEWS</span>
                                </div>
                            </div>
                        </div>

                        {/* If im the profile user */}
                        {owner && (

                            <div className="col-md-auto ms-auto text-center text-md-end">
                                <Link
                                    to="/user-page"
                                    className="btn btn-outline-dark rounded-pill px-4 py-2 fw-800 x-small shadow-sm transition-hover"
                                >
                                    <i className="fa-solid fa-pen-to-square me-2"></i>
                                    Edit Profile
                                </Link>
                            </div>
                        )}

                    </div>

                    <div className="seller-bio-container mt-4 pt-4 border-top">
                        <span className="x-small fw-800 text-uppercase text-muted mb-2 d-block">Seller's Note</span>
                        <p className="seller-bio-text mb-0" style={{ fontStyle: "italic" }}>
                            {seller.description ? `"${seller.description}"` : `"Curating history and timeless pieces. Proud member of the Stilnovo community."`}
                        </p>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="tab-divider-container my-4">
                <div className="container">
                    <nav className="nav nav-stilnovo-tabs border-bottom" id="sellerTabNav">
                        <button
                            className={`nav-link fw-800 border-0 bg-transparent py-3 ${activeTab === 'items' ? 'active' : ''}`}
                            onClick={() => setActiveTab("items")}>
                            <span>{products.length}</span> Items for Sale
                        </button>
                        <button
                            className={`nav-link fw-800 border-0 bg-transparent py-3 ${activeTab === 'reviews' ? 'active' : ''}`}
                            onClick={() => setActiveTab("reviews")}>
                            <span>{valorations.length}</span> Reviews
                        </button>
                    </nav>
                </div>
            </div>

            <div className="tab-content container py-4">

                {/* Seller products */}
                <div className={`tab-pane fade ${activeTab === 'items' ? 'show active' : ''}`}>
                    <div className="row g-4">
                        {products.length > 0 ? products.map((product: any) => (
                            <div key={product.id} className="col-6 col-md-4 col-lg-3">
                                <Link to={`/product/${product.id}`} className="text-decoration-none">
                                    <div className="clay-card p-2 h-100 shadow-sm border-0 bg-white hover-up">
                                        <div className="rounded-4 overflow-hidden mb-3" style={{ height: "180px", background: "#f8fafc" }}>
                                            <img src={`/api/v1/products/${product.image.id}/image?t=${Date.now()}`} className="img-fluid w-100 h-100" style={{ objectFit: "cover" }} />
                                        </div>
                                        <div className="px-2 pb-2 text-center">
                                            <p className="fw-800 h5 mb-1 text-dark">{product.price}€</p>
                                            <p className="x-small text-muted text-truncate fw-700 mb-0">{product.name}</p>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        )) : (
                            <div className="col-12 text-center py-5">
                                <p className="text-muted">This seller has no active products.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Seller valorations */}
                <div className={`tab-pane fade ${activeTab === 'reviews' ? 'show active' : ''}`}>
                    <div className="mx-auto" style={{ maxWidth: "800px" }}>
                        {valorations.length > 0 ? valorations.map((val: any) => (
                            <div key={val.id} className="clay-card p-4 mb-3 bg-white border-0 shadow-sm animate slideIn">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div className="d-flex align-items-center gap-3">
                                        <img
                                            src={`/api/v1/users/search/profile-photo?name=${encodeURIComponent(val.buyerName)}&t=${Date.now()}`}
                                            alt={val.buyerName}
                                            className="rounded-circle border shadow-sm"
                                            width="45" height="45"
                                            onError={(e) => (e.currentTarget.src = '/images/profile-photo.png')}
                                        />
                                        <div>
                                            <h4 className="fw-800 h6 mb-0">{val.buyerName}</h4>
                                            <div className="d-flex align-items-center gap-1 mt-1" style={{ color: "var(--brand-blue)" }}>
                                                <i className="fa-solid fa-circle-check" style={{ fontSize: "0.8rem" }}></i>
                                                <span className="x-small fw-800 text-uppercase">Verified Purchase</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-warning small d-flex align-items-center gap-1 bg-light px-2 py-1 rounded-pill border">
                                        <i className="fa-solid fa-star"></i>
                                        <span className="fw-800 text-dark">{val.stars}</span>
                                    </div>
                                </div>
                                <p className="small text-muted mb-0 lh-base" style={{ fontStyle: "italic" }}>
                                    "{val.comment}"
                                </p>
                            </div>
                        )) : (
                            <div className="text-center py-5 opacity-50">
                                <i className="fa-solid fa-comments fa-3x mb-3"></i>
                                <p className="fw-800">This seller hasn't received any reviews yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main >
    );
}
