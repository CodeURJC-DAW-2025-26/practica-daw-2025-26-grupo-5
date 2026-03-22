package es.stilnovo.library.controller;

import java.io.IOException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import es.stilnovo.library.service.SignupService;

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

    @Autowired
    private SignupService signupService;

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
            @RequestParam String confirmPassword) throws IOException {
        try {
            // Delegate to service: validates password match, email uniqueness, username uniqueness
            // Creates new user with profile picture and default settings
            signupService.registerUser(profilePicture, username, email, password, confirmPassword);
            // 302 redirect to login page on success (user must log in with new credentials)
            return "redirect:/login-page";
        } catch (org.springframework.web.server.ResponseStatusException exception) {
            // Re-display form with error message if validation fails (username exists, etc)
            model.addAttribute("error", exception.getReason());
            model.addAttribute("username", username);
            model.addAttribute("email", email);
            return "signup-page";
        }
    }
}