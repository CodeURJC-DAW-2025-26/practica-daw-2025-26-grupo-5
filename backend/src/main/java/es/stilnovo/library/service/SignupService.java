package es.stilnovo.library.service;

import java.io.IOException;
import java.sql.Blob;

import org.hibernate.engine.jdbc.proxy.BlobProxy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import es.stilnovo.library.model.User;

/**
 * SignupService: Handles user registration and account creation
 * 
 * This service manages:
 * - User input validation (password matching, username/email uniqueness)
 * - Password encoding with bcrypt
 * - Profile picture upload and handling
 * - Default profile image assignment if none provided
 * - New user account creation with default roles and settings
 */
@Service
public class SignupService {

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Registers a new user in the system with validation and profile setup
     * @param profilePicture Optional profile picture file
     * @param username Unique username for the new account
     * @param email Unique email address
     * @param password Account password
     * @param confirmPassword Confirmation of password
     * @return Created User entity with default settings
     * @throws IOException If image processing fails
     * @throws ResponseStatusException 400 if passwords don't match, 409 if username/email exists
     */
    public User registerUser(MultipartFile profilePicture, String username, String email, String password,
            String confirmPassword)
            throws IOException {
        // STEP 1: Validate password confirmation match
        if (!password.equals(confirmPassword)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Passwords do not match");
        }
        // STEP 2: Check username uniqueness - prevent duplicate usernames
        if (userService.usernameExists(username)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "The username is already taken");
        }
        // STEP 3: Check email uniqueness - prevent duplicate accounts per email
        if (userService.emailExists(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "The email is already registered");
        }

        // STEP 4: Encode password with bcrypt algorithm for secure storage
        String encodedPassword = passwordEncoder.encode(password);
        // STEP 5: Handle profile image: upload if provided, else assign default
        Blob imageBlob = resolveProfileImage(profilePicture);
        // STEP 6: Create new user entity with default values (0 balance, ROLE_USER)
        User newUser = new User(username, encodedPassword, email, imageBlob, 0.0, null, null, null, 0, 0.0, 0.0, null,
                "ROLE_USER");
        // STEP 7: Persist to database
        userService.save(newUser);
        return newUser;
    }

    /**
     * Resolves user profile image: uploads if provided, otherwise assigns default.
     * Default image prevents null profile pictures for new users.
     */
    private Blob resolveProfileImage(MultipartFile profilePicture) throws IOException {
        // If user uploaded a profile picture, use it
        if (profilePicture != null && !profilePicture.isEmpty()) {
            return BlobProxy.generateProxy(profilePicture.getInputStream(), profilePicture.getSize());
        }

        // Default fallback: load default "no profile picture" image from resources
        Resource defaultUserImage = new ClassPathResource("static/images/no-profile-picture.png");
        return BlobProxy.generateProxy(defaultUserImage.getInputStream(), defaultUserImage.contentLength());
    }
}