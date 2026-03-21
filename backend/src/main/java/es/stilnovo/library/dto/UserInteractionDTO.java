package es.stilnovo.library.dto;

import es.stilnovo.library.model.UserInteraction.InteractionType;

/**
 * Represents a user interaction event with a product (view, favorite, etc.).
 * 
 * @param id Unique interaction identifier
 * @param userId ID of the user who performed the interaction
 * @param type Type of interaction (e.g., VIEW, FAVORITE, PURCHASE)
 */
public record UserInteractionDTO(
        Long id,
        Long userId,
        InteractionType type
) {
}