package es.stilnovo.library.dto;

import org.springframework.web.multipart.MultipartFile;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * DTO: Data Transfer Object - Converts to/from JSON in REST API responses.
 * 
 * This record is ONLY used in REST Controllers as request/response bodies.
 * Record automatically generates: no-arg constructor, getters, toString, equals, hashCode.
 * Handles file upload (MultipartFile) for profile picture initialization during registration.
 * 
 * Request body for user account registration with profile picture upload.
 */
@Schema(description = "Request body for user account registration with profile picture upload")
public record SignupRequestDTO(
        
        @Schema(description = "User's profile picture image file")
        MultipartFile profilePicture,
        
        @Schema(description = "Desired username for the new account", example = "johndoe88")
        String username,
        
        @Schema(description = "User's email address", example = "johndoe@example.com")
        String email,
        
        @Schema(description = "Account password", example = "SecurePass123!")
        String password,
        
        @Schema(description = "Password confirmation for validation", example = "SecurePass123!")
        String confirmPassword
) {
}