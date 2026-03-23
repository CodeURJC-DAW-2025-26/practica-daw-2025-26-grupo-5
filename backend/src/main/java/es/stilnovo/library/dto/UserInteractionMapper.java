package es.stilnovo.library.dto;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import es.stilnovo.library.model.UserInteraction;

/**
 * UserInteractionMapper: Converts between UserInteraction entity and UserInteractionDTO (MapStruct).
 * 
 * Tracks user actions: views, purchases, etc.
 * - Extracts user ID for flat API response
 * - Hides product relationship object (populated by service layer)
 */
@Mapper(componentModel = "spring")
public interface UserInteractionMapper {

    /**
     * Convert UserInteraction entity to UserInteractionDTO for API.
     * Extracts user ID from nested user object.
     * @param interaction the UserInteraction entity
     * @return UserInteractionDTO with userId and interaction data
     */
    @Mapping(source = "user.userId", target = "userId")
    UserInteractionDTO toDTO(UserInteraction interaction);

    /**
     * Convert UserInteractionDTO to UserInteraction entity.
     * Ignores user and product relationships (set by service logic).
     * @param userInteractionDTO the DTO data
     * @return UserInteraction entity (relationships handled separately)
     */
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "product", ignore = true)
    UserInteraction toEntity(UserInteractionDTO userInteractionDTO);
}