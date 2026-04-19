import api from "./api";
import type ValorationDTO from "~/dto/ValorationDTO";

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