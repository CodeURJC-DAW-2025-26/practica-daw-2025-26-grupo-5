package es.stilnovo.library.controller;

import java.io.IOException;
import java.sql.Blob;
import es.stilnovo.library.model.User;

import org.hibernate.engine.jdbc.proxy.BlobProxy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import es.stilnovo.library.service.UserService;

import org.springframework.ui.Model;

import jakarta.servlet.http.HttpServletRequest;

/**
 * SignupWebController: Handles user registration and account creation
 * 
 * This controller manages:
 * - Signup form display
 * - User registration validation
 * - Password confirmation checking
 * - Profile picture upload (with default fallback)
 * - New user account creation with default values
 * - Redirect to login after successful signup
 * 
 * Uses: UserService, PasswordEncoder
 */
@Controller
public class SignupWebController {

    @GetMapping("/error")
    public String signupError() {
        return "error"; 
    }

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /** Display signup form with CSRF protection */
    @GetMapping("/signup-page")
    public String signup(Model model, HttpServletRequest request) {
        // STEP 1: Extract CSRF token for secure form submission
        CsrfToken token = (CsrfToken) request.getAttribute("_csrf");
        if (token != null) {
            model.addAttribute("token", token.getToken());
        }
        
        return "signup-page"; 
    }

    /** Process account creation with validation */
    @PostMapping("/signup-page")
    public String createAccount(Model model, 
                                @RequestParam MultipartFile profilePicture, 
                                @RequestParam String username,
                                @RequestParam String email,
                                @RequestParam String password,
                                @RequestParam String confirmPassword) throws IOException{
        // STEP 1: Validate passwords match
        if (!password.equals(confirmPassword)) {
            model.addAttribute("error", "Passwords do not match!");
            model.addAttribute("username", username);
            model.addAttribute("email", email);
            return "signup-page";
        }
        
        // Check the user is not already registered
        if (userService.usernameExists(username)) {
            model.addAttribute("error", "The username is already taken!");
            model.addAttribute("email", email);
            return "signup-page";
        }

        // Check the email is not already registered
        if (userService.emailExists(email)) {
            model.addAttribute("error", "El correo electrónico ya está registrado.");
            model.addAttribute("username", username);
            return "signup-page";
        }

        // STEP 2: Encrypt password using BCrypt
        String encodedPassword = passwordEncoder.encode(password);

        // STEP 3: Process profile picture or assign default image
        Blob imageBlob = null;
        if (profilePicture != null && !profilePicture.isEmpty()) {
            imageBlob = BlobProxy.generateProxy(
                profilePicture.getInputStream(), 
                profilePicture.getSize()
            );
        }else{
            Resource defaultUserImage = new ClassPathResource("static/images/no-profile-picture.png");
            Blob photoUserBlob = BlobProxy.generateProxy(defaultUserImage.getInputStream(), defaultUserImage.contentLength());
            imageBlob = photoUserBlob;
        }
        
        // STEP 4: Create new user entity with default values (5.0 rating, ROLE_USER)
        User newUser = new User(username, encodedPassword, email, imageBlob, 5.0, null, null, null , 0, 0.0, 0.0, null, "ROLE_USER");

        // STEP 5: Persist user to database via service layer
        userService.save(newUser);

        // STEP 6: Redirect to login page after successful registration
        return "redirect:/login-page";
    }
}