package es.stilnovo.library.dto;

import org.springframework.web.multipart.MultipartFile;

public record AdminUserUpdateRequestDTO(
        String email,
        String cardNumber,
        String cardCvv,
        String cardExpiringDate,
        String description
) {
}