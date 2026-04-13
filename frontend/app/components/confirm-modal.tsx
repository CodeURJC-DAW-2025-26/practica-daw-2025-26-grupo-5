import { Modal, Button } from 'react-bootstrap';

interface ConfirmModalProps {
  show: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Generic Confirmation Modal Component
 * Used for destructive actions (ban, delete, etc.)
 */
export default function ConfirmModal({
  show,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal show={show} onHide={onCancel} centered backdrop="static" keyboard={false}>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-800">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="py-3 px-4">
        <p className="text-dark mb-0" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
          {message}
        </p>
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0 gap-2">
        <Button
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
          className="fw-700"
          style={{ borderRadius: '8px' }}
        >
          {cancelText}
        </Button>
        <Button
          variant={variant}
          onClick={onConfirm}
          disabled={isLoading}
          className="fw-700"
          style={{ borderRadius: '8px' }}
        >
          {isLoading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              />
              Loading...
            </>
          ) : (
            confirmText
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
