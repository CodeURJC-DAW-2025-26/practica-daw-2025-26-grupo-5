import api from "./api";
import type ValorationDTO from "~/dto/ValorationDTO";
import type TransactionDTO from "~/dto/TransactionDTO";

/**
 * VALORATIONS SERVICE
 * Centralized API gateway for all valoration (review) operations
 * 
 * Responsibilities:
 * - Manage user valorations (reviews) lifecycle
 * - Track pending reviews needing submission
 * - Create, update, delete valorations
 * - Fetch paginated valoration data
 */

/**
 * Fetches both received valorations and pending transactions needing review
 * 
 * Returns:
 * - valorations: Reviews already submitted
 * - pendingTransactions: Purchases not yet rated
 * 
 * Used by: user-valorations.tsx
 */
export async function getValorationsDashboard(): Promise<{ 
  valorations: ValorationDTO[]; 
  pendingTransactions: TransactionDTO[] 
}> {
  // Fetch valorations and transactions in parallel (better performance)
  const [valoResponse, transResponse] = await Promise.all([
    api.get<any>("/v1/users/me/valorations?page=0&size=100"),
    api.get<any>("/v1/users/me/transactions")
  ]);

  // Extract received reviews and pending purchases
  const valorations = valoResponse.content || [];
  const purchasesWithReviews = new Set(
    valorations.map((v: any) => v.transactionId)
  );
  const pendingTransactions = (transResponse.orders || []).filter(
    (order: any) => !purchasesWithReviews.has(order.transactionId)
  );

  return { valorations, pendingTransactions };
}

/**
 * Fetches all valorations submitted by the current authenticated user
 */
export async function getUserValorations(): Promise<ValorationDTO[]> {
    return await api.get<ValorationDTO[]>("/v1/users/me/valorations");
}

/**
 * Fetches transactions that are completed but haven't been rated yet
 */
export async function getPendingValorations(): Promise<any[]> {
    return await api.get("/v1/transactions/me/pending-valoration");
}

/**
 * Submits a new valoration for a specific transaction
 */
export async function createValoration(data: { rating: number, comment: string, buyerName: string, transactionId: number }): Promise<ValorationDTO> {
    return await api.post<ValorationDTO>("/v1/valorations", data);
}

/**
 * Updates an existing valoration's rating and comment
 */
export async function updateValoration(id: number, data: { rating: number, comment: string }): Promise<ValorationDTO> {
    return await api.patch<ValorationDTO>(`/v1/valorations/${id}`, data);
}

/**
 * Deletes a valoration permanently
 */
export async function deleteValoration(id: number): Promise<void> {
    await api.delete(`/v1/valorations/${id}`);
}