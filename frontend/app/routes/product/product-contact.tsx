import { useNavigate, useLocation, useParams, Navigate } from "react-router";
import { useActionState, useState } from "react";
import { Alert, Button, Container, Row, Col, Image } from "react-bootstrap";
import { sendInquiry, getProductImageUrl } from "~/services/products-service";
import { useUserStore } from "~/stores/useUserStore";

export default function ContactSellerPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useUserStore();
    const [state, formAction, isPending] = useActionState(contactAction, null);

    const productId = Number(id);
    const productName = location.state?.productName || "Product";
    const productPrice = location.state?.price ?? "0.00 €";
    const sellerName = location.state?.sellerName || "Seller";
    const productImageUrl = location.state?.productImageUrl || getProductImageUrl(productId);

    const [messageError, setMessageError] = useState("");
    const [phoneError, setPhoneError] = useState("");

    const sellerId = location.state?.sellerId;

    // SECURITY GUARD 1: Redirect unauthenticated users
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // SECURITY GUARD 2 & 3: Prevent self-contact and handle empty state
    if (user.id === sellerId || !location.state) {
        return <Navigate to={`/product/${id}`} replace />;
    }

    // Input validation
    const validateMessage = (value: string) => {
        const htmlRegex = /<\/?[a-z][\s\S]*>/i;
        if (value.trim().length < 20) {
            setMessageError("Message is too short (min. 20 chars).");
        } else if (value.trim().length > 150) {
            setMessageError("Message is too long (max. 150 chars).");
        } else if (htmlRegex.test(value)) {
            setMessageError("HTML tags are not allowed.");
        } else {
            setMessageError("");
        }
    };

    const validatePhone = (value: string) => {
        const htmlRegex = /<\/?[a-z][\s\S]*>/i;
        const phoneRegex = /^(\d[\s-]*){9}$/;

        if (value.trim().length === 0) {
            setPhoneError("Phone number is required.");
        } else if (!phoneRegex.test(value)) {
            setPhoneError("Please enter 9 digits.");
        } else if (htmlRegex.test(value)) {
            setPhoneError("HTML tags are not allowed.");
        } else {
            setPhoneError("");
        }
    };

    // Server action logic
    async function contactAction(
        prevState: { success: boolean; error: string | null } | null,
        formData: FormData
    ) {
        const phone = formData.get("phone") as string;
        const type = formData.get("type") as string;
        const message = formData.get("message") as string;

        if (messageError || phoneError || !phone || !message) {
            return { success: false, error: "Please fix the errors in the form before sending." };
        }

        try {
            await sendInquiry({
                productId,
                phone,
                type,
                message,
            });
            return { success: true, error: null };
        } catch (error) {
            return { success: false, error: "Failed to send message. Please try again." };
        }
    }

    // Success View
    if (state?.success) {
        return (
            <div className="bg-light d-flex align-items-center justify-content-center w-100" style={{ minHeight: 'calc(100vh - 80px)' }}>
                <Container className="text-center">
                    <div className="bg-white p-5 rounded-4 shadow-sm mx-auto d-flex flex-column align-items-center justify-content-center" style={{ maxWidth: '500px' }}>
                        <i className="fa-solid fa-circle-check fa-4x text-success mb-4"></i>
                        <h2 className="fw-800 mb-2">Message Sent!</h2>
                        <p className="text-muted fw-600 mb-4">
                            The seller will get back to you soon.
                        </p>
                        <Button
                            variant="primary"
                            className="rounded-pill px-5 py-2 fw-700 shadow-sm"
                            onClick={() => navigate(`/product/${id}`)}
                        >
                            Back to product
                        </Button>
                    </div>
                </Container>
            </div>
        );
    }

    // Main View
    return (
        <div className="min-vh-100 bg-light py-4 py-md-5">
            <Container>
                {/* Main Container - Removed clay-card to avoid unwanted hover effects */}
                <div className="bg-white border-0 shadow-lg overflow-hidden mx-auto rounded-4" style={{ maxWidth: "1100px" }}>
                    <Row className="g-0">
                        
                        {/* LEFT COLUMN: Original Design Maintained exactly as requested */}
                        <Col md={5} className="p-4 p-md-5 border-end bg-white">
                            <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-2 mb-3">
                                New inquiry
                            </span>

                            <div className="mb-4">
                                <Image
                                    src={productImageUrl}
                                    alt={productName}
                                    className="img-fluid rounded-4 mb-3 w-100"
                                    style={{
                                        objectFit: "contain",
                                        height: "240px",
                                        backgroundColor: "#f8fafc",
                                    }}
                                    onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).src = '/images/no-product-image.png';
                                    }}
                                />
                                <h2 className="fw-800 h4 mb-1">{productName}</h2>
                                <p className="text-primary fw-800 h5 mb-0">
                                    {typeof productPrice === "number"
                                        ? `${productPrice.toFixed(2)} €`
                                        : productPrice}
                                </p>
                            </div>

                            <div className="d-flex align-items-center p-3 bg-light rounded-4 mb-4">
                                <div className="bg-white rounded-circle p-2 me-3 shadow-sm d-flex align-items-center justify-content-center" style={{ width: '44px', height: '44px' }}>
                                    <i className="fa-solid fa-user text-muted"></i>
                                </div>
                                <div>
                                    <small className="text-muted d-block small text-uppercase">Seller</small>
                                    <span className="fw-800">{sellerName}</span>
                                </div>
                            </div>

                            <div className="small text-muted">
                                <p className="mb-1"><i className="fa-solid fa-circle-check text-success me-2"></i> Your message will be sent through the platform.</p>
                                <p className="mb-0"><i className="fa-solid fa-circle-check text-success me-2"></i> Response time: usually less than 24 hours.</p>
                            </div>
                        </Col>

                        {/* RIGHT COLUMN: Intuitive Form Design */}
                        <Col md={7} className="p-4 p-md-5 bg-white position-relative">
                            
                            <div className="d-flex justify-content-between align-items-start mb-5">
                                <div>
                                    <h3 className="fw-800 h3 m-0 text-dark">Contact Seller</h3>
                                    <p className="text-muted fw-500 mt-1 mb-0">Complete the form below to send your inquiry.</p>
                                </div>
                                <span className="badge bg-dark text-white rounded-pill px-3 py-2 fw-700 d-none d-sm-inline-block shadow-sm">
                                    <i className="fa-solid fa-lock me-2"></i> Secure form
                                </span>
                            </div>

                            <form action={formAction}>
                                <Row className="g-4 mb-4">
                                    {/* Intuitive Input Fields with solid background and clear borders */}
                                    <Col md={6}>
                                        <label className="form-label fw-800 text-dark">Phone Number</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-light-subtle text-muted px-3">
                                                <i className="fa-solid fa-phone"></i>
                                            </span>
                                            <input
                                                type="tel"
                                                name="phone"
                                                className={`form-control bg-light border-start-0 py-3 fw-500 border-light-subtle ${phoneError ? 'is-invalid border-danger' : ''}`}
                                                placeholder="665 767 877"
                                                onChange={(e) => validatePhone(e.target.value)}
                                                required
                                            />
                                        </div>
                                        {phoneError && <div className="text-danger small mt-2 fw-600"><i className="fa-solid fa-circle-exclamation me-1"></i> {phoneError}</div>}
                                    </Col>

                                    <Col md={6}>
                                        <label className="form-label fw-800 text-dark">Inquiry Type</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-light-subtle text-muted px-3">
                                                <i className="fa-solid fa-tag"></i>
                                            </span>
                                            <select name="type" className="form-select bg-light border-start-0 py-3 fw-500 border-light-subtle text-dark" required>
                                                <option value="GENERAL">General question</option>
                                                <option value="INFO">Request info</option>
                                                <option value="PRICE">Negotiate</option>
                                            </select>
                                        </div>
                                    </Col>
                                </Row>

                                <div className="mb-5">
                                    <label className="form-label fw-800 text-dark">Message</label>
                                    <textarea
                                        name="message"
                                        className={`form-control bg-light border-light-subtle p-4 fw-500 ${messageError ? 'is-invalid border-danger' : ''}`}
                                        rows={5}
                                        placeholder={`Hi ${sellerName}, is this still available?`}
                                        onChange={(e) => validateMessage(e.target.value)}
                                        required
                                    />
                                    {messageError && <div className="text-danger small mt-2 fw-600"><i className="fa-solid fa-circle-exclamation me-1"></i> {messageError}</div>}
                                </div>

                                {state?.error && (
                                    <Alert variant="danger" className="mb-4 rounded-3 border-0 fw-600">
                                        <i className="fa-solid fa-triangle-exclamation me-2"></i>{state.error}
                                    </Alert>
                                )}

                                <div className="d-flex flex-column flex-sm-row gap-3 justify-content-end mt-4 pt-3 border-top">
                                    <Button
                                        type="button"
                                        variant="light"
                                        className="rounded-pill px-5 py-3 fw-800 text-muted border border-light-subtle"
                                        onClick={() => navigate(-1)}
                                        disabled={isPending}
                                    >
                                        Cancel
                                    </Button>
                                    
                                    <Button
                                        type="submit"
                                        className="btn-sell rounded-pill px-5 py-3 fw-800 border-0 d-flex align-items-center justify-content-center gap-2"
                                        disabled={isPending || !!phoneError || !!messageError}
                                    >
                                        {isPending ? (
                                            <><i className="fa-solid fa-spinner fa-spin"></i> Sending...</>
                                        ) : (
                                            <><i className="fa-solid fa-paper-plane"></i> Send inquiry</>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </Col>
                    </Row>
                </div>
            </Container>
        </div>
    );
}