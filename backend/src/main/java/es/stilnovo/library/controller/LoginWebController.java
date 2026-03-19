package es.stilnovo.library.controller;

import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import jakarta.servlet.http.HttpServletRequest;

/**
 * LoginWebController: Handles user authentication and login pages
 * 
 * This controller manages:
 * - Login form display with CSRF protection
 * - Failed login error handling
 * - Banned user detection and restriction
 * - Login error messages
 * - Banned user informational page
 * 
 * Uses: No service - works directly with Spring Security
 */
@Controller
public class LoginWebController {

    /**
     * Display login form with CSRF token
     * 
     * @param model   UI data model
     * @param request HTTP request
     * @return login-page template
     */
    @GetMapping("/login-page")
    public String login(Model model, HttpServletRequest request) {

        CsrfToken token = (CsrfToken) request.getAttribute("_csrf");
        if (token != null) {
            model.addAttribute("token", token.getToken());
        }

        return "login-page";
    }

    /**
     * Display login form with error message after failed authentication
     * 
     * @param model   UI data model
     * @param request HTTP request
     * @return login-page template with error flag
     */
    @GetMapping("/login-error")
    public String loginError(Model model, HttpServletRequest request) {

        CsrfToken token = (CsrfToken) request.getAttribute("_csrf");
        if (token != null) {
            model.addAttribute("token", token.getToken());
        }

        model.addAttribute("loginError", true);
        return "login-page";
    }

    /**
     * Display banned account notification page
     * 
     * @return banned-page template
     */
    @GetMapping("/banned")
    public String bannedPage() {
        return "banned-page";
    }
}
