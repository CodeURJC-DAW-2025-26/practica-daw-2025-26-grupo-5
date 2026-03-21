package es.stilnovo.library.dto;

import java.util.List;

/**
 * Represents a user account with public profile and authentication role information.
 * 
 * @param id Unique user identifier
 * @param name User's display name
 * @param email User's email address
 * @param rating Average rating received by the user as a seller
 * @param numRatings Total number of ratings received
 * @param description User's profile description or biography
 * @param roles List of assigned security roles (e.g., ROLE_USER, ROLE_ADMIN)
 * @param banned Boolean indicating if the user account is banned
 */
public record UserDTO(
        Long id,
        String name,
        String email,
        Double rating,
        int numRatings,
        String description,
        List<String> roles,
        boolean banned
) {
}