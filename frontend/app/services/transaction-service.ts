import api from "./api";
import type ProductDTO from "~/dto/ProductDTO";
import type UserDTO from "~/dto/UserDTO";
import type CheckoutDTO from "~/dto/CheckoutDTO";

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