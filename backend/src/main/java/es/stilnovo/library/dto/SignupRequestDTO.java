package es.stilnovo.library.dto;

import org.springframework.web.multipart.MultipartFile;

public record SignupRequestDTO(
        MultipartFile profilePicture,
        String username,
        String email,
        String password,
        String confirmPassword
) {
}