package es.stilnovo.library.dto;

public record AdminUserUpdateRequestDTO(
        String email,
        String cardNumber,
        String cardCvv,
        String cardExpiringDate,
        String description
) {
}