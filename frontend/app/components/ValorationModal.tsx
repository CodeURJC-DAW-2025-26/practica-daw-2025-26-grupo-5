/**
 * Valoration (Rating) Modal Component
 *
 * Modal dialog for submitting transaction reviews and seller ratings.
 * Allows buyers to rate sellers and leave feedback after purchase.
 *
 * Features:
 * - Star rating (1-5 scale)
 * - Text comment for detailed feedback
 * - Displays product name and final price
 * - Shows seller profile information:
 *    - Seller name
 *    - Current rating
 *    - Profile photo with fallback
 * - Submit button with loading state
 * - Modal closes on cancel
 * - Form resets after submission
 * - Accessibility features (form labels, required fields)
 *
 * Props:
 * - show: Boolean controlling modal visibility
 * - onHide: Callback when modal closes
 * - transaction: TransactionDTO with product/seller/price data
 * - onSubmit: Callback when form submitted (rating, comment)
 * - isProcessing: Boolean for loading state during submission
 *
 * Data Display:
 * - Product name from transaction.product.name
 * - Final price from transaction.finalPrice
 * - Seller name from transaction.seller.name
 * - Seller rating from transaction.seller.rating
 * - Seller photo URL constructed from transaction.seller.id
 *
 * Form Fields:
 * - Rating: Number input, 1-5, default 5
 * - Comment: Textarea, placeholder prompts about item and shipping
 * - Both fields required
 *
 * Image Fallback:
 * - Attempts to load seller profile photo
 * - Falls back to default /images/profile-photo.png if error
 * - Uses onError handler for fallback
 * - Photo URL includes cache buster (Date.now())
 *
 * Styling:
 * - Clay-card styling with shadow
 * - Rounded corners (20px)
 * - Light background for seller info
 * - Centered form layout
 * - Blue primary color for heading
 *
 * State Reset:
 * - Rating resets to 5 after submission
 * - Comment clears after submission
 * - Parent component handles modal close
 *
 * @component
 * @param {ValorationModalProps} props - Modal configuration
 * @returns React component for rating modal
 */

import { useState, useEffect } from 'react';
import { Modal, Form, Button, Stack, Spinner } from 'react-bootstrap';
import type TransactionDTO from '~/dto/TransactionDTO';

interface ValorationModalProps {
    show: boolean;
    onHide: () => void;
    transaction: TransactionDTO | null;
    onSubmit: (rating: number, comment: string) => Promise<void>;
    isProcessing: boolean;
    initialData?: { rating: number; comment: string } | null;
}

export default function ValorationModal({ show, onHide, transaction, onSubmit, isProcessing, initialData }: ValorationModalProps) {
    const [rating, setRating] = useState(5);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState("");

    const MIN_CHARS = 15;

    useEffect(() => {
        if (initialData) {
            setRating(initialData.rating);
            setComment(initialData.comment);
        } else {
            setRating(5);
            setComment("");
        }
    }, [initialData, show]);

    if (!transaction) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (comment.length < MIN_CHARS) return;
        await onSubmit(rating, comment);
        // We don't reset here manually if the parent handles closing/unmounting, 
        // but it doesn't hurt.
    };

    const getEditorialTip = () => {
        if (comment.length === 0) return "Describe product quality and seller communication.";
        if (comment.length < MIN_CHARS) return `Minimum ${MIN_CHARS - comment.length} more characters required.`;
        if (comment.length < 40) return "Add details about shipping speed for a better review.";
        return "Excellent. This detailed feedback strengthens our community.";
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            contentClassName="border-0 bg-transparent shadow-none"
        >
            <div className="p-4" style={{ borderRadius: '24px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                <header className="text-center mb-4">
                    <span className="badge rounded-pill bg-light text-primary fw-800 px-3 py-2 mb-3" style={{ fontSize: '10px', letterSpacing: '0.8px' }}>
                        VALORATION SYSTEM
                    </span>
                    <h3 className="fw-800 h5 mb-1 text-dark">Submit Experience</h3>
                    <p className="small text-muted fw-600 mb-0">
                        {/* FIX: Added fallback (0) before toFixed to prevent 
                          "Cannot read properties of undefined" error 
                        */}
                        {transaction.product?.name || 'Product'} &bull; { (transaction.finalPrice ?? 0).toFixed(2) }€
                    </p>
                </header>

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-4 text-center">
                        <div className="d-flex justify-content-center gap-2 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    className="btn p-0 border-0 shadow-none"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHover(star)}
                                    onMouseLeave={() => setHover(0)}
                                    style={{ background: 'none', outline: 'none' }}
                                >
                                    <i
                                        className={`${star <= (hover || rating) ? 'fa-solid' : 'fa-regular'} fa-star fa-2xl`}
                                        style={{
                                            color: star <= (hover || rating) ? '#F59E0B' : '#CBD5E1',
                                            transition: 'transform 0.1s ease, color 0.1s ease',
                                            transform: star <= hover ? 'scale(1.15)' : 'scale(1)',
                                            WebkitTapHighlightColor: 'transparent'
                                        }}
                                    />
                                </button>
                            ))}
                        </div>
                        <p className="fw-800 text-primary x-small mt-2" style={{ letterSpacing: '0.5px' }}>
                            {hover === 1 || (hover === 0 && rating === 1) ? 'Poor' :
                                hover === 2 || (hover === 0 && rating === 2) ? 'Fair' :
                                    hover === 3 || (hover === 0 && rating === 3) ? 'Average' :
                                        hover === 4 || (hover === 0 && rating === 4) ? 'Very Good' : 'Excellent'}
                        </p>
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <Form.Label className="x-small fw-800 text-muted mb-0">Commentary</Form.Label>
                            <span className={`fw-800 ${comment.length < MIN_CHARS ? 'text-danger' : 'text-success'}`} style={{ fontSize: '10px' }}>
                                {comment.length} / {MIN_CHARS} Min
                            </span>
                        </div>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="State your opinion about the transaction..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="border-0 p-3 small fw-600 shadow-none"
                            style={{ backgroundColor: '#F8FAFC', borderRadius: '16px', resize: 'none', border: '1px solid #E2E8F0' }}
                            required
                        />
                        <div className="mt-2 d-flex align-items-start gap-2">
                            <i className="fa-solid fa-circle-info text-primary mt-1" style={{ fontSize: '10px' }}></i>
                            <p className="x-small mb-0 fw-700 text-muted" style={{ fontStyle: 'italic', lineHeight: '1.4' }}>
                                {getEditorialTip()}
                            </p>
                        </div>
                    </Form.Group>

                    <Stack direction="horizontal" gap={3}>
                        <Button
                            variant="link"
                            onClick={onHide}
                            className="w-100 text-muted text-decoration-none fw-800 small py-2"
                        >
                            Discard
                        </Button>
                        <Button
                            type="submit"
                            className="btn-sell w-100 py-3 shadow-sm border-0 rounded-pill fw-800"
                            disabled={isProcessing || comment.length < MIN_CHARS}
                            style={{ fontSize: '13px' }}
                        >
                            {isProcessing ? <Spinner size="sm" animation="border" /> : (initialData ? "Update Review" : "Post Review")}
                        </Button>
                    </Stack>
                </Form>
            </div>
        </Modal>
    );
}