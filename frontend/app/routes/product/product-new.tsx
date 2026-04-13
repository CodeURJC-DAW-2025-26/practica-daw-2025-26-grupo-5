import { useNavigate } from "react-router";
import { useActionState, useState } from "react";
import type { Route } from "./+types/product-new";
import ProductForm from "~/components/ProductForm";
import { addProduct, uploadProductImage } from "~/services/products-service";
import { improveDescription } from "~/services/AI/ai-service";

/**
 * Product New Component
 * Form to create a new product with AI assistance
 * If user needs to use AI we have to do it first (then create a product)
 */
export default function ProductNew() {
  const navigate = useNavigate();

  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
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

  async function saveProductAction(
    prevState: { success: boolean; error: string | null } | null,
    formData: FormData
  ) {

    // Extract form data
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const price = parseFloat(formData.get("price") as string);
    const location = formData.get("location") as string;
    const description = formData.get("description") as string;
    const imageFile = formData.get("image") as File; 

    if (!imageFile || imageFile.size === 0) {
      return { success: false, error: "La foto es obligatoria para vender en Stilnovo." };
    }

    try {

      //ProductRestController.java/addProduct have this form request
      const newProduct = await addProduct({
        name,
        category,
        price,
        location,
        description,
        status: "Active",
        file: imageFile,
      });

      navigate(`/product/${newProduct.id}`);
      return { success: true, error: null };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        error: "Error al guardar el producto. Asegúrate de haber subido una imagen.",
      };
    }
  }

  const [state, formAction, isPending] = useActionState(saveProductAction, null);

  return (
    <ProductForm
      actionState={[state, formAction, isPending]}
      onCancel={() => navigate("/")}
      onImproveWithAI={handleImproveDescription}
      aiState={{ loading: aiLoading, error: aiError }}
    />
  );
}