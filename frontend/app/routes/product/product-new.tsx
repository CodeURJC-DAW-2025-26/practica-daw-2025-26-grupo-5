/**
 * Create New Product Page
 *
 * Form interface for sellers to list new products on Stilnovo marketplace.
 * Includes AI-powered description enhancement feature.
 *
 * Features:
 * - Product form component (reused from ProductForm.tsx)
 * - Form fields:
 * - Name (required)
 * - Category (dropdown)
 * - Price (currency field)
 * - Location (seller's location)
 * - Description (long text)
 * - Image upload (required, must have photo)
 * - AI Description Enhancement:
 * - Improves/enriches product description
 * - Validates product name first
 * - Shows loading state during AI processing
 * - Handles errors gracefully
 * - Returns enhanced text or original if error
 * - Server action saves product to backend
 * - Auto-navigates to product detail on success
 * - Redirects to inventory on cancel
 * - Error handling with user-friendly messages
 *
 * Data Flow:
 * 1. User fills form (name, category, price, location, description, image)
 * 2. Optional: Click AI button to enhance description
 * - Sends product name + current description to backend AI
 * - Returns enhanced version
 * - Updates description field
 * 3. Submit form
 * 4. Server action processes:
 * - Validates required fields (especially image)
 * - Calls addProduct() API
 * - Uploads image via uploadProductImage()
 * - On success: Redirect to product detail
 * - On error: Show error message
 *
 * AI Enhancement:
 * - Only available if product name is filled (min 3 chars)
 * - Calls improveDescription() from AI service
 * - Optional feature - user can submit without AI
 * - Handles API errors with user-friendly messages
 * - Shows loading spinner during processing
 *
 * Form Validation:
 * - Image is required
 * - Name is required for AI enhancement
 * - All other fields recommended but technically optional
 * - Backend validates again server-side
 *
 * Status:
 * - All new products created with status "Active"
 * - Sellers can edit/delete before purchase
 * - Once purchased, becomes "Sold" automatically
 *
 * @component
 * @returns React component for new product creation
 */

import { useNavigate } from "react-router";
import { useActionState, useState } from "react";
import type { Route } from "./+types/product-new";
import ProductForm from "~/components/ProductForm";
import { addProduct, uploadProductImage } from "~/services/products-service";
import { improveDescription } from "~/services/AI/ai-service";

/**
 * Product Creation Page Component
 * * Manages new product form with AI enhancement capability.
 */
export default function ProductNew() {
  const navigate = useNavigate();

  // AI Enhancement state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  /**
   * Handle AI Description Enhancement
   * * Process:
   * 1. Validate product name (min 3 chars required)
   * 2. Set loading state
   * 3. Call improveDescription() from AI service
   * 4. Return enhanced text or original on error
   * 5. Handle and display errors
   * * @param name - Product name (used for AI context)
   * @param currentDesc - Current product description
   * @returns Enhanced description from AI or original on error
   */
  const handleImproveDescription = async (name: string, currentDesc: string) => {
    if (!name || name.length < 3) {
      setAiError("Please enter a product name first.");
      return "";
    }

    setAiLoading(true);
    setAiError(null);

    try {
      const enhancedText = await improveDescription(name, currentDesc);
      return enhancedText;
    } catch (err) {
      setAiError("AI service unavailable.");
      return currentDesc;
    } finally {
      setAiLoading(false);
    }
  };

  /**
   * Server Action: Save Product
   * * Process:
   * 1. Extract form data fields
   * 2. Validate image file is provided and not empty
   * 3. Call addProduct() to create product
   * 4. On success: Navigate to product detail page
   * 5. On error: Return error message to form
   * 6. Status automatically set to "Active"
   *
   * @param prevState - Previous form state
   * @param formData - Form submission data
   * @returns Object with success flag and error message
   */
  async function saveProductAction(
    prevState: { success: boolean; error: string | null } | null,
    formData: FormData
  ) {

    // Extracts structural details required for backend product schema
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const price = parseFloat(formData.get("price") as string);
    const location = formData.get("location") as string;
    const description = formData.get("description") as string;
    const file = formData.get("image") as File; 

    /**
     * Ensures an asset is uploaded as it is enforced by marketplace rules
     */
    if (!file || file.size === 0) {
      return { success: false, error: "A photo is required to list a product on Stilnovo." };
    }

    try {
      // Commits product context to the database service
      const newProduct = await addProduct({
        name,
        category,
        price,
        location,
        description,
        status: "Active",
        file,
      });

      navigate(`/product/${newProduct.id}`);
      return { success: true, error: null };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        error: "Failed to save the product. Please ensure an image was uploaded successfully.",
      };
    }
  }

  const [state, formAction, isPending] = useActionState(saveProductAction, null);

  return (
    <ProductForm
      actionState={[state, formAction, isPending]}
      onCancel={() => navigate("/user/products")}
      onImproveWithAI={handleImproveDescription}
      aiState={{ loading: aiLoading, error: aiError }}
    />
  );
}