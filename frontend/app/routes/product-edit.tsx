import { useNavigate } from "react-router";
import { useActionState } from "react";
import type { Route } from "./+types/product-edit";
import ProductForm from "~/components/product-form";
import {
  deleteProductImage,
  getProduct,
  replaceImage,
  updateProduct,
  uploadProductImage,
} from "~/services/products-service";

/**
 * Client-side loader: Fetches product and prepare data for editing
 */
export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const product = await getProduct(params.id!);
  return product;
}

/**
 * Product Edit Component
 * Allows sellers to update product information
 */
export default function ProductEdit({ loaderData }: Route.ComponentProps) {
  const product = loaderData;
  const navigate = useNavigate();

  async function saveProductAction(
    prevState: { success: boolean; error: string | null } | null,
    formData: FormData
  ) {
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const price = parseFloat(formData.get("price") as string);
    const location = formData.get("location") as string;
    const description = formData.get("description") as string;
    const removeImage = formData.get("removeImage") === "on";
    const imageFile = formData.get("image") as File | null;

    try {
      await updateProduct(id, {
        name,
        category,
        price,
        location,
        description,
      });

      if (imageFile && imageFile.size > 0 && product.image) {
        await replaceImage(product.image.id, imageFile);
      } else if (imageFile && imageFile.size > 0 && !product.image) {
        await uploadProductImage(Number(id), imageFile);
      } else if (removeImage && product.image) {
        await deleteProductImage(product.id, product.image.id);
      }

      navigate(`/product/${product.id}`);
      return { success: true, error: null };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        error: "Failed to update product. Please try again.",
      };
    }
  }

  const [state, formAction, isPending] = useActionState(saveProductAction, null);

  return (
    <ProductForm
      product={product}
      actionState={[state, formAction, isPending]}
      onCancel={() => navigate(-1)}
    />
  );
}
