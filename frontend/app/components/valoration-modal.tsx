import { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import type TransactionDTO from '~/dto/TransactionDTO';

interface ValorationModalProps {
    show: boolean;
    onHide: () => void;
    transaction: TransactionDTO | null;
    onSubmit: (rating: number, comment: string) => Promise<void>;
    isProcessing: boolean;
}

export default function ValorationModal({ show, onHide, transaction, onSubmit, isProcessing }: ValorationModalProps) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");

    if (!transaction) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(rating, comment);
        // Reset local state after submission
        setRating(5);
        setComment("");
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <div className="clay-card p-4 border-0 shadow-lg" style={{ borderRadius: '20px', backgroundColor: 'white' }}>
                <div className="text-center mb-4">
                    <h3 className="fw-800 h5 mb-1 text-primary">Rate your experience</h3>
                    <p className="small text-muted fw-700">
                        {transaction.product.name} &bull; <span className="text-dark">{transaction.finalPrice.toFixed(2)}€</span>
                    </p>
                    <hr className="opacity-10" />
                </div>

                {/* Seller Info Branding */}
                <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-4 mb-4">
                    <img 
                        src={`/api/v1/users/${transaction.seller.id}/profile-photo?t=${Date.now()}`} 
                        className="rounded-circle border border-2 border-white shadow-sm" 
                        width="55" height="55" 
                        style={{ objectFit: 'cover' }} 
                        onError={(e) => (e.currentTarget.src = '/images/profile-photo.png')} 
                        alt="Seller" 
                    />
                    <div>
                        <p className="small fw-800 mb-0">{transaction.seller.name}</p>
                        <div className="d-flex align-items-center gap-1 text-warning small">
                            <i className="fa-solid fa-star"></i>
                            <span className="fw-700 text-dark">{transaction.seller.rating}</span>
                        </div>
                    </div>
                </div>

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3 text-center">
                        <Form.Label className="label-categories mb-3 d-block text-uppercase fw-800">Score (1-5)</Form.Label>
                        <Form.Control 
                            type="number" 
                            min="1" max="5" 
                            value={rating}
                            onChange={(e) => setRating(Number(e.target.value))}
                            className="rounded-pill bg-light border-0 text-center fw-800"
                            required 
                        />
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label className="label-categories mb-2 text-uppercase fw-800">Commentary</Form.Label>
                        <Form.Control 
                            as="textarea" 
                            rows={3} 
                            placeholder="How was the item and the shipping?" 
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="rounded-4 bg-light border-0 p-3 small"
                            required
                        />
                    </Form.Group>

                    <Button type="submit" className="btn-sell w-100 py-3 shadow-sm border-0" disabled={isProcessing}>
                        {isProcessing ? "Submitting..." : "SUBMIT VALORATION"}
                    </Button>
                </Form>
            </div>
        </Modal>
    );
}