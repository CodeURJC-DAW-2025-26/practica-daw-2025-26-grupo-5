package es.stilnovo.library.dto;

public record SignupRequestDTO(
        String username,
        String email,
        String password,
        String confirmPassword
) {
}