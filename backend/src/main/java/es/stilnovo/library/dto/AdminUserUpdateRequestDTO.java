package es.stilnovo.library.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * DTO: Data Transfer Object - Converts to/from JSON in REST API responses.
 * 
 * This record is ONLY used in REST Controllers as request/response bodies.
 * Record automatically generates: no-arg constructor, getters, toString, equals, hashCode.
 * Provides type-safe administrative user modification with validation.
 * 
 * Request body for administrators to update user account details.
 */
@Schema(description = "Request body for administrators to update user account details")
public record AdminUserUpdateRequestDTO(
        
        @Schema(description = "Updated email address", example = "user.updated@example.com")
        String email,
        
        @Schema(description = "Updated payment card number", example = "1234567890123456")
        String cardNumber,
        
        @Schema(description = "Updated card CVV security code", example = "123")
        String cardCvv,
        
        @Schema(description = "Updated card expiration date", example = "12/25")
        String cardExpiringDate,
        
        @Schema(description = "Updated user profile description", example = "Reliable buyer and seller since 2024.")
        String description
) {
}