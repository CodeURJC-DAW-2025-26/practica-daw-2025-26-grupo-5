package es.stilnovo.library.dto;

import es.stilnovo.library.model.UserInteraction.InteractionType;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * DTO: Data Transfer Object - Converts to/from JSON in REST API responses.
 * 
 * This record is ONLY used in REST Controllers as request/response bodies.
 * Record automatically generates: no-arg constructor, getters, toString, equals, hashCode.
 * Type-safe representation of user product interactions (views, favorites, etc.).
 * 
 * Represents a user interaction event with a product (view, favorite, etc.).
 */
@Schema(description = "Represents a user interaction event with a product (view, favorite, etc.)")
public record UserInteractionDTO(
        
        @Schema(description = "Unique interaction identifier", example = "204")
        Long id,
        
        @Schema(description = "ID of the user who performed the interaction", example = "12")
        Long userId,
        
        @Schema(description = "Type of interaction (e.g., VIEW, FAVORITE, PURCHASE)", example = "FAVORITE")
        InteractionType type
) {
}