import { useNavigate, useLocation, useParams, Navigate } from "react-router";
import { useActionState } from "react"; 
import { sendInquiry } from "~/services/products-service";
import { useUserStore } from "~/stores/useUserStore";
import { Alert, Button, Container, Row, Col } from "react-bootstrap";

export default function ContactSellerPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useUserStore(); 

    const productName = location.state?.productName || "Producto";
    const productPrice = location.state?.price || "0.00 €";
    const sellerName = location.state?.sellerName || "Vendedor";

    // Global protection: Check if the user is logged, and if he is not redirect him to login page
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    async function contactAction(
        prevState: { success: boolean; error: string | null } | null,
        formData: FormData
    ) {
        const phone = formData.get("phone") as string;
        const type = formData.get("type") as string;
        const message = formData.get("message") as string;

        try {
            await sendInquiry({
            productId: 
                Number(id),
                phone,
                type,
                message,
            });
            return { success: true, error: null };
        } catch (error) {
            return { success: false, error: "Failed to send message. Please try again." };
        }
    }
    const [state, formAction, isPending] = useActionState(contactAction, null);

    // If the delivery has succeced, show confirmation
    if (state?.success) {
        return (
            <Container className="py-5 text-center">
                <i className="fa-solid fa-circle-check fa-4x text-success mb-4"></i>
                <h2 className="fw-800 mb-2">Message Sent!</h2>
                <p className="text-muted fw-600 mb-4">
                    The seller will get back to you soon.
                </p>
                <Button
                    variant="primary"
                    className="rounded-pill px-5 fw-700"
                    onClick={() => navigate(`/product/${id}`)}
                >
                    Back to product
                </Button>
            </Container>
        );
    }

    return (
        <div className="min-vh-100 bg-light py-5">
            <Container>
                {/* Navbar / Back Button */}
                <div className="d-flex align-items-center mb-4">
                    <button className="btn btn-link text-decoration-none text-dark p-0" onClick={() => navigate(-1)}>
                        <i className="fa-solid fa-chevron-left me-2"></i> Back
                    </button>
                    <div className="mx-auto">
                        <img src="/logo-owl.png" alt="Logo" style={{ height: "40px" }} />
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-5 shadow-sm overflow-hidden mx-auto" style={{ maxWidth: "1000px" }}>
                    <Row className="g-0">
                        {/* Left Column: Product Info */}
                        <Col md={5} className="p-5 border-end bg-white">
                            <span className="badge bg-primary-subtle text-primary rounded-pill px-3 mb-3">New Inquiry</span>
                            <div className="mb-4">
                                <img 
                                    src="/car-placeholder.png" 
                                    alt="Product" 
                                    className="img-fluid rounded-4 mb-3 w-100"
                                    style={{ objectFit: "cover", height: "200px" }}
                                />
                                <h2 className="fw-bold h4 mb-1">{productName}</h2>
                                <p className="text-primary fw-bold h5">{productPrice}</p>
                            </div>

                            <div className="d-flex align-items-center p-3 bg-light rounded-4 mb-4">
                                <div className="bg-white rounded-circle p-2 me-3 shadow-sm">
                                    <i className="fa-solid fa-user-ninja text-muted"></i>
                                </div>
                                <div>
                                    <small className="text-muted d-block small">Seller</small>
                                    <span className="fw-bold">{sellerName}</span>
                                </div>
                            </div>

                            <div className="small text-muted">
                                <p className="mb-1"><i className="fa-solid fa-circle-check text-success me-2"></i> Your message will be sent via email</p>
                                <p className="mb-0"><i className="fa-solid fa-circle-check text-success me-2"></i> Response time: ~24 hours</p>
                            </div>
                        </Col>

                        {/* Right Column: Form */}
                        <Col md={7} className="p-5">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h3 className="fw-bold h4 m-0">Complete your Inquiry</h3>
                                <small className="text-muted"><i className="fa-solid fa-lock me-1"></i> Secure Form</small>
                            </div>

                            <form action={formAction}>
                                <Row className="mb-3">
                                    <Col md={6}>
                                        <label className="form-label small fw-bold text-muted text-uppercase">Phone</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-0"><i className="fa-solid fa-phone text-muted"></i></span>
                                            <input type="tel" name="phone" className="form-control bg-light border-0 py-2" placeholder="+34 600 000 000" required />
                                        </div>
                                    </Col>
                                    <Col md={6}>
                                        <label className="form-label small fw-bold text-muted text-uppercase">Inquiry Type</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-0"><i className="fa-solid fa-tag text-muted"></i></span>
                                            <select name="type" className="form-select bg-light border-0 py-2" required>
                                                <option value="GENERAL">General Question</option>
                                                <option value="INFO">Request Info</option>
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
                                            className="form-control bg-light border-0 ps-5 py-3" 
                                            rows={4} 
                                            placeholder={`Hi Mario, is this still available?`}
                                            required
                                        />
                                    </div>
                                </div>

                                {state?.error && <Alert variant="danger">{state.error}</Alert>}

                                <button 
                                    type="submit" 
                                    className="btn btn-primary w-100 py-3 rounded-3 fw-bold shadow-sm d-flex align-items-center justify-content-center"
                                    disabled={isPending}
                                >
                                    {isPending ? (
                                        <><i className="fa-solid fa-spinner fa-spin me-2"></i> Sending...</>
                                    ) : (
                                        <><i className="fa-solid fa-paper-plane me-2"></i> Send Email Inquiry</>
                                    )}
                                </button>
                            </form>
                        </Col>
                    </Row>
                </div>
            </Container>
        </div>
    );
}