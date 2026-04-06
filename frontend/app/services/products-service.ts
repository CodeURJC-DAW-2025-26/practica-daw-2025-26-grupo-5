import api from "./api";
import type ProductDTO from "~/dtos/ProductDTO";
import type ProductWriteRequestDTO from "~/dtos/ProductWriteRequestDTO";
import type PagedResponse from "~/dtos/PagedResponse";
import type ProductDetailsDTO from "~/dtos/ProductDetailsDTO";

/**
 * Products Service
 * Handles all API calls related to products
 */

/**
 * Get all products from the backend
 * Backend returns PagedResponse, extract content array
 */
export async function getProducts(): Promise<ProductDTO[]> {
  const response = await api.get("/v1/products");
  const pagedResponse = response.data as PagedResponse<ProductDTO>;
  return pagedResponse.content || [];
}

/**
 * Get a single product by ID
 * Backend returns ProductDetailsDTO, extract product
 */
export async function getProduct(id: string): Promise<ProductDTO> {
  const response = await api.get(`/v1/products/${id}`);
  const detailsDTO = response.data as ProductDetailsDTO;
  return detailsDTO.product;
}

/**
 * Create a new product
 */
export async function addProduct(
  product: ProductWriteRequestDTO
): Promise<ProductDTO> {
  const response = await api.post("/v1/products", product);
  return response.data;
}

/**
 * Update an existing product
 */
export async function updateProduct(
  id: string,
  product: ProductWriteRequestDTO
): Promise<ProductDTO> {
  const response = await api.put(`/v1/products/${id}`, product);
  return response.data;
}

/**
 * Delete a product
 */
export async function removeProduct(id: number): Promise<void> {
  await api.delete(`/v1/products/${id}`);
}

/**
 * Upload a product image
 */
export async function uploadProductImage(
  productId: number,
  file: File
): Promise<void> {
  const formData = new FormData();
  formData.append("image", file);
  await api.post(`/v1/products/${productId}/image`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

/**
 * Replace an existing product image
 */
export async function replaceImage(imageId: number, file: File): Promise<void> {
  const formData = new FormData();
  formData.append("image", file);
  await api.put(`/v1/images/${imageId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

/**
 * Delete a product image
 */
export async function deleteProductImage(
  productId: number,
  imageId: number
): Promise<void> {
  await api.delete(`/products/${productId}/image/${imageId}`);
}
