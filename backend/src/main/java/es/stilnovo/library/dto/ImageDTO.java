package es.stilnovo.library.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * DTO: Data Transfer Object - Converts to/from JSON in REST API responses.
 * 
 * This record is ONLY used in REST Controllers as request/response bodies.
 * Record automatically handles: no-arg constructor, getters, toString, equals, hashCode.
 * Eliminates boilerplate code for data transfer between API and client applications.
 * 
 * Represents a product image reference in the system.
 */
@Schema(description = "Represents a product image reference in the system")
public record ImageDTO(
    
    @Schema(description = "Unique identifier for the image", example = "101")
    Long id
) {  
}