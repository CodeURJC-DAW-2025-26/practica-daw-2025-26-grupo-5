package es.stilnovo.library.controller;

import jakarta.servlet.http.HttpServletRequest;
import java.security.Principal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

import es.stilnovo.library.repository.UserRepository;

@ControllerAdvice // This makes these attributes available to EVERY template automatically
public class GlobalControllerAdvice {

    @Autowired
    private UserRepository userRepository;

    @ModelAttribute
    public void addAttributes(Model model, HttpServletRequest request) {
        Principal principal = request.getUserPrincipal();

        if (principal != null) {
            // Fetch the user from the DB to get their real data for the Navbar
            userRepository.findByName(principal.getName()).ifPresent(user -> {
                model.addAttribute("logged", true);
                
                // Matches {{username}} in your HTML (line 32/51)
                model.addAttribute("username", user.getName());
                
                // Matches {{userId}} in your HTML (line 62)
                // IMPORTANT: Ensure getId() exists in your User.java entity
                model.addAttribute("userId", user.getUserId()); 
                
                // Essential for the Logout form to work in any page
                CsrfToken token = (CsrfToken) request.getAttribute("_csrf");
                if (token != null) {
                    model.addAttribute("token", token.getToken());
                }
            });
        } else {
            model.addAttribute("logged", false);
        }
    }
}