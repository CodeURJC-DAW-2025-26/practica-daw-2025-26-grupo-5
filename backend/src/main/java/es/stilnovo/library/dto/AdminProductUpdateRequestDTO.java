package es.stilnovo.library.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Request body for administrators to update product details.
 */
@Schema(description = "Request body for administrators to update product details")
public record AdminProductUpdateRequestDTO(
        
        @Schema(description = "Updated product name", example = "Vintage Camera - Updated")
        String name,
        
        @Schema(description = "Updated product category", example = "Photography")
        String category,
        
        @Schema(description = "Updated product price", example = "135.00")
        Double price,
        
        @Schema(description = "Updated product description", example = "Price reduced! Classic 35mm film camera.")
        String description,
        
        @Schema(description = "Updated product location", example = "Barcelona")
        String location,
        
        @Schema(description = "Updated product status", example = "inactive")
        String status
) {
}