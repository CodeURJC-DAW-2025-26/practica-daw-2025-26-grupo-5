package es.stilnovo.library.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Represents a product image reference in the system.
 */
@Schema(description = "Represents a product image reference in the system")
public record ImageDTO(
    
    @Schema(description = "Unique identifier for the image", example = "101")
    Long id
) {  
}