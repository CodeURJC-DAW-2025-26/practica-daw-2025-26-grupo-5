import type ProductDTO from "~/dto/ProductDTO";
import type UserDTO from "~/dto/UserDTO";
import type CheckoutDTO from "~/dto/CheckoutDTO";

/**
 * Checks if the current user is attempting to purchase their own product.
 * * @param product The product the user wants to interact with.
 * @param currentUser The currently authenticated user.
 * @returns {boolean} True if the user is the seller, false otherwise.
 */
export const isSelfPurchase = (product: ProductDTO, currentUser: UserDTO | null): boolean => {
    // If there is no user logged in, it cannot be a self-purchase
    if (!currentUser) {
        return false;
    }

    // If the product has no seller information, default to false to allow backend validation
    if (!product.seller || !product.seller.id) {
        return false;
    }

    // Compare the seller's ID with the current user's ID
    return product.seller.id === currentUser.id;
};

/**
 * Fetches the checkout summary from the backend.
 * * @param productId The ID of the product to checkout.
 * @param token The JWT authentication token.
 * @returns {Promise<CheckoutDTO>} The checkout details.
 * @throws Error if the request fails or if the backend rejects it (e.g., self_purchase).
 */
export const getCheckoutDetails = async (productId: number, token: string | null): Promise<CheckoutDTO> => {
    const response = await fetch(`/api/v1/transactions/${productId}/checkout`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
    });

    if (!response.ok) {
        // Extract the JSON error from the backend if possible
        const errorData = await response.json().catch(() => null);
        
        // Handle the specific backend exception we saw in your logs
        if (errorData && errorData.error === 'self_purchase') {
            throw new Error("You cannot purchase your own product.");
        }

        throw new Error("Failed to fetch checkout details.");
    }

    return await response.json();
};