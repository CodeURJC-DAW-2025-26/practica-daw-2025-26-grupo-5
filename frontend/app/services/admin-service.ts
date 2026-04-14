import api from "./api";
import type UserDTO from "~/dto/UserDTO";
import type ProductDTO from "~/dto/ProductDTO";
import type PagedResponse from "~/dto/PagedResponse";
import type AdminSummaryDTO from "~/dto/AdminSummaryDTO";
import type TransactionDTO from "~/dto/TransactionDTO";
import type ValorationDTO from "~/dto/ValorationDTO";

/**
 * --- DASHBOARD & GENERAL ---
 */

export const getAdminSummary = async (): Promise<AdminSummaryDTO> => {
  const response = await api.get<AdminSummaryDTO>("/v1/admin/summary");
  return response.data;
};

/**
 * --- USERS MANAGEMENT ---
 */

export const getAdminUsers = async (page = 0, size = 10): Promise<PagedResponse<UserDTO>> => {
  const response = await api.get<PagedResponse<UserDTO>>("/v1/admin/users", {
    params: { page, size },
  });
  return response.data;
};

export const banUser = async (userId: number, ban: boolean): Promise<UserDTO> => {
  const response = await api.put<UserDTO>(`/v1/admin/users/${userId}/ban`, { banned: ban });
  return response.data;
};

export const deleteUser = async (userId: number): Promise<void> => {
  await api.delete(`/v1/admin/users/${userId}`);
};

export const updateUser = async (userId: number, updateData: { name?: string; email?: string; }): Promise<UserDTO> => {
  const response = await api.put<UserDTO>(`/v1/admin/users/${userId}`, updateData);
  return response.data;
};

/**
 * --- INVENTORY / PRODUCTS ---
 */

export const getAdminProducts = async (page = 0, size = 10): Promise<PagedResponse<ProductDTO>> => {
  const response = await api.get<PagedResponse<ProductDTO>>("/v1/admin/products", {
    params: { page, size },
  });
  return response.data;
};

export const deleteProduct = async (productId: number): Promise<void> => {
  await api.delete(`/v1/admin/products/${productId}`);
};

export const createProduct = async (formData: FormData): Promise<ProductDTO> => {
  const response = await api.post<ProductDTO>("/v1/admin/products", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const updateProduct = async (productId: number, productData: any): Promise<ProductDTO> => {
  const response = await api.put<ProductDTO>(`/v1/admin/products/${productId}`, productData);
  return response.data;
};

/**
 * --- TRANSACTIONS ---
 */

export const getAdminTransactions = async (page = 0, size = 10): Promise<PagedResponse<TransactionDTO>> => {
  const response = await api.get<PagedResponse<TransactionDTO>>("/v1/admin/transactions", {
    params: { page, size },
  });
  return response.data;
};

/**
 * --- VALORATIONS ---
 */

export const getAdminValorations = async (page = 0, size = 10): Promise<PagedResponse<ValorationDTO>> => {
  const response = await api.get<PagedResponse<ValorationDTO>>("/v1/admin/valorations", {
    params: { page, size },
  });
  return response.data;
};

export const deleteValoration = async (valorationId: number): Promise<void> => {
  await api.delete(`/v1/admin/valorations/${valorationId}`);
};