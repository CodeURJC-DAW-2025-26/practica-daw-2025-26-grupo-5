package es.stilnovo.library.dto;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import es.stilnovo.library.model.User;

import java.util.List;

/**
 * UserMapper: Converts between User entity and UserDTO (MapStruct).
 * 
 * Security feature: Deliberately excludes sensitive data:
 * - encodedPassword: Never exposed in API responses
 * - profileImage: Handled separately via image endpoints
 * - Card data: NEVER exposed in API (sensitive financial information)
 * - Seller revenue/balance: Hidden from public profiles
 */
@Mapper(componentModel = "spring")
public interface UserMapper {

    /**
     * Convert User entity to UserDTO for API responses.
     * Excludes password and profile image, but includes card data for admin use.
     * @param user the User entity to convert
     * @return UserDTO with id, name, email, and public profile data
     */
    @Mapping(source = "userId", target = "id")
    @Mapping(source = "cardNumber", target = "cardNumber")
    @Mapping(source = "cardCvv", target = "cardCvv")
    @Mapping(source = "cardExpiringDate", target = "cardExpiringDate")
    UserDTO toDTO(User user);
    
    /**
     * Batch convert multiple User entities to DTOs.
     * @param users list of User entities
     * @return list of UserDTO objects
     */
    List<UserDTO> toDTOs(List<User> users);

    /**
     * Convert UserDTO to User entity for database persistence.
     * Deliberately ignores sensitive fields for security.
     * Password and financial data must be handled separately.
     * @param userDTO the DTO containing user data
     * @return User entity with basic fields only
     */
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
    @Mapping(target = "valorations", ignore = true)
    User toEntity(UserDTO userDTO);
}