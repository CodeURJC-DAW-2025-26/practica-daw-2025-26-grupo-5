import api from "./api";
import type ProductDTO from "~/dto/ProductDTO";
import type ProductWriteRequestDTO from "~/dto/ProductWriteRequestDTO";
import type PagedResponse from "~/dto/PagedResponse";
import type ProductDetailsDTO from "~/dto/ProductDetailsDTO";
import axios from "axios";

/**
 * Products Service
 * Handles all API calls related to products
 */

/**
 * Get all products from the backend
 * Backend returns PagedResponse, extract content array
 */
export async function getProducts(): Promise<ProductDTO[]> {
  const response = await api.get("/v1/products", {
    params: { size: 1000 } // Fetch up to 1000 products to show all on home
  });
  const pagedResponse = response.data as PagedResponse<ProductDTO>;
  return pagedResponse.content || [];
}

/**
 * Gets the products belonging to the currently authenticated user.
 * Matches Backend: @GetMapping("/me") -> List<ProductDTO>
 */
export async function getMyProducts(): Promise<ProductDTO[]> {
  const response = await api.get(`/v1/products/me`);
  return response.data;
}

export async function deleteProduct(id: number): Promise<void> {
  await api.delete(`/v1/products/${id}`);
}

/**
 * Get a single product by ID
 * Backend returns ProductDetailsDTO, extract product
 */
export async function getProductById(id: number): Promise<ProductDTO> {
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
  const formData = new FormData();
  
  //This is the exact order that POST api/v1/products requires the info
  if (product.file) {
    formData.append("file", product.file); 
  }
  formData.append("name", product.name);
  formData.append("category", product.category);
  formData.append("description", product.description);
  formData.append("price", product.price.toString());
  formData.append("location", product.location);
  formData.append("status", product.status);
  

  const response = await api.post("/v1/products", formData);
  return response.data;
}

/**
 * Update an existing product
 */
export async function updateProduct(id: number, productData: any) {
  const formData = new FormData();
  
  formData.append('name', productData.name);
  formData.append('category', productData.category);
  formData.append('price', productData.price.toString());
  formData.append('description', productData.description);
  formData.append('location', productData.location);
  formData.append('status', productData.status);
  
  

  return await axios.patch(`/api/v1/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
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
 * Replace an existing product image.
 */
export async function replaceImage(productId: number, file: File): Promise<void> {
  const formData = new FormData();
  
  formData.append("file", file); 

  await api.post(`/v1/products/${productId}/image`, formData, {
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

export async function sendInquiry(data: {
  productId: number;
  phone: string;
  type: string;
  message: string;
}) {
  const response = await fetch("/api/v1/inquiries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error("Failed to send inquiry");
  return response.json()
}