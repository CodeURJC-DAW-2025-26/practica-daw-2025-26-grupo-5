// ============================================================================
// FILE: frontend/app/components/ProductForm.tsx
// UPDATED: Complete JSDoc documentation with English comments
// ============================================================================

/**
 * Product Form Component
 *
 * A comprehensive form for creating and editing marketplace product listings in Stilnovo.
 * This component handles the complete product lifecycle from basic information (name, price)
 * through image uploads to AI-powered description enhancement.
 *
 * Form Features:
 * - Image upload with live preview (drag-and-drop supported via CSS)
 * - Real-time form validation
 * - AI-powered description enhancement (optional)
 * - Both create (new listing) and edit (existing listing) modes
 * - Responsive layout (mobile and desktop optimized)
 * - Status indicator showing product visibility
 * - FormAction integration for server-side form handling
 *
 * Form Flow:
 * 1. User fills in product details:
 *    - Name: Product title (e.g., "Vintage Eames Chair")
 *    - Category: Product type (Fashion, Technology, Cars, Home)
 *    - Price: Asking price in EUR
 *    - Location: Where item is located
 *    - Description: Detailed product info
 *    - Image: Upload product photo
 *
 * 2. Optional AI Enhancement:
 *    - User clicks "Improve with AI" button
 *    - Function calls onImproveWithAI hook with product name and current description
 *    - Backend (or AI service) generates enhanced description
 *    - Enhanced description replaces current text
 *
 * 3. Form Submission:
 *    - Clicking "Create/Update Listing" triggers formAction
 *    - FormData is serialized and sent to server
 *    - Server validates and creates/updates product
 *    - Success/error state reflected via actionState prop
 *
 * Component Props:
 * - product?: Partial<ProductDTO> - Existing product for edit mode
 * - actionState: [state, formAction, isPending] - Server action state
 * - onCancel: () => void - Callback when user clicks cancel
 * - onImproveWithAI?: Function for AI description enhancement
 * - aiState?: { loading, error } - AI operation state
 *
 * @component
 * @returns React component displaying product creation/edit form
 */

import { useState, useEffect } from "react";
import { Form, Button, Row, Col, Alert, Image, Spinner, Card } from "react-bootstrap";
import type ProductDTO from "~/dto/ProductDTO";

/**
 * ProductForm Component Props Interface
 *
 * Defines all properties that can be passed to the ProductForm component.
 */
interface ProductFormProps {
  /** Existing product data for edit mode. When undefined, component renders in "create" mode. */
  product?: Partial<ProductDTO>;

  /**
   * Server action state tuple from React 19 useActionState hook.
   * Contains form submission status, error messages, and loading indicator.
   */
  actionState: [
    state: { success: boolean; error: string | null } | null,
    formAction: (formData: FormData) => void,
    isPending: boolean,
  ];

  /** Callback function when user clicks cancel button. */
  onCancel: () => void;

  /** Optional async function to enhance product description using AI. */
  onImproveWithAI?: (name: string, currentDesc: string) => Promise<string>;

  /** Optional state object tracking AI enhancement operation. */
  aiState?: { loading: boolean; error: string | null };
}

/**
 * ProductForm Component Implementation
 *
 * Main component function that renders the form and manages local state.
 * Handles user interactions, file uploads, and form submission.
 */
