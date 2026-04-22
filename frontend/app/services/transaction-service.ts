import api from "./api";
import type ProductDTO from "~/dto/ProductDTO";
import type UserDTO from "~/dto/UserDTO";
import type CheckoutDTO from "~/dto/CheckoutDTO";
import type TransactionDTO from "~/dto/TransactionDTO";

/**
 * TRANSACTION SERVICE
 * Centralized API gateway for transaction/payment operations
 * 
 * Responsibilities:
 * - Checkout & payment processing
 * - Transaction history retrieval
 * - Sales & purchase management
 */

/**
 * Fetches all user transactions (sales & purchases combined)
 * 
 * Returns:
 * - sales: Transactions where user is seller
 * - orders: Transactions where user is buyer
 * 
 * Used by: user-sales-orders.tsx component
 */
export async function getUserTransactions(): Promise<{ 
  sales: TransactionDTO[]; 
  orders: TransactionDTO[] 
}> {
  return await api.get("/v1/users/me/transactions");
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