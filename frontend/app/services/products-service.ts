import api from "./api";
import type ProductDTO from "~/dto/ProductDTO";
import type ProductWriteRequestDTO from "~/dto/ProductWriteRequestDTO";
import type PagedResponse from "~/dto/PagedResponse";
import type ProductDetailsDTO from "~/dto/ProductDetailsDTO";
import type HomePageDTO from "~/dto/HomePageDTO";

/**
 * Products Service
 * Handles all API calls related to products using native fetch API
 */

/**
 * Get all products from the backend
 * Backend returns PagedResponse, extract content array
 */
export async function getProducts(): Promise<ProductDTO[]> {
  const pagedResponse = await api.get<PagedResponse<ProductDTO>>("/v1/products", {
    params: { size: 1000 }
  });
  return pagedResponse.content || [];
}

/**
 * Gets the products belonging to the currently authenticated user.
 */
export async function getMyProducts(): Promise<ProductDTO[]> {
  return await api.get<ProductDTO[]>("/v1/products/me");
}

export async function deleteProduct(id: number): Promise<void> {
  await api.delete(`/v1/products/${id}`);
}

/**
 * Get a single product by ID
 * Backend returns ProductDetailsDTO, extract product
 */
export async function getProductById(id: number): Promise<ProductDTO> {
  const detailsDTO = await api.get<ProductDetailsDTO>(`/v1/products/${id}`);
  return detailsDTO.product;
}

/**
 * Create a new product
 */
export async function addProduct(
  product: ProductWriteRequestDTO
): Promise<ProductDTO> {
  const formData = new FormData();
  
  if (product.file) {
    formData.append("file", product.file); 
  }
  formData.append("name", product.name);
  formData.append("category", product.category);
  formData.append("description", product.description);
  formData.append("price", product.price.toString());
  formData.append("location", product.location);
  formData.append("status", product.status);

  return await api.post<ProductDTO>("/v1/products", formData);
}

/**
 * Update an existing product
 */
export async function updateProduct(id: number, productData: any): Promise<ProductDTO> {
  const formData = new FormData();
  
  formData.append('name', productData.name);
  formData.append('category', productData.category);
  formData.append('price', productData.price.toString());
  formData.append('description', productData.description);
  formData.append('location', productData.location);
  formData.append('status', productData.status);

  return await api.patch<ProductDTO>(`/v1/products/${id}`, formData);
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
  await api.post(`/v1/products/${productId}/image`, formData);
}

/**
 * Replace an existing product image
 */
export async function replaceImage(productId: number, file: File): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  await api.post(`/v1/products/${productId}/image`, formData);
}

/**
 * Delete a product image
 */
export async function deleteProductImage(
  productId: number,
  imageId: number
): Promise<void> {
  await api.delete(`/v1/products/${productId}/image/${imageId}`);
}

/**
 * Get the catalog of products for the homepage
 */
export async function getCatalog(query?: string, category?: string, page: number = 0): Promise<HomePageDTO> {
  const params: Record<string, any> = {};
  if (query) params.query = query;
  if (category) params.category = category;
  params.page = page.toString();

  return await api.get<HomePageDTO>("/v1/catalog", { params });
}

/**
 * Send an inquiry about a product
 */
export async function sendInquiry(data: {
  productId: number;
  phone: string;
  type: string;
  message: string;
}): Promise<any> {
  return await api.post("/v1/inquiries", data);
}

// Funtion aiming to get a paged list of products
export async function getMoreProducts(page: number, query: string, category: string): Promise<PagedResponse<ProductDTO>> {
  const params: Record<string, any> = {
    page: page.toString(),
    size: '10'
  };
  
  if (query) params.query = query;
  if (category) params.category = category;

  return await api.get<PagedResponse<ProductDTO>>("/v1/products", { params });
}