package es.stilnovo.library.dto;

import java.util.List;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Comprehensive seller profile information with products and customer ratings.
 */
@Schema(description = "Comprehensive seller profile information with products and customer ratings")
public record SellerProfileDTO(
        
        @Schema(description = "The seller's user information")
        UserDTO seller,
        
        @Schema(description = "List of products sold by this seller")
        List<ProductDTO> products,
        
        @Schema(description = "List of customer ratings and reviews for this seller")
        List<ValorationDTO> valorations,
        
        @Schema(description = "Average rating rounded to nearest integer", example = "4")
        int fullStars,
        
        @Schema(description = "Boolean indicating if the current user is the profile owner", example = "true")
        boolean owner
) {
}