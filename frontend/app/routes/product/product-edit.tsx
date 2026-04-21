/**
 * Edit Product Page
 *
 * Form interface for sellers to update existing product listings.
 * Allows modification of product details and image replacement.
 *
 * Features:
 * - Edit form component (reused ProductForm.tsx)
 * - Update product metadata:
 *    - Name, category, price, location
 *    - Description with optional AI enhancement
 *    - Status always set to "Active"
 * - Image management:
 *    - Replace existing image with new one
 *    - Remove current image option
 *    - Image preview during edit
 * - AI Description Enhancement:
 *    - Improve existing product description
 *    - Uses current description as context
 *    - Validates product name (min 3 chars)
 *    - Loading state during AI processing
 *    - Error handling
 * - Server action saves all changes
 *    - Updates metadata via PATCH
 *    - Handles image replacement separately
 *    - Handles image deletion if checkbox marked
 * - Auto-navigate to product detail on success
 * - Error handling with user feedback
 * - Cancels redirect to /user/products
 *
 * Data Flow:
 * 1. clientLoader fetches current product data
 * 2. Component pre-fills form with existing values
 * 3. User modifies fields and/or image
 * 4. Optional: Click AI button to enhance description
 *    - Current description sent to AI service
 *    - AI improves while keeping context
 *    - Enhanced text updates form
 * 5. Submit form
 * 6. Server action processes:
 *    - Updates product metadata (name, price, description, etc.)
 *    - If new image: Calls replaceImage() to upload new one
 *    - If remove checkbox: Calls deleteProductImage() to remove
 *    - On success: Navigate to product detail (/product/{id})
 *    - On error: Show error message
 *
 * Image Management:
 * - replaceImage() uploads new image (replaces old one)
 * - deleteProductImage() removes current image
 * - Both use product ID for reference
 * - Image cache busted with timestamp in URLs
 *
 * AI Enhancement:
 * - Uses improveDescription() service
 * - Takes existing description as starting point
 * - Maintains product name context
 * - Handles network errors gracefully
 * - Returns original description on failure
 *
 * Client Loader:
 * - Fetches current product data via getProductById()
 * - Ensures form pre-filled with existing values
 * - Handles loading state
 * - Passes product data as loaderData
 *
 * Form Validation:
 * - Required fields enforced by backend
 * - Image optional (can keep existing)
 * - All metadata optional but recommended
 * - Status always "Active" regardless of input
 *
 * @component
 * @returns React component for product editing
 */

import { useNavigate } from "react-router";
import { useActionState, useState } from "react";
import type { Route } from "./+types/product-edit";
import ProductForm from "~/components/ProductForm";
import {
  deleteProductImage,
  getProductById,
  updateProduct,
  replaceImage,
} from "~/services/products-service";
// Importing the same service used in ProductNew to ensure consistency
import { improveDescription } from "~/services/AI/ai-service"; 

/**
 * Client-side loader: Fetch current product data
 * 
 * Called before component mounts to get existing product details.
 * Ensures form can be pre-filled with current values.
 * 
 * @param params - Route params including product ID
 * @returns Product data from backend
 */
export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  return await getProductById(Number(params.id!));
}

/**
 * Product Edit Component Implementation
 * 
 * Manages product editing form with AI enhancement and image management.
 */
export default function ProductEdit({ loaderData }: Route.ComponentProps) {
  const product = loaderData;
  const navigate = useNavigate();

  // AI Enhancement state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  /**
   * Handle AI Description Enhancement
   * 
   * Process:
   * 1. Validate product name (min 3 chars)
   * 2. Set loading state
   * 3. Call improveDescription() with name and current description
   * 4. Return enhanced text or original on error
   * 5. Shows error message if issues occur
   * 
   * @param name - Product name for AI context
   * @param currentDesc - Current description to improve
   * @returns Enhanced description from AI
   */
  const handleImproveDescription = async (name: string, currentDesc: string) => {
    if (!name || name.length < 3) {
      setAiError("Please enter a product name first.");
      return "";
    }

    setAiLoading(true);
    setAiError(null);

    try {
      // We pass both name and current description to the service
      const enhancedText = await improveDescription(name, currentDesc);
      return enhancedText;
    } catch (err) {
      setAiError("AI service unavailable.");
      return currentDesc; // Return original text on failure
    } finally {
      setAiLoading(false);
    }
  };

  /**
   * Server Action: Save Product Changes
   * 
   * Process:
   * 1. Extract all form data
   * 2. Update product metadata via updateProduct() PATCH call
   * 3. Handle image changes:
   *    - New image: Call replaceImage() to upload new one
   *    - Remove image: Call deleteProductImage() if checkbox marked
   * 4. On success: Navigate to product detail page
   * 5. On error: Return error message to form
   * 
   * @param prevState - Previous form state
   * @param formData - Form submission data
   * @returns Object with success flag and error message
   */
  async function saveProductAction(
    prevState: { success: boolean; error: string | null } | null,
    formData: FormData
  ) {
    const id = Number(formData.get("id") as string);
    const file = formData.get("image") as File;
    const removeImage = formData.get("removeImage") === "on";

    try {
      // STEP 1: Update product metadata via PATCH
      await updateProduct(id, {
        name: formData.get("name") as string,
        category: formData.get("category") as string,
        price: parseFloat(formData.get("price") as string),
        location: formData.get("location") as string,
        description: formData.get("description") as string,
        status: "Active"
      });

      // STEP 2: Handle specialized image replacement if a new file is present
      if (file && file.size > 0) {
        // Ensure replaceImage uses "file" as the FormData key in the service
        await replaceImage(id, file);
      }
      
      // STEP 3: Handle image removal if the checkbox was selected
      else if (removeImage && product.image) {
        await deleteProductImage(product.id, product.image.id);
      }

      // Success: Redirect to the detail page (with timestamp to clear image cache)
      navigate(`/product/${id}`);
      return { success: true, error: null };

    } catch (error) {
      console.error("Save action failed:", error);
      return {
        success: false,
        error: "Failed to update product. Please check server connection.",
      };
    }
  }

  const [state, formAction, isPending] = useActionState(saveProductAction, null);

  return (
    <ProductForm
      product={product}
      actionState={[state, formAction, isPending]}
      onCancel={() => navigate(-1)}
      // Passing AI logic and state to the form component
      onImproveWithAI={handleImproveDescription}
      aiState={{ loading: aiLoading, error: aiError }}
    />
  );
}