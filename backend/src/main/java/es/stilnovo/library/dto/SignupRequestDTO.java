package es.stilnovo.library.dto;

import org.springframework.web.multipart.MultipartFile;

/**
 * Request body for user account registration with profile picture upload.
 * 
 * @param profilePicture User's profile picture image file
 * @param username Desired username for the new account
 * @param email User's email address
 * @param password Account password
 * @param confirmPassword Password confirmation for validation
 */
public record SignupRequestDTO(
        MultipartFile profilePicture,
        String username,
        String email,
        String password,
        String confirmPassword
) {
}