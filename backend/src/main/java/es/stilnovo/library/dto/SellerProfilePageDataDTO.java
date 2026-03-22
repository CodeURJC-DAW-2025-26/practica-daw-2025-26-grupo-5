package es.stilnovo.library.dto;

import java.util.List;
import es.stilnovo.library.model.User;
import es.stilnovo.library.model.Valoration;
import es.stilnovo.library.model.Product;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Contains raw data for rendering a seller profile page, including entity models.
 */
@Schema(description = "Contains raw data for rendering a seller profile page, including entity models")
public record SellerProfilePageDataDTO(
        
        @Schema(description = "The seller user entity")
        User seller,
        
        @Schema(description = "List of valuations (ratings) received by the seller")
        List<Valoration> sellerValorations,
        
        @Schema(description = "List of products listed by the seller")
        List<Product> sellerProducts,
        
        @Schema(description = "Total count of items sold by the seller", example = "42")
        int itemsCount,
        
        @Schema(description = "Average rating rounded to nearest integer", example = "4")
        int fullStars,
        
        @Schema(description = "Boolean indicating if the current user is viewing their own profile", example = "false")
        boolean owner
) {
}