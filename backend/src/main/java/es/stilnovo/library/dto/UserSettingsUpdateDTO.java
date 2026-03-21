package es.stilnovo.library.dto;

import org.springframework.web.multipart.MultipartFile;

/**
 * Request body for updating user account settings and profile information.
 * Supports updating profile picture, email, payment card details, and description.
 */
public class UserSettingsUpdateDTO {

    private MultipartFile newProfilePhoto;
    private String newEmail;
    private String newCardNumber;
    private String newCardCvv;
    private String newCardExpiringDate;
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
