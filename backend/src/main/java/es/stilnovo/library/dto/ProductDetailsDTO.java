package es.stilnovo.library.dto;

import java.util.List;
import io.swagger.v3.oas.annotations.media.Schema;


/**
 * DTO: Data Transfer Object - Converts to/from JSON in REST API responses.
 * 
 * This record is ONLY used in REST Controllers as request/response bodies.
 * Record automatically provides: no-arg constructor, getters, toString, equals, hashCode.
 * Eliminates all boilerplate code for data transfer objects in the REST API layer.
 * 
 * Comprehensive product details page data including recommended products.
 */
@Schema(description = "Comprehensive product details page data including recommended products")
public record ProductDetailsDTO(
        
        @Schema(description = "The main product being displayed")
        ProductDTO product,
        
        @Schema(description = "List of products recommended to the user")
        List<ProductDTO> recommendedProducts,
        
        @Schema(description = "Boolean indicating if the user is logged in", example = "true")
        boolean logged
) {
}
