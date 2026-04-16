import api from "./api";
import type ValorationDTO from "~/dto/ValorationDTO";

/**
 * Fetches all valorations submitted by the current authenticated user.
 */
export async function getUserValorations(): Promise<ValorationDTO[]> {
    const response = await api.get("/v1/users/me/valorations");
    return response.data;
}

/**
 * Fetches transactions that are completed but haven't been rated yet.
 */
export async function getPendingValorations(): Promise<any[]> {
    const response = await api.get("/v1/transactions/me/pending-valoration");
    return response.data;
}

/**
 * Submits a new valoration for a specific transaction.
 */
export async function createValoration(data: { stars: number, comment: string, buyerName: string, transactionId: number }): Promise<ValorationDTO> {
    const response = await api.post("/v1/valorations", data);
    return response.data;
}

/**
 * Updates an existing valoration's stars and comment.
 */
export async function updateValoration(id: number, data: { stars: number, comment: string }): Promise<ValorationDTO> {
    const response = await api.patch(`/v1/valorations/${id}`, data);
    return response.data;
}

/**
 * Deletes a valoration permanently.
 */
export async function deleteValoration(id: number): Promise<void> {
    await api.delete(`/v1/valorations/${id}`);
}