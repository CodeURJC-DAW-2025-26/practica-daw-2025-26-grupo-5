/**
 * User Settings Page
 *
 * Comprehensive user profile settings management page.
 * Allows users to update personal and payment information.
 *
 * Features:
 * - Profile photo upload with preview
 * - Update user email address
 * - Update user description/bio
 * - Update payment card information (number, expiry, CVV)
 * - CVV field toggle for security (show/hide)
 * - Form validation
 * - Success/error notifications
 * - Loading states during submission
 * - Admin-only sections (if user is admin)
 * - Form state management with controlled inputs
 * - Photo preview before upload
 *
 * Form Sections:
 * 1. Profile Section:
 *    - Current profile photo display
 *    - Photo upload input
 *    - Image preview
 *
 * 2. Personal Information:
 *    - Email address
 *    - Description/bio (seller bio)
 *
 * 3. Payment Information:
 *    - Card number (masked)
 *    - Expiry date (MM/YY format)
 *    - CVV (masked by default, toggle to show)
 *
 * State Management:
 * - Form fields: description, email, cardNumber, expiry, cvv
 * - UI state: loading, error, success
 * - Photo handling: selectedPhoto, previewUrl
 * - Security: showCvv toggle
 *
 * Photo Upload:
 * - Uses FileReader to create preview URL
 * - Displays image preview before submission
 * - Includes photo in FormData when updating
 * - Falls back to default if not provided
 *
 * Error Handling:
 * - Shows error alert if update fails
 * - Provides user-friendly error messages
 * - Resets form state on failure
 * - Prevents submission during loading
 *
 * Success Handling:
 * - Updates Zustand store with new user data
 * - Shows success notification (auto-hides after 4 seconds)
 * - Revalidates page data
 * - Clears selected photo
 *
 * Protected Component:
 * - Redirects to login if not authenticated
 * - Shows loading spinner while user data loads
 * - Admin-specific sections hidden from regular users
 *
 * @component
 * @returns React component for user settings management
 */
import { useState } from 'react';
import { useNavigate, useRevalidator, redirect } from 'react-router';
import { useUserStore } from '~/stores/useUserStore';
import { updateUserSettings, deleteUser } from '~/services/user-service';
import { Spinner, Alert, Modal } from 'react-bootstrap';

/**
 * Client-side loader function
 * Acts purely as a route guard. Prevents rendering if not authenticated.
 */
export async function clientLoader() {
  const currentUser = useUserStore.getState().user;

  if (!currentUser) {
    throw redirect('/login');
  }

  // No data fetching needed, user data is already in Zustand store
  return null;
}

/**
 * User Settings Component Implementation
 * Manages user profile and payment information updates.
 */
