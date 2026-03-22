package es.stilnovo.library.dto;

import java.util.List;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Represents a product with its core details, seller information, and user interactions.
 */
@Schema(description = "Represents a product with its core details, seller information, and user interactions")
public record ProductDTO(
        
        @Schema(description = "Unique product identifier", example = "1")
        Long id,
        
        @Schema(description = "Product name or title", example = "Bicicleta de montaña")
        String name,
        
        @Schema(description = "Product category classification", example = "Deportes")
        String category,
        
        @Schema(description = "Current selling price of the product", example = "120.50")
        Double price,
        
        @Schema(description = "Geographic location where the product is listed", example = "Madrid")
        String location,
        
        @Schema(description = "Detailed product description", example = "Bicicleta casi nueva, muy poco uso.")
        String description,
        
        @Schema(description = "Product status (e.g., available, sold, inactive)", example = "available")
        String status,
        
        @Schema(description = "Product image reference")
        ImageDTO image,
        
        @Schema(description = "Information about the product seller")
        UserDTO seller,
        
        @Schema(description = "List of user interactions (views, favorites, etc.) on this product")
        List<UserInteractionDTO> userInteractions,
        
        @Schema(description = "Boolean indicating if the current user has favorited this product", example = "false")
        boolean favorite
) {
}