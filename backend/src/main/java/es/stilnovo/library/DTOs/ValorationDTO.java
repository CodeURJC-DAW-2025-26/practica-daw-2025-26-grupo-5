package es.stilnovo.library.DTOs;

public record ValorationDTO(
        Long id,
        int stars,
        String comment,
        Long transactionId,
        UserDTO seller,
        UserDTO buyer               
) {
}
