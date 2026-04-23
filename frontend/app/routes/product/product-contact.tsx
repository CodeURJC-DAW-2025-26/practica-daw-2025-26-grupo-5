import { useNavigate, useLocation, useParams, Navigate } from "react-router";
import { useActionState, useState } from "react";
import { Alert, Button, Container, Row, Col, Card, Image } from "react-bootstrap";
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

    const [logoSrc, setLogoSrc] = useState('/images/logo.png');

    const [messageError, setMessageError] = useState("");
    const [phoneError, setPhoneError] = useState("");

    const sellerId = location.state?.sellerId;

    // SECURITY GUARD: Redirect unauthenticated users to the login page.
    // IMPORTANT: This early return MUST remain strictly AFTER all React Hooks 
    // (useState, useActionState, etc.) to prevent "Rendered fewer hooks than expected" errors.
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // SECURITY GUARD 2: Prevent the owner from contacting themselves
    // SECURITY GUARD 3: Handle manual URL entry with empty state
    if (user.id === sellerId || !location.state) {
        return <Navigate to={`/product/${id}`} replace />;
    }

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

    return (
        <div className="min-vh-100 bg-light py-4 py-md-5">
            <Container>

                <Card className="clay-card border-0 shadow-sm overflow-hidden mx-auto" style={{ maxWidth: "1100px" }}>
                    <Card.Body className="p-0">
                        <Row className="g-0">
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

                            <Col md={7} className="p-4 p-md-5 bg-white">
                                <div className="d-flex justify-content-between align-items-start mb-4">
                                    <div>
                                        <h3 className="fw-800 h4 m-0">Contact seller</h3>
                                        <p className="text-muted mb-0">Complete the form below to send your inquiry.</p>
                                    </div>
                                    <span className="badge bg-dark rounded-pill px-3 py-2 fw-700">
                                        <i className="fa-solid fa-lock me-2"></i> Secure form
                                    </span>
                                </div>

                                <form action={formAction}>
                                    <Row className="g-3 mb-3">
                                        <Col md={6}>
                                            <label className="form-label small fw-bold text-muted text-uppercase">Phone</label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light border-0">
                                                    <i className="fa-solid fa-phone text-muted"></i>
                                                </span>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    className={`form-control bg-light border-0 py-2 ${phoneError ? 'is-invalid' : ''}`}
                                                    placeholder="665 767 877"
                                                    onChange={(e) => validatePhone(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            {/* Mensaje de error (Añadido) */}
                                            {phoneError && <div className="text-danger small mt-1">{phoneError}</div>}
                                        </Col>
                                        <Col md={6}>
                                            <label className="form-label small fw-bold text-muted text-uppercase">Inquiry Type</label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light border-0">
                                                    <i className="fa-solid fa-tag text-muted"></i>
                                                </span>
                                                <select name="type" className="form-select bg-light border-0 py-2" required>
                                                    <option value="GENERAL">General question</option>
                                                    <option value="INFO">Request info</option>
                                                    <option value="PRICE">Negotiate</option>
                                                </select>
                                            </div>
                                        </Col>
                                    </Row>

                                    <div className="mb-4">
                                        <label className="form-label small fw-bold text-muted text-uppercase">Message</label>
                                        <div className="position-relative">
                                            <i className="fa-solid fa-comment position-absolute text-muted" style={{ left: '12px', top: '15px' }}></i>
                                            <textarea
                                                name="message"
                                                className={`form-control bg-light border-0 ps-5 py-3 ${messageError ? 'is-invalid' : ''}`}
                                                rows={5}
                                                placeholder={`Hi ${sellerName}, is this still available?`}
                                                onChange={(e) => validateMessage(e.target.value)}
                                                required
                                            />
                                        </div>
                                        {/* Mensaje de error (Añadido) */}
                                        {messageError && <div className="text-danger small mt-1">{messageError}</div>}
                                    </div>

                                    {state?.error && <Alert variant="danger" className="mb-4">{state.error}</Alert>}

                                    <div className="d-flex gap-3 justify-content-end">
                                        <Button
                                            type="button"
                                            variant="light"
                                            className="rounded-pill px-4 fw-700"
                                            onClick={() => navigate(-1)}
                                            disabled={isPending}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            className="rounded-pill px-4 fw-700"
                                            disabled={isPending || !!phoneError || !!messageError} /* Desactiva si hay errores */
                                        >
                                            {isPending ? (
                                                <>
                                                    <i className="fa-solid fa-spinner fa-spin me-2"></i> Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fa-solid fa-paper-plane me-2"></i> Send inquiry
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
}