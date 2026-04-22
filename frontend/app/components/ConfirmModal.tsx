/**
 * Generic Confirmation Dialog Modal Component
 *
 * Reusable modal for confirming critical or destructive actions.
 * Used throughout app for: delete operations, ban users, dangerous choices.
 *
 * Features:
 * - Modal dialog with overlay backdrop
 * - Customizable title and message
 * - Customizable button text (Confirm, Cancel)
 * - Color-coded variant (danger/warning/info/success)
 * - Loading state with spinner during action
 * - Cannot dismiss during loading (backdrop="static")
 * - Cannot close with Escape key during loading (keyboard={false})
 * - Disabled buttons while loading
 * - Centered on screen
 * - Rounded corners on buttons
 *
 * Props:
 * - show: Boolean to control modal visibility
 * - title: Modal header text (e.g., "Delete Product?")
 * - message: Modal body explanation text (full warning message)
 * - confirmText: Button label for confirm action (default: "Confirm")
 * - cancelText: Button label for cancel action (default: "Cancel")
 * - variant: Button color scheme (default: "danger")
 *    - "danger": Red (for destructive actions)
 *    - "warning": Yellow (for risky actions)
 *    - "info": Blue (for information)
 *    - "success": Green (for positive actions)
 * - isLoading: True while waiting for API response
 *    - Shows spinner in confirm button
 *    - Disables both buttons
 *    - Prevents user interaction
 * - onConfirm: Callback when confirm button clicked
 * - onCancel: Callback when cancel button clicked or close button clicked
 *
 * Usage Examples:
 * ```
 * // Delete confirmation
 * <ConfirmModal
 *   show={showDeleteModal}
 *   title="Delete Product?"
 *   message="This action cannot be undone. The product will be permanently deleted."
 *   confirmText="Delete"
 *   variant="danger"
 *   isLoading={deleting}
 *   onConfirm={() => deleteProduct()}
 *   onCancel={() => setShowDeleteModal(false)}
 * />
 *
 * // Ban user
 * <ConfirmModal
 *   show={showBanModal}
 *   title="Ban User?"
 *   message={`Ban ${userName}? They will be unable to access the marketplace.`}
 *   confirmText="Ban User"
 *   variant="danger"
 *   isLoading={banning}
 *   onConfirm={() => banUser(userId)}
 *   onCancel={() => setShowBanModal(false)}
 * />
 * ```
 *
 * Visual Layout:
 * - Header: Modal title (bold text)
 * - Body: Full message explaining action
 * - Footer: Two buttons (Cancel, Confirm)
 * - Cancel: Secondary gray button
 * - Confirm: Colored button (variant-specific)
 *
 * Button Behavior:
 * - Confirm Button:
 *    - Default: Shows button text
 *    - Loading: Shows spinner + "..." text
 *    - Color matches variant prop
 *    - Disabled during loading
 * - Cancel Button:
 *    - Always available (gray secondary)
 *    - Can close modal unless isLoading=true
 *    - Calls onCancel callback
 *
 * Accessibility:
 * - Modal title clearly states action
 * - Confirm button clearly labeled with action verb
 * - Sensible defaults prevent accidental clicks
 * - Spinner provides loading feedback
 *
 * @component
 * @param props - ConfirmModalProps configuration object
 * @returns Confirmation modal dialog element
 */

import { Modal, Button } from 'react-bootstrap';

/**
 * Props for ConfirmModal Component
 * 
 * Defines all configurable properties for the confirmation modal.
 */
interface ConfirmModalProps {
  // Display state
  show: boolean;
  
  // Text content
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  
  // Styling and state
  variant?: 'danger' | 'warning' | 'info' | 'success';
  isLoading?: boolean;
  
  // Event handlers
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmation Modal Component Implementation
 * 
 * Renders Bootstrap Modal with customizable content and callbacks.
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
