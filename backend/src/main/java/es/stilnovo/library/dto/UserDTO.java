package es.stilnovo.library.dto;

import java.util.List;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * DTO: Data Transfer Object - Converts to/from JSON in REST API responses.
 * 
 * This record is ONLY used in REST Controllers as request/response bodies.
 * Record automatically generates: no-arg constructor, getters, toString, equals, hashCode.
 * Exposes user public profile information without sensitive authentication details.
 * 
 * Represents a user account with public profile and authentication role information.
 */
@Schema(description = "Represents a user account with public profile and authentication role information")
public record UserDTO(
        
        @Schema(description = "Unique user identifier", example = "5")
        Long id,
        
        @Schema(description = "User's display name", example = "Laura Martinez")
        String name,
        
        @Schema(description = "User's email address", example = "laura.martinez@example.com")
        String email,
        
        @Schema(description = "Average rating received by the user as a seller", example = "4.8")
        Double rating,
        
        @Schema(description = "Total number of ratings received", example = "34")
        int numRatings,
        
        @Schema(description = "User's profile description or biography", example = "Seller of vintage photography items.")
        String description,
        
        @Schema(description = "Payment card number", example = "1234567890123456")
        String cardNumber,
        
        @Schema(description = "Card expiration date", example = "12/25")
        String cardExpiringDate,
        
        @Schema(description = "Card CVV security code", example = "123")
        String cardCvv,
        
        @Schema(description = "List of assigned security roles (e.g., ROLE_USER, ROLE_ADMIN)")
        List<String> roles,
        
        @Schema(description = "Boolean indicating if the user account is banned", example = "false")
        boolean banned
) {
}