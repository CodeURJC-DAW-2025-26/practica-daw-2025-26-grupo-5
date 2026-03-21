package es.stilnovo.library.dto;

/**
 * Request body for administrators to update user account details.
 * 
 * @param email Updated email address
 * @param cardNumber Updated payment card number
 * @param cardCvv Updated card CVV security code
 * @param cardExpiringDate Updated card expiration date
 * @param description Updated user profile description
 */
public record AdminUserUpdateRequestDTO(
        String email,
        String cardNumber,
        String cardCvv,
        String cardExpiringDate,
        String description
) {
}