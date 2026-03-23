package es.stilnovo.library.dto;

import java.util.List;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * DTO: Data Transfer Object - Converts to/from JSON in REST API responses.
 * 
 * This record is ONLY used in REST Controllers as request/response bodies.
 * Benefits of record: Auto-generates no-arg constructor, getters, toString, equals, and hashCode.
 * Ensures clean separation between entity layer and API communication layer.
 * 
 * Represents a product with its core details, seller information, and user interactions.
 */
@Schema(description = "Represents a product with its core details, seller information, and user interactions")
public record ProductDTO(
        
        @Schema(description = "Unique product identifier", example = "1")
        Long id,
        
        @Schema(description = "Product name or title", example = "Mountain Bike")
        String name,
        
        @Schema(description = "Product category classification", example = "Sports")
        String category,
        
        @Schema(description = "Current selling price of the product", example = "120.50")
        Double price,
        
        @Schema(description = "Geographic location where the product is listed", example = "Madrid")
        String location,
        
        @Schema(description = "Detailed product description", example = "Mountain bike almost new, very little use.")
        String description,
        
        @Schema(description = "Product status (e.g., available, sold, inactive)", example = "available")
        String status,
        
        @Schema(description = "Product image reference")
        ImageDTO image,
        
        @Schema(description = "Information about the product seller")
        UserDTO seller,
        
        @Schema(description = "List of user interactions (views, purchases, etc.) on this product")
        List<UserInteractionDTO> userInteractions
) {
}