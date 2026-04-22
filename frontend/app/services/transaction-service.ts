import api from "./api";
import type ProductDTO from "~/dto/ProductDTO";
import type UserDTO from "~/dto/UserDTO";
import type CheckoutDTO from "~/dto/CheckoutDTO";
import type TransactionDTO from "~/dto/TransactionDTO";

/**
 * Represents the structured response from the backend API for user transactions.
 * Groups the data into two distinct categories: items the user has sold and items the user has purchased.
 * * @property {TransactionDTO[]} sales - List of transactions where the current user acted as the seller.
 * @property {TransactionDTO[]} orders - List of transactions where the current user acted as the buyer.
 */
export interface TransactionsResponse {
    sales: TransactionDTO[];
    orders: TransactionDTO[]; 
}

/**
 * Checks if the current user is attempting to purchase their own product.
 */
export const isSelfPurchase = (product: ProductDTO, currentUser: UserDTO | null): boolean => {
    if (!currentUser) {
        return false;
    }

    if (!product.seller || !product.seller.id) {
        return false;
    }

    return product.seller.id === currentUser.id;
};

/**
 * Fetches the checkout summary from the backend
 */
export const getCheckoutDetails = async (productId: number): Promise<CheckoutDTO> => {
    return await api.get<CheckoutDTO>(`/v1/transactions/${productId}/checkout`);
};

/**
 * Processes the creation of a transaction (payment)
 */
export async function createTransaction(productId: number): Promise<any> {
    return await api.post("/v1/transactions", { productId });
}

/**
 * Fetches the transactions of the user
 * @returns transactions of current user
 */
export async function getTransactions(){
    return await api.get<TransactionsResponse>("/v1/users/me/transactions");
}