package es.stilnovo.library.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * DTO: Data Transfer Object - Converts to/from JSON in REST API responses.
 * 
 * This record is ONLY used in REST Controllers as request/response bodies.
 * Record automatically generates: no-arg constructor, getters, toString, equals, hashCode.
 * Packages multi-source data into immutable structure for contact form scenarios.
 * 
 * Contains data for the contact seller page with product and buyer information.
 */
@Schema(description = "Contains data for the contact seller page with product and buyer information")
public record ContactSellerPageDTO(
        
        @Schema(description = "The product being inquired about")
        ProductDTO product,
        
        @Schema(description = "The seller of the product")
        UserDTO seller,
        
        @Schema(description = "Name of the buyer contacting the seller", example = "John Smith")
        String buyerName,
        
        @Schema(description = "Email address of the buyer", example = "juan.perez@example.com")
        String buyerEmail
) {
}