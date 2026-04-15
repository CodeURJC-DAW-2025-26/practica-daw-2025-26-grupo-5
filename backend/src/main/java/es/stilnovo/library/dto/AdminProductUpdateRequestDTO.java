package es.stilnovo.library.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * DTO: Data Transfer Object - Converts to/from JSON in REST API responses.
 * 
 * This record is ONLY used in REST Controllers as request/response bodies.
 * Record automatically generates: no-arg constructor, getters, toString, equals, hashCode.
 * Ensures type-safe request validation for administrative product modifications.
 * 
 * Request body for administrators to update product details.
 */
@Schema(description = "Request body for administrators to update product details")
public record AdminProductUpdateRequestDTO(
        
        @Schema(description = "ID of the seller who owns the product", example = "1")
        Long sellerId,
        
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