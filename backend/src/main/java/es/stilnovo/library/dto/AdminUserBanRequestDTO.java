package es.stilnovo.library.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Request body for administrators to ban or unban a user account.
 */
@Schema(description = "Request body for administrators to ban or unban a user account")
public record AdminUserBanRequestDTO(
        
        @Schema(description = "Boolean indicating whether to ban (true) or unban (false) the user", example = "true")
        boolean banned
) {
}