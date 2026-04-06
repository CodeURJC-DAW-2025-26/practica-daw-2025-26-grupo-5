import { useNavigate } from "react-router";
import { useActionState } from "react";
import type { Route } from "./+types/product-new";
import ProductForm from "~/components/product-form";
import { addProduct, uploadProductImage } from "~/services/products-service";

/**
 * Product New Component
 * Form to create a new product
 */
export default function ProductNew() {
  const navigate = useNavigate();

  async function saveProductAction(
    prevState: {
      success: boolean;
      error: string | null;
    } | null,
    formData: FormData
  ) {
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const price = parseFloat(formData.get("price") as string);
    const location = formData.get("location") as string;
    const description = formData.get("description") as string;
    const imageFile = formData.get("image") as File | null;

    try {
      const newProduct = await addProduct({
        name,
        category,
        price,
        location,
        description,
      });

      if (imageFile && imageFile.size > 0) {
        await uploadProductImage(newProduct.id, imageFile);
      }

      navigate(`/product/${newProduct.id}`);
      return { success: true, error: null };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        error: "Failed to save product. Please try again.",
      };
    }
  }

  const [state, formAction, isPending] = useActionState(saveProductAction, null);

  return (
    <ProductForm
      actionState={[state, formAction, isPending]}
      onCancel={() => navigate("/")}
    />
  );
}