export default function ProductForm({
  product,
  actionState: [state, formAction, isPending],
  onCancel,
  onImproveWithAI,
  aiState
}: ProductFormProps) {
  /**
   * Determine if Component is in Edit or Create Mode
   *
   * If product.id exists, we're editing an existing product.
   * Otherwise, we're creating a new product.
   */
  const isEditing = product?.id;

  /**
   * Local Form State
   *
   * These state values are managed locally (not server state).
   * They track what the user is typing into form fields.
   * Submitted to server when form is submitted.
   */
  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");

  /**
   * Image Preview State
   *
   * Stores the data URL of the uploaded image for live preview.
   * Can be:
   * - null: No image selected/provided
   * - data URL: New image uploaded (base64 encoded)
   * - existing image URL: For edit mode (loads from server)
   */
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  /**
   * Effect: Initialize Form Data on Component Mount and Product Changes
   *
   * Runs when:
   * - Component first mounts
   * - Product prop changes (edit mode with different product)
   *
   * What it does:
   * 1. Populate form fields with product data (if editing)
   * 2. Load existing product image URL for preview
   * 3. Pre-fill AI form with existing data
   */
  useEffect(() => {
    if (product?.name) setName(product.name);
    if (product?.description) setDescription(product.description);
    
    // Load existing product image for edit mode
    // Cache bust with Date.now() to ensure fresh image
    if (product?.id && !previewUrl) {
      setPreviewUrl(`/api/v1/products/${product.id}/image?t=${Date.now()}`);
    }
  }, [product]);

  /**
   * Handle Image File Selection
   *
   * Called when user selects an image file via file input.
   *
   * Process:
   * 1. Extract selected file from input event
   * 2. Use FileReader to convert file to base64 data URL
   * 3. Set preview URL so user sees image immediately
   * 4. FormData (sent to server) includes original File object
   */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Convert file to base64 data URL for preview
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  /**
   * Handle AI Description Improvement
   *
   * Called when user clicks "Improve with AI" button.
   *
   * Process:
   * 1. Prevent default button action (would submit form)
   * 2. Call onImproveWithAI with product name and current description
   * 3. Wait for AI-generated enhanced description
   * 4. Update description field with improved text
   */
  const handleAIImprovement = async (e: React.MouseEvent) => {
    e.preventDefault();  // Don't submit form, just enhance description
    if (onImproveWithAI) {
      const improvedText = await onImproveWithAI(name, description);
      if (improvedText) setDescription(improvedText);
    }
  };

  return (
    <div className="row justify-content-center animate-fade-in">
      <div className="col-xl-11">
        {/* FORM CARD CONTAINER */}
        <Card className="clay-card p-4 p-md-4 border-0 shadow-sm bg-white mt-3">

          {/* FORM HEADER */}
          <header className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="fw-800 h3 mb-1">
                {isEditing ? "Edit Listing" : "Create Listing"}
              </h1>
              <p className="text-muted small mb-0">
                Capture and share your design treasure.
              </p>
            </div>
            <Button 
              variant="light" 
              className="btn-about py-1 px-3 small border" 
              onClick={onCancel}
            >
              <i className="fa-solid fa-xmark me-2"></i>Cancel
            </Button>
          </header>

          {/* ERROR ALERT */}
          {state?.error && (
            <Alert 
              variant="danger" 
              className="py-2 rounded-4 fw-700 small mb-3"
            >
              {state.error}
            </Alert>
          )}

          {/* MAIN FORM */}
          <Form action={formAction}>
            {/* Hidden field for product ID (edit mode only) */}
            {isEditing && <input type="hidden" name="id" value={product?.id} />}
            
            {/* FORM CONTENT: 2-COLUMN LAYOUT */}
            <Row className="g-4">

              {/* COLUMN 1: PRODUCT VISUALS (Image Upload) */}
              <Col lg={4} className="border-end-lg">
                <label className="label-categories mb-2 d-block text-uppercase opacity-50 fw-800 x-small">
                  Product Visuals
                </label>

                {/* IMAGE UPLOAD ZONE */}
                <div className="position-relative mb-3">
                  <div 
                    className="image-upload-zone rounded-4 d-flex flex-column align-items-center justify-content-center shadow-sm"
                    style={{ 
                      height: "260px", 
                      backgroundColor: "#f8f9fa", 
                      border: "2px dashed #dee2e6", 
                      overflow: "hidden", 
                      position: "relative" 
                    }}
                  >
                    {/* CONDITIONAL RENDERING: Image or Placeholder */}
                    {previewUrl ? (
                      // Image preview - scaled to fill entire zone
                      <Image 
                        src={previewUrl} 
                        style={{ 
                          width: "100%", 
                          height: "100%", 
                          objectFit: "cover" 
                        }} 
                        alt="Preview" 
                      />
                    ) : (
                      // No image - show upload prompt
                      <div className="text-center p-3">
                        <div 
                          className="bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center mb-2 mx-auto" 
                          style={{ width: "50px", height: "50px" }}
                        >
                          <i className="fa-solid fa-camera fa-lg text-primary"></i>
                        </div>
                        <p className="small fw-800 mb-0">No image selected</p>
                      </div>
                    )}

                    {/* INVISIBLE FILE INPUT */}
                    <Form.Control 
                      type="file" 
                      name="image" 
                      accept="image/*" 
                      onChange={handleImageChange}
                      className="position-absolute top-0 start-0 w-100 h-100 opacity-0" 
                      style={{ cursor: "pointer" }} 
                      disabled={isPending} 
                    />
                  </div>
                </div>

                {/* STATUS INDICATOR */}
                <div className="p-3 rounded-4 bg-light border mb-2">
                  <label className="label-categories mb-1 d-block text-uppercase opacity-50 fw-800 x-small">
                    Status
                  </label>
                  <div className="d-flex align-items-center gap-2 text-success fw-800 x-small">
                    <i className="fa-solid fa-circle-check"></i>
                    <span>Active (Public)</span>
                  </div>
                </div>
              </Col>

              {/* COLUMN 2: PRODUCT INFORMATION */}
              <Col lg={8}>
                <Row className="g-3">

                  {/* PRODUCT NAME FIELD */}
                  <Col md={12}>
                    <Form.Label className="label-categories x-small mb-1">
                      PRODUCT NAME
                    </Form.Label>
                    <div className="search-box py-2 px-3 bg-light rounded-3 border">
                      <Form.Control 
                        type="text" 
                        name="name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Vintage Eames Chair" 
                        className="w-100 border-0 fw-600 bg-transparent shadow-none p-0" 
                        required 
                        disabled={isPending} 
                      />
                    </div>
                  </Col>

                  {/* CATEGORY DROPDOWN */}
                  <Col md={6}>
                    <Form.Label className="label-categories x-small mb-1">
                      CATEGORY
                    </Form.Label>
                    <Form.Select 
                      name="category" 
                      defaultValue={product?.category || ""}
                      className="border bg-light py-2 fw-700 small rounded-3 shadow-none px-3" 
                      required 
                      disabled={isPending}
                    >
                      <option disabled value="">Choose...</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Technology">Technology</option>
                      <option value="Cars">Cars</option>
                      <option value="Home">Home</option>
                    </Form.Select>
                  </Col>

                  {/* PRICE INPUT */}
                  <Col md={6}>
                    <Form.Label className="label-categories x-small mb-1">
                      PRICE (EUR)
                    </Form.Label>
                    <div className="search-box py-2 px-3 bg-light rounded-3 border d-flex align-items-center">
                      <span className="me-2 fw-800 opacity-25">€</span>
                      <Form.Control 
                        type="number" 
                        name="price" 
                        step="0.01" 
                        defaultValue={product?.price || ""}
                        className="w-100 border-0 fw-700 bg-transparent shadow-none p-0" 
                        required 
                        disabled={isPending} 
                      />
                    </div>
                  </Col>

                  {/* LOCATION INPUT */}
                  <Col md={12}>
                    <Form.Label className="label-categories x-small mb-1">
                      LOCATION
                    </Form.Label>
                    <div className="search-box py-2 px-3 bg-light rounded-3 border d-flex align-items-center">
                      <i className="fa-solid fa-location-dot me-2 opacity-25"></i>
                      <Form.Control 
                        type="text" 
                        name="location" 
                        defaultValue={product?.location || ""}
                        placeholder="e.g. Madrid, Spain" 
                        className="w-100 border-0 fw-600 bg-transparent shadow-none p-0" 
                        required 
                        disabled={isPending} 
                      />
                    </div>
                  </Col>

                  {/* DESCRIPTION TEXTAREA WITH AI ENHANCEMENT */}
                  <Col md={12}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <Form.Label className="label-categories x-small mb-0">
                        DESCRIPTION
                      </Form.Label>
                      {/* AI Enhancement Button */}
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        onClick={handleAIImprovement}
                        disabled={aiState?.loading || isPending || !name} 
                        className="btn-ai-sparkle border-0 py-0 px-2" 
                        style={{ height: '24px' }}
                      >
                        {aiState?.loading ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          <i className="fa-solid fa-wand-magic-sparkles"></i>
                        )}
                        <span 
                          className="ms-1 fw-800 x-small" 
                          style={{ fontSize: '10px' }}
                        >
                          Improve with AI
                        </span>
                      </Button>
                    </div>

                    {/* Description Textarea */}
                    <Form.Control 
                      as="textarea" 
                      name="description" 
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)}
                      rows={5} 
                      className="border bg-light p-3 fw-600 small rounded-4 shadow-none" 
                      style={{ resize: "none" }} 
                      required 
                      disabled={isPending} 
                    />
                  </Col>
                </Row>

                {/* FORM ACTIONS: Submit Button */}
                <div className="mt-4 pt-3 border-top d-flex justify-content-end">
                  <Button 
                    type="submit" 
                    className="btn-sell px-5 py-2 shadow-lg rounded-pill border-0 fw-800" 
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                      </>
                    ) : (
                      <i className="fa-solid fa-circle-check me-2"></i>
                    )}
                    {isEditing ? "Update Listing" : "Create Listing"}
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </Card>
      </div>
    </div>
  );
}
