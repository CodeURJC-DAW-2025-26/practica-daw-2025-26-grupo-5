package es.stilnovo.library.dto;

import es.stilnovo.library.model.UserInteraction.InteractionType;

public record UserInteractionDTO(
        Long id,
        Long userId,
        InteractionType type
) {
}