package es.stilnovo.library.controller;

import es.stilnovo.library.model.User;
import es.stilnovo.library.service.UserService; 
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;
import java.security.Principal;

@ControllerAdvice
public class GlobalControllerAdvice {

    @Autowired
    private UserService userService;

    @ModelAttribute
    public void addAttributes(Model model, HttpServletRequest request) {
        Principal principal = request.getUserPrincipal();
        
        if (principal != null) {
            // Use service layer instead of direct repository access
            User user = userService.findByName(principal.getName()).orElse(null);
            
            if (user != null) {
                model.addAttribute("logged", true);
                model.addAttribute("username", user.getName());
                model.addAttribute("userId", user.getUserId()); // Here is the missing userId
            }
        } else {
            model.addAttribute("logged", false);
        }

        // We always send the CSRF token so Logout doesn't return a 403 error
        Object csrf = request.getAttribute("_csrf");
        if (csrf != null) {
            model.addAttribute("token", ((org.springframework.security.web.csrf.CsrfToken) csrf).getToken());
        }
    }
}