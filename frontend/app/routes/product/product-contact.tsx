import { useNavigate, useLocation, useParams } from "react-router";
import { useActionState } from "react";
import { sendInquiry } from "~/services/products-service";
import { Alert, Button, Container } from "react-bootstrap";
import { useUserStore } from "~/stores/useUserStore";

export default function ContactSellerPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const productName = location.state?.productName as string;
    const { user } = useUserStore(); 

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
                    Back to Product
                </Button>
            </Container>
        );
    }

    return (
        <Container className="py-5" style={{ maxWidth: "600px" }}>
            {/* Header */}
            <div className="mb-4">
                <button
                    className="btn btn-link text-muted text-decoration-none fw-700 px-0 mb-3"
                    onClick={() => navigate(-1)}
                >
                    <i className="fa-solid fa-arrow-left me-2"></i>Back
                </button>
                <h1 className="fw-800 h3">Contact Seller</h1>
                <p className="text-muted fw-600">
                    About: <span className="text-dark fw-700">{productName}</span>
                </p>
            </div>

            <div className="clay-card p-4 bg-white">
                <form action={formAction}>
                    {/* Tipo de consulta */}
                    <div className="mb-3">
                        <label className="form-label fw-700 small">Inquiry Type</label>
                        <select name="type" className="form-select fw-600" required>
                            <option value="">Select a reason...</option>
                            <option value="INFO">Request more information</option>
                            <option value="PRICE">Negotiate price</option>
                            <option value="VISIT">Arrange a visit</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>

                    {/* Teléfono */}
                    <div className="mb-3">
                        <label className="form-label fw-700 small">Your Phone Number</label>
                        <input
                            type="tel"
                            name="phone"
                            className="form-control fw-600"
                            placeholder="+34 600 000 000"
                            required
                        />
                    </div>

                    {/* Mensaje */}
                    <div className="mb-4">
                        <label className="form-label fw-700 small">Message</label>
                        <textarea
                            name="message"
                            className="form-control fw-600"
                            rows={5}
                            placeholder="Write your message to the seller..."
                            required
                        />
                    </div>

                    {state?.error && (
                        <Alert variant="danger" className="mb-3">{state.error}</Alert>
                    )}

                    <div className="d-grid">
                        <button
                            type="submit"
                            className="btn-sell py-3 fw-800 rounded-pill border-0"
                            disabled={isPending}
                        >
                            {isPending
                                ? <><i className="fa-solid fa-spinner fa-spin me-2"></i>Sending...</>
                                : <><i className="fa-regular fa-comment-dots me-2"></i>Send Message</>
                            }
                        </button>
                    </div>
                </form>
            </div>
        </Container>
    );
}