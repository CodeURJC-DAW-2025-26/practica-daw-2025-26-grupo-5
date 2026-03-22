package es.stilnovo.library.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * DTO: Data Transfer Object - Converts to/from JSON in REST API responses.
 * 
 * This record is ONLY used in REST Controllers as request/response bodies.
 * Record automatically generates: no-arg constructor, getters, toString, equals, hashCode.
 * Keeps business logic away from data transfer layer for clean architecture.
 * 
 * Contains checkout transaction information with product and buyer details.
 */
@Schema(description = "Contains checkout transaction information with product and buyer details")
public record CheckoutDTO(
        
        @Schema(description = "The product being purchased")
        ProductDTO product,
        
        @Schema(description = "The user completing the purchase")
        UserDTO buyer
) {
}