export default function UserSettings() {
  const { user, setUser } = useUserStore();
  const revalidator = useRevalidator();
  const navigate = useNavigate();

  // TYPE GUARD: TypeScript now knows 'user' is 100% NOT null after this line
  if (!user) return null;

  // Form field state (controlled inputs)
  // We can safely use user! because the loader guarantees user exists
  const [description, setDescription] = useState(user!.description || '');
  const [email, setEmail] = useState(user!.email || '');
  const [cardNumber, setCardNumber] = useState(user!.cardNumber || '');
  const [expiry, setExpiry] = useState(user!.cardExpiringDate || '');
  const [cvv, setCvv] = useState(user!.cardCvv || '');
  const [showCvv, setShowCvv] = useState(false);

  // UI state management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Initialize previewUrl directly if user exists
  const [previewUrl, setPreviewUrl] = useState<string>(`/api/v1/users/me/profile-photo?t=${Date.now()}`);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);

  // Delete operation state
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isPendingDelete, setPendingDelete] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

  /**
   * Handle Profile Photo Selection
   */
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedPhoto(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Handle Form Submission
   */
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append('newEmail', email);
      formDataObj.append('newDescription', description);
      formDataObj.append('newCardNumber', cardNumber);
      formDataObj.append('newCardExpiringDate', expiry);
      formDataObj.append('newCardCvv', cvv);

      if (selectedPhoto) {
        formDataObj.append('newProfilePhoto', selectedPhoto);
      }

      const responseData = await updateUserSettings(formDataObj);

      if (responseData) {
        setUser(responseData);
        setSuccess(true);
        setSelectedPhoto(null);
        revalidator.revalidate();
        setTimeout(() => setSuccess(false), 4000);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Error updating settings. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Toggle CVV Field Visibility
   */
  const toggleCvv = () => setShowCvv(!showCvv);

  /**
   * User Deletion Handlers
   */
  const handleOpenDeleteDialog = () => setDeleteDialogOpen(true);

  const handleCloseDeleteDialog = () => {
    if (!isPendingDelete) {
      setDeleteDialogOpen(false);
      setDeleteError(null);
    }
  };

  const handleDelete = async () => {
    if (!user?.id) return;

    setPendingDelete(true);
    setDeleteError(null);
    try {
      await deleteUser();

      // Clean up local session and redirect
      setUser(null);

      localStorage.clear();
      sessionStorage.clear();
      document.cookie.split(";").forEach((cookie) => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      });
      navigate("/");
    } catch (err) {
      console.error(err);
      setDeleteError("Error deleting account. Please try again.");
      setPendingDelete(false);
    }
  };

  const isAdmin = user?.roles?.includes('ROLE_ADMIN');
  return (
    <>
      <main className="settings-page-container pb-4 w-100">
        <div className="container-fluid px-4 py-4">

          {error && (
            <Alert variant="danger" className="clay-card border-0 fw-700 mb-4 d-flex align-items-center gap-3">
              <i className="fa-solid fa-exclamation-circle text-danger fs-4"></i>
              <span>{error}</span>
            </Alert>
          )}

          {success && (
            <Alert variant="success" className="clay-card border-0 fw-700 mb-4 d-flex align-items-center gap-3">
              <i className="fa-solid fa-check-circle text-success fs-4"></i>
              <span>Profile successfully updated!</span>
            </Alert>
          )}

          <div className="row g-4">

            {/* LEFT COLUMN: EDIT PROFILE FORM */}
            <div className="col-xxl-7 col-xl-6 col-lg-12">
              <div className="clay-card p-4 p-md-5 settings-card h-100">
                <h2 className="fw-800 mb-4">Edit Profile</h2>

                <form onSubmit={handleFormSubmit}>
                  {/* Profile Picture Upload */}
                  <div className="mb-5 text-center">
                    <div className="profile-upload-container mx-auto mb-2">
                      <img
                        src={previewUrl}
                        id="preview-avatar"
                        className="img-fluid rounded-circle p-1"
                        alt="Profile"
                        style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                        onError={(e) => (e.currentTarget.src = '/images/no-profile-picture.png')}
                      />
                      <input
                        type="file"
                        id="profilePic"
                        name="newProfilePhoto"
                        accept="image/*"
                        className="file-input-hidden"
                        onChange={handlePhotoChange}
                        disabled={loading}
                      />
                    </div>
                    <label htmlFor="profilePic" className="form-label fw-700 small cursor-pointer" style={{ color: 'var(--brand-blue)' }}>
                      <i className="fa-solid fa-camera me-1"></i> Change profile picture
                    </label>
                  </div>

                  <p className="label-categories mb-3 opacity-50 fw-800 x-small text-uppercase">Account Details</p>

                  <div className="mb-4">
                    <label className="label-categories mb-2 d-block">FULL NAME</label>
                    <div className="search-box w-100 py-2 locked-field">
                      <i className="fa-solid fa-lock small text-muted"></i>
                      <input type="text" value={user.name || ''} disabled />
                    </div>
                    <div className="d-flex align-items-center gap-2 mt-2 px-1">
                      <i className="fa-solid fa-circle-exclamation x-small text-primary"></i>
                      <span className="x-small text-muted fw-600 italic">Usernames are unique identifiers and cannot be changed.</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="label-categories mb-2 d-block">EMAIL ADDRESS</label>
                    <div className="search-box w-100 py-2">
                      <i className="fa-solid fa-envelope small"></i>
                      <input
                        type="email"
                        name="newEmail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="label-categories mb-2 d-block">PROFILE DESCRIPTION</label>
                    <textarea
                      name="newDescription"
                      className="search-box w-100 description-box"
                      placeholder="Tell the community about your collection history..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={loading}
                      rows={4}
                    />
                  </div>

                  <hr className="my-4 opacity-10" />

                  <p className="label-categories mb-3 opacity-50 fw-800 x-small text-primary text-uppercase">Billing Information</p>

                  <div className="mb-3">
                    <label className="label-categories mb-2 d-block">CARD NUMBER</label>
                    <div className="search-box w-100 py-2">
                      <i className="fa-solid fa-credit-card small"></i>
                      <input
                        type="text"
                        name="newCardNumber"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        maxLength={16}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-4">
                    <div className="col-sm-7">
                      <label className="label-categories mb-2 d-block">EXPIRING DATE</label>
                      <div className="search-box w-100 py-2">
                        <i className="fa-solid fa-calendar-days small"></i>
                        <input
                          type="text"
                          name="newCardExpiringDate"
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                          placeholder="MM/YY"
                          maxLength={5}
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="col-sm-5">
                      <label className="label-categories mb-2 d-block">CVV</label>
                      <div className="search-box w-100 py-2 cvv-wrapper">
                        <i className="fa-solid fa-lock small"></i>
                        <input
                          type={showCvv ? "text" : "password"}
                          name="newCardCvv"
                          id="cardCvv"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          maxLength={3}
                          disabled={loading}
                          style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent' }}
                        />
                        <i
                          className={`fa-solid ${showCvv ? 'fa-eye-slash' : 'fa-eye'} toggle-password`}
                          id="toggleCvv"
                          onClick={toggleCvv}
                          style={{ cursor: 'pointer' }}
                        ></i>
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="btn-sell w-100 justify-content-center mb-5" disabled={loading}>
                    {loading ? <Spinner animation="border" size="sm" className="me-2" /> : null}
                    Save All Changes
                  </button>
                </form>

                <hr className="my-5 opacity-10" />

                {isAdmin ? (
                  <div className="text-center">
                    <button type="button" className="btn w-100 py-3 small shadow-sm disabled" style={{ cursor: 'not-allowed', opacity: 0.6 }}>
                      <i className="fa-solid fa-user-slash me-2"></i>You can't delete your account, admin
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <button
                      type="button"
                      className="btn btn-danger-custom w-100 py-3 small shadow-sm"
                      onClick={handleOpenDeleteDialog}
                    >
                      <i className="fa-solid fa-user-slash me-2"></i>Permanently Delete Account
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: DIGITAL SELLER CARD */}
            <div className="col-xxl-5 col-xl-6 col-lg-12">
              <div
                className="sticky-card-column position-sticky d-flex flex-column align-items-center"
                style={{ top: '6rem' }}
              >
                <p className="label-categories mb-4 opacity-50 fw-700 text-center w-100">YOUR DIGITAL SELLER CARD</p>

                <div className="flip-card-container mx-auto mb-5">
                  <div className="flip-card-lizard">
                    <div className="flip-card-inner-lizard">
                      <div className="flip-card-front-lizard text-start">
                        <div className="lizard-bg-pattern"></div>
                        <div className="lizard-content">
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="lizard-logo text-white">STILNOVO</div>
                            <div className="lizard-chip"></div>
                          </div>
                          <div className="lizard-user mt-4">
                            <h3 className="fw-800 text-uppercase">{user?.name}</h3>
                            <p className="lizard-id">ID: 2026-ST-{user?.id || '0000'}</p>
                          </div>
                          <div className="lizard-footer d-flex justify-content-between align-items-end">
                            <div className="lizard-valid">
                              <span>VALID THRU</span>
                              <p>{expiry || 'MM/YY'}</p>
                            </div>
                            <div className="lizard-brand-mark">PREMIUM SELLER</div>
                          </div>
                        </div>
                      </div>
                      <div className="flip-card-back-lizard">
                        <i className="fa-solid fa-qrcode fa-5x"></i>
                        <p className="x-small mt-3 opacity-50">SCAN TO FINALIZE DEAL</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-start mt-4 w-100" style={{ maxWidth: '450px' }}>
                  <div className="tip-card-blue mb-4">
                    <h6 className="fw-800 text-primary mb-2">
                      <i className="fa-solid fa-handshake me-2"></i>Secure Physical Delivery
                    </h6>
                    <p className="small text-muted mb-0">
                      Meeting the buyer in person? Once they have the item, let them scan your <strong>QR Code</strong> to instantly mark the transaction as completed and release your payment.
                    </p>
                  </div>

                  <div className="tip-card-blue mb-4">
                    <h6 className="fw-800 text-dark mb-2">
                      <i className="fa-solid fa-shield-halved me-2"></i>Fraud Protection
                    </h6>
                    <p className="small text-muted mb-0">
                      The dynamic QR code links your Digital Card directly to the transaction, ensuring that only the verified owner can authorize the final delivery.
                    </p>
                  </div>

                  <div className="p-3 text-center opacity-50">
                    <p className="x-small fw-600 mb-0"><i className="fa-solid fa-lock me-1"></i> Stilnovo Encryption Secured</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* REACT-BOOTSTRAP DELETE ACCOUNT MODAL */}
      <Modal
        show={isDeleteDialogOpen}
        onHide={handleCloseDeleteDialog}
        centered
        contentClassName="clay-card border-0 shadow-lg text-center bg-white"
        style={{ '--bs-modal-border-radius': '24px' } as React.CSSProperties}
      >
        <Modal.Body className="p-4 p-md-5">
          <div
            className="bg-danger-subtle text-danger rounded-circle d-inline-flex align-items-center justify-content-center mb-3 mx-auto"
            style={{ width: '60px', height: '60px' }}
          >
            <i className="fa-solid fa-triangle-exclamation fa-2x"></i>
          </div>

          <h3 className="fw-800 h5 mb-2 text-danger">Confirm Account Deletion</h3>

          <p className="small text-muted fw-700 mb-4 px-3">
            Hi {user.name}, are you sure you want to leave us? This action will permanently remove all your products and history.
          </p>

          {deleteError && (
            <Alert variant="danger" className="mb-4 small fw-600 rounded-4 text-start">
              {deleteError}
            </Alert>
          )}

          <div className="mb-4 text-start">
            <div className="p-3 bg-light rounded-4">
              <div className="d-flex align-items-center gap-2 mb-2">
                <i className="fa-solid fa-check-circle text-success small"></i>
                <span className="x-small fw-700 text-uppercase">Cascading Deletion Active</span>
              </div>
              <p className="x-small text-muted mb-0">All linked items in your collection will be automatically removed from the marketplace.</p>
            </div>
          </div>

          <div className="d-grid gap-2">
            <button
              type="button"
              className="btn btn-danger w-100 py-3 rounded-pill fw-800 border-0 shadow-sm"
              onClick={handleDelete}
              disabled={isPendingDelete}
            >
              {isPendingDelete ? (
                <><i className="fa-solid fa-spinner fa-spin me-2"></i>Deleting...</>
              ) : (
                "Confirm and Delete"
              )}
            </button>

            <button
              type="button"
              className="btn btn-light w-100 py-3 rounded-pill fw-800 border-0"
              onClick={handleCloseDeleteDialog}
              disabled={isPendingDelete}
            >
              Cancel, I want to stay
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}