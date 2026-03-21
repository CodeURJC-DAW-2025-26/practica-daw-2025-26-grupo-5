package es.stilnovo.library.dto;

/**
 * Request body for administrators to ban or unban a user account.
 * 
 * @param banned Boolean indicating whether to ban (true) or unban (false) the user
 */
public record AdminUserBanRequestDTO(
        boolean banned
) {
}
