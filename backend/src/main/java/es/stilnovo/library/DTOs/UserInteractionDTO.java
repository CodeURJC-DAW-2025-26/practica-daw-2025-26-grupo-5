package es.stilnovo.library.DTOs;

import es.stilnovo.library.model.UserInteraction.InteractionType;

public record UserInteractionDTO(
        Long id,
        Long userId,
        InteractionType type
) {
}