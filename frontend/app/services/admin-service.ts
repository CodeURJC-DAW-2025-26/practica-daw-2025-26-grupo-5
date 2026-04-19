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
  return await api.get<AdminSummaryDTO>("/v1/admin/summary");
};

/**
 * --- USERS MANAGEMENT ---
 */

export const getAdminUsers = async (page = 0, size = 10): Promise<PagedResponse<UserDTO>> => {
  return await api.get<PagedResponse<UserDTO>>("/v1/admin/users", {
    params: { page, size },
  });
};

export const banUser = async (userId: number, ban: boolean): Promise<UserDTO> => {
  return await api.put<UserDTO>(`/v1/admin/users/ban/${userId}`, { banned: ban });
};

export const deleteUser = async (userId: number): Promise<void> => {
  await api.delete(`/v1/admin/users/${userId}`);
};

export const updateUser = async (userId: number, formData: FormData): Promise<UserDTO> => {
  return await api.patch<UserDTO>(`/v1/admin/users/${userId}`, formData);
};

/**
 * --- INVENTORY / PRODUCTS ---
 */

export const getAdminProducts = async (page = 0, size = 10): Promise<PagedResponse<ProductDTO>> => {
  return await api.get<PagedResponse<ProductDTO>>("/v1/admin/products", {
    params: { page, size },
  });
};

export const deleteProduct = async (productId: number): Promise<void> => {
  await api.delete(`/v1/admin/products/${productId}`);
};

export const createProduct = async (formData: FormData): Promise<ProductDTO> => {
  return await api.post<ProductDTO>("/v1/admin/products", formData);
};

export const updateProduct = async (productId: number, formData: FormData): Promise<ProductDTO> => {
  return await api.patch<ProductDTO>(`/v1/admin/products/${productId}`, formData);
};

/**
 * --- TRANSACTIONS ---
 */

export const getAdminTransactions = async (page = 0, size = 10): Promise<PagedResponse<TransactionDTO>> => {
  return await api.get<PagedResponse<TransactionDTO>>("/v1/admin/transactions", {
    params: { page, size },
  });
};

/**
 * --- VALORATIONS ---
 */

export const getAdminValorations = async (page = 0, size = 10): Promise<PagedResponse<ValorationDTO>> => {
  return await api.get<PagedResponse<ValorationDTO>>("/v1/admin/valorations", {
    params: { page, size },
  });
};

export const deleteValoration = async (valorationId: number): Promise<void> => {
  await api.delete(`/v1/admin/valorations/${valorationId}`);
};