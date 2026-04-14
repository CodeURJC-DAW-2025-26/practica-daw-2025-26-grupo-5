import { useState } from "react";
import { Link } from "react-router";
import { Offcanvas, Modal, Button, Form, Badge } from "react-bootstrap";
import type { Route } from "./+types/user-valorations";
import {
    getUserValorations,
    getPendingValorations,
    updateValoration,
    deleteValoration,
    submitValoration
} from "~/services/valorations-service";
import ConfirmModal from "~/components/confirm-modal";
import type ValorationDTO from "~/dto/ValorationDTO";

/**
 * Client-side loader: Pre-fetches the reviews and pending tasks.
 */
export async function clientLoader() {
    try {
        const [completed, pending] = await Promise.all([
            getUserValorations(),
            getPendingValorations()
        ]);
        return { completed, pending };
    } catch (error) {
        console.error("Error loading user valorations:", error);
        return { completed: [], pending: [] };
    }
}

export default function UserValorations({ loaderData }: Route.ComponentProps) {
    // Local state for interactive UI updates
    const [completedReviews, setCompletedReviews] = useState<ValorationDTO[]>(loaderData.completed);
    const [pendingReviews, setPendingReviews] = useState(loaderData.pending);
    
    // UI control states
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Modal data management
    const [editModal, setEditModal] = useState<{ show: boolean; data: ValorationDTO | null }>({ show: false, data: null });
    const [rateModal, setRateModal] = useState<{ show: boolean; data: any }>({ show: false, data: null });
    const [deleteModal, setDeleteModal] = useState<{ show: boolean; id: number | null }>({ show: false, id: null });

    /**
     * Action: Updates an existing feedback record.
     */
    const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editModal.data) return;

        const formData = new FormData(e.currentTarget);
        const id = editModal.data.id;

        setIsProcessing(true);
        try {
            const updated = await updateValoration(id, {
                stars: Number(formData.get("stars")),
                comment: formData.get("comment") as string
            });
            // Update state: replace old record with the updated one
            setCompletedReviews(prev => prev.map(v => v.id === id ? updated : v));
            setEditModal({ show: false, data: null });
        } finally {
            setIsProcessing(false);
        }
    };

    /**
     * Action: Deletes a review via the ConfirmModal.
     */
    const handleConfirmDelete = async () => {
        if (!deleteModal.id) return;
        setIsProcessing(true);
        try {
            await deleteValoration(deleteModal.id);
            // Remove from list instantly for better UX
            setCompletedReviews(prev => prev.filter(v => v.id !== deleteModal.id));
            setDeleteModal({ show: false, id: null });
        } finally {
            setIsProcessing(false);
        }
    };

    /**
     * Action: Creates a new review for a pending transaction.
     */
    const handleRateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const transactionId = rateModal.data.transactionId;

        setIsProcessing(true);
        try {
            const newValoration = await submitValoration({
                transactionId,
                stars: Number(formData.get("stars")),
                comment: formData.get("comment") as string
            });
            // Move item from 'Pending' to 'Completed'
            setPendingReviews(prev => prev.filter((t: any) => t.transactionId !== transactionId));
            setCompletedReviews(prev => [newValoration, ...prev]);
            setRateModal({ show: false, data: null });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="d-flex min-vh-100 bg-light animate-fade-in">
            {/* Sidebar is in user.tsx */}
            {/* Main Content Area */}
            <main className="flex-grow-1 p-4 p-md-5 overflow-auto">
                <header className="d-flex justify-content-between align-items-center mb-5">
                    <div>
                        <h1 className="fw-800 h2">My Valorations</h1>
                        <p className="text-muted small">Manage your feedback and rate your recent purchases.</p>
                    </div>
                </header>

                {/* Section: Submitted Feedback */}
                <section className="mb-5">
                    <div className="d-flex align-items-center justify-content-between mb-4">
                        <h3 className="fw-800 h5 mb-0"><i className="fa-solid fa-check-double me-2"></i>Completed Reviews</h3>
                        <Badge pill bg="dark" className="px-3 py-2 fw-700">Total: {completedReviews.length}</Badge>
                    </div>

                    <div className="d-flex flex-column gap-3">
                        {completedReviews.length > 0 ? (
                            completedReviews.map((val) => (
                                <div key={val.id} className="clay-card p-4 shadow-sm bg-white border-0">
                                    <div className="d-flex justify-content-between mb-3">
                                        <div>
                                            <h6 className="fw-800 mb-0">Review for Order #{val.transactionId}</h6>
                                            <span className="x-small text-muted">Submitted for: <span className="fw-700">{val.buyerName}</span></span>
                                        </div>
                                        <div className="d-flex gap-2">
                                            <button className="btn-about p-2 rounded-3 text-dark border-0" onClick={() => setEditModal({ show: true, data: val })}>
                                                <i className="fa-solid fa-pen-to-square"></i>
                                            </button>
                                            <button className="btn-about p-2 rounded-3 text-danger border-0 bg-white" onClick={() => setDeleteModal({ show: true, id: val.id })}>
                                                <i className="fa-solid fa-trash-can"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="bg-light p-3 rounded-4">
                                        <div className="text-warning mb-2 small">
                                            <i className="fa-solid fa-star"></i> 
                                            <span className="text-dark fw-800 ms-1">{val.stars}/5</span>
                                        </div>
                                        <p className="small text-muted mb-0 italic">"{val.comment}"</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-5 text-center opacity-50 border border-dashed rounded-4">
                                <p className="small fw-700 mb-0">No reviews found in your history.</p>
                            </div>
                        )}
                    </div>
                </section>

                <hr className="my-5 opacity-10" />

                {/* Section: Pending Tasks */}
                <section>
                    <div className="d-flex align-items-center justify-content-between mb-4">
                        <h3 className="fw-800 h5 mb-0 text-primary"><i className="fa-solid fa-clock-rotate-left me-2"></i>Pending for Rating</h3>
                        <Badge pill bg="primary-subtle" className="text-primary px-3 py-2 fw-800 border">Waiting: {pendingReviews.length}</Badge>
                    </div>
                    <div className="d-flex flex-column gap-3 mb-5">
                        {pendingReviews.length > 0 ? (
                            pendingReviews.map((t: any) => (
                                <div key={t.transactionId} className="clay-card p-3 d-flex align-items-center justify-content-between bg-white shadow-sm border-start border-primary border-4">
                                    <div>
                                        <h4 className="fw-800 h6 mb-1">Transaction #{t.transactionId}</h4>
                                        <p className="x-small text-muted mb-0">Order status: <span className="text-success fw-700">Delivered</span></p>
                                    </div>
                                    <button className="btn-sell py-2 px-4 small shadow-sm border-0 d-flex align-items-center gap-2" onClick={() => setRateModal({ show: true, data: t })}>
                                        <i className="fa-solid fa-star"></i> Rate
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center opacity-50 border border-dashed rounded-4">
                                <p className="small fw-700 mb-0">You're all caught up! No pending reviews.</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {/* --- Modals for Editing and Submitting Ratings --- */}
            
            <Modal show={editModal.show} onHide={() => setEditModal({ show: false, data: null })} centered>
                <div className="clay-card modal-content p-4 border-0">
                    <h3 className="fw-800 h5 mb-4 text-primary text-center">Edit Feedback</h3>
                    <Form onSubmit={handleEditSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-700 small">RATING</Form.Label>
                            <Form.Control type="number" name="stars" min="1" max="5" defaultValue={editModal.data?.stars} className="rounded-pill bg-light border-0 text-center fw-800" required />
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-700 small">YOUR EXPERIENCE</Form.Label>
                            <Form.Control as="textarea" name="comment" rows={3} defaultValue={editModal.data?.comment} className="rounded-4 bg-light border-0 p-3" required />
                        </Form.Group>
                        <Button type="submit" className="btn-sell w-100 py-3 border-0" disabled={isProcessing}>
                            {isProcessing ? "Saving..." : "Update Review"}
                        </Button>
                    </Form>
                </div>
            </Modal>

            <Modal show={rateModal.show} onHide={() => setRateModal({ show: false, data: null })} centered>
                <div className="clay-card modal-content p-4 border-0">
                    <h3 className="fw-800 h5 mb-4 text-primary text-center">Rate Purchase</h3>
                    <Form onSubmit={handleRateSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-700 small text-center d-block">STARS</Form.Label>
                            <Form.Control type="number" name="stars" min="1" max="5" defaultValue="5" className="rounded-pill bg-light border-0 text-center fw-800" required />
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-700 small">COMMENT</Form.Label>
                            <Form.Control as="textarea" name="comment" rows={3} placeholder="How was the product and delivery?" className="rounded-4 bg-light border-0 p-3" required />
                        </Form.Group>
                        <Button type="submit" className="btn-sell w-100 py-3 border-0" disabled={isProcessing}>
                            {isProcessing ? "Submitting..." : "Submit Feedback"}
                        </Button>
                    </Form>
                </div>
            </Modal>

            {/* Generic confirmation modal for destructive deletion */}
            <ConfirmModal
                show={deleteModal.show}
                title="Delete Feedback?"
                message="Are you sure? This review will be permanently removed from the seller's profile."
                confirmText="Delete"
                isLoading={isProcessing}
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteModal({ show: false, id: null })}
            />
        </div>
    );
}