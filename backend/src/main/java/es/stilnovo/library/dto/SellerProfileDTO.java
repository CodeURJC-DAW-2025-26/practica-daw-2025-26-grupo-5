package es.stilnovo.library.dto;

import java.util.List;

/**
 * Comprehensive seller profile information with products and customer ratings.
 * 
 * @param seller The seller's user information
 * @param products List of products sold by this seller
 * @param valorations List of customer ratings and reviews for this seller
 * @param fullStars Average rating rounded to nearest integer
 * @param owner Boolean indicating if the current user is the profile owner
 */
public record SellerProfileDTO(
        UserDTO seller,
        List<ProductDTO> products,
        List<ValorationDTO> valorations,
        int fullStars,
        boolean owner
) {
}
