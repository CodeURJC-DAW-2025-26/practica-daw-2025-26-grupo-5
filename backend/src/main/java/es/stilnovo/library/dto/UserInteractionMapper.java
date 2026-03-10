package es.stilnovo.library.dto;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import es.stilnovo.library.model.UserInteraction;

@Mapper(componentModel = "spring")
public interface UserInteractionMapper {

    @Mapping(source = "user.userId", target = "userId")
    UserInteractionDTO toDTO(UserInteraction interaction);

    @Mapping(target = "user", ignore = true)
    @Mapping(target = "product", ignore = true)
    UserInteraction toEntity(UserInteractionDTO userInteractionDTO);
}