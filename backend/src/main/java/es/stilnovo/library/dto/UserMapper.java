package es.stilnovo.library.dto;

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
    @Mapping(target = "profileImage", ignore = true)
    @Mapping(target = "cardNumber", ignore = true)
    @Mapping(target = "cardnumber", ignore = true)
    @Mapping(target = "cardCvv", ignore = true)
    @Mapping(target = "cardExpiringDate", ignore = true)
    @Mapping(target = "userDescription", ignore = true)
    @Mapping(target = "numratings", ignore = true)
    @Mapping(target = "balance", ignore = true)
    @Mapping(target = "totalRevenue", ignore = true)
    @Mapping(target = "products", ignore = true)
    @Mapping(target = "favoriteProducts", ignore = true)
    @Mapping(target = "valorations", ignore = true)
    User toEntity(UserDTO userDTO);
}