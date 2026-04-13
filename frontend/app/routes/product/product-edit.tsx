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
 * Client-side loader: Fetches the product data before the component renders.
 * Ensures we have the current product state (including existing description).
 */
export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  return await getProductById(Number(params.id!));
}

/**
 * Product Edit Component: Handles metadata updates and AI-powered description enhancement.
 */
export default function ProductEdit({ loaderData }: Route.ComponentProps) {
  const product = loaderData;
  const navigate = useNavigate();

  // Unified AI state management matching the ProductNew pattern
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  /**
   * AI Description Helper: 
   * It takes the current text from the form as 'currentDesc'.
   * This allows the AI to "improve" existing content instead of starting from scratch.
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
   * Action handler for saving product changes.
   * Updates metadata first, then handles specialized image replacement.
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