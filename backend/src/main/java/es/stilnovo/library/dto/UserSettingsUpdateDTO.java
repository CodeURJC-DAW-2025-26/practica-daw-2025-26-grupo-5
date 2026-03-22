package es.stilnovo.library.dto;

import org.springframework.web.multipart.MultipartFile;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * DTO: Data Transfer Object - Converts to/from JSON in REST API responses.
 * 
 * This class is ONLY used in REST Controllers as request/response bodies.
 * Separates API request validation from business logic for clean architecture.
 * Supports file uploads (MultipartFile) for profile picture updates.
 * 
 * Request body for updating user account settings and profile information.
 * Supports updating profile picture, email, payment card details, and description.
 */
@Schema(description = "Request body for updating user account settings and profile information")
public class UserSettingsUpdateDTO {

    @Schema(description = "New profile picture image file")
    private MultipartFile newProfilePhoto;
    
    @Schema(description = "Updated email address", example = "new.email@example.com")
    private String newEmail;
    
    @Schema(description = "Updated payment card number", example = "1234567890123456")
    private String newCardNumber;
    
    @Schema(description = "Updated card CVV security code", example = "123")
    private String newCardCvv;
    
    @Schema(description = "Updated card expiration date", example = "11/26")
    private String newCardExpiringDate;
    
    @Schema(description = "Updated user profile description", example = "Updating my seller biography.")
    private String newDescription;

    public MultipartFile getNewProfilePhoto() {
        return newProfilePhoto;
    }

    public void setNewProfilePhoto(MultipartFile newProfilePhoto) {
        this.newProfilePhoto = newProfilePhoto;
    }

    public String getNewEmail() {
        return newEmail;
    }

    public void setNewEmail(String newEmail) {
        this.newEmail = newEmail;
    }

    public String getNewCardNumber() {
        return newCardNumber;
    }

    public void setNewCardNumber(String newCardNumber) {
        this.newCardNumber = newCardNumber;
    }

    public String getNewCardCvv() {
        return newCardCvv;
    }

    public void setNewCardCvv(String newCardCvv) {
        this.newCardCvv = newCardCvv;
    }

    public String getNewCardExpiringDate() {
        return newCardExpiringDate;
    }

    public void setNewCardExpiringDate(String newCardExpiringDate) {
        this.newCardExpiringDate = newCardExpiringDate;
    }

    public String getNewDescription() {
        return newDescription;
    }

    public void setNewDescription(String newDescription) {
        this.newDescription = newDescription;
    }
}