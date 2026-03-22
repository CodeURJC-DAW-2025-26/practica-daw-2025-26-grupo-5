package es.stilnovo.library.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * DTO: Data Transfer Object - Converts to/from JSON in REST API responses.
 * 
 * This record is ONLY used in REST Controllers as request/response bodies.
 * Benefits of record: Auto-generates no-arg constructor, getters, toString, equals, and hashCode.
 * Ensures DTOs remain pure data carriers without business logic.
 * 
 * Request body for administrators to ban or unban a user account.
 */
@Schema(description = "Request body for administrators to ban or unban a user account")
public record AdminUserBanRequestDTO(
        
        @Schema(description = "Boolean indicating whether to ban (true) or unban (false) the user", example = "true")
        boolean banned
) {
}