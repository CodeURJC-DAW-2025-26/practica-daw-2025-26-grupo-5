package es.stilnovo.library.DTOs;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import es.stilnovo.library.model.User;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(source = "userId", target = "id")
    UserDTO toDTO(User user);
    
    List<UserDTO> toDTOs(List<User> users);

    @Mapping(source = "id", target = "userId")
    @Mapping(target = "encodedPassword", ignore = true) 
    @Mapping(target = "products", ignore = true)
    @Mapping(target = "favoriteProducts", ignore = true)
    @Mapping(target = "valorations", ignore = true)
    User toEntity(UserDTO userDTO);
}