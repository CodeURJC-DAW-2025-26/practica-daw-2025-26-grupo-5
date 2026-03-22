package es.stilnovo.library.dto;

import java.util.List;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Represents a user account with public profile and authentication role information.
 */
@Schema(description = "Represents a user account with public profile and authentication role information")
public record UserDTO(
        
        @Schema(description = "Unique user identifier", example = "5")
        Long id,
        
        @Schema(description = "User's display name", example = "Laura Martínez")
        String name,
        
        @Schema(description = "User's email address", example = "laura.martinez@example.com")
        String email,
        
        @Schema(description = "Average rating received by the user as a seller", example = "4.8")
        Double rating,
        
        @Schema(description = "Total number of ratings received", example = "34")
        int numRatings,
        
        @Schema(description = "User's profile description or biography", example = "Vendedora de artículos de fotografía vintage.")
        String description,
        
        @Schema(description = "List of assigned security roles (e.g., ROLE_USER, ROLE_ADMIN)")
        List<String> roles,
        
        @Schema(description = "Boolean indicating if the user account is banned", example = "false")
        boolean banned
) {
}