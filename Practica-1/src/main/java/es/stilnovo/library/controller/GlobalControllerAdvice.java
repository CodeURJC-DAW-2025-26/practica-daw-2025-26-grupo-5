package es.stilnovo.library.controller;

import es.stilnovo.library.model.User; // Ajusta a tu paquete
import es.stilnovo.library.repository.UserRepository; // Ajusta a tu paquete
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;
import java.security.Principal;

@ControllerAdvice
public class GlobalControllerAdvice {

    @Autowired
    private UserRepository userRepository;

    @ModelAttribute
    public void addAttributes(Model model, HttpServletRequest request) {
        Principal principal = request.getUserPrincipal();
        
        if (principal != null) {
            // Buscamos al usuario por su email/nombre (el que uses para loguear)
            User user = userRepository.findByName(principal.getName()).orElse(null);
            
            if (user != null) {
                model.addAttribute("logged", true);
                model.addAttribute("username", user.getName());
                model.addAttribute("userId", user.getUserId()); // ¡AQUÍ ESTÁ EL userId QUE FALTA!
            }
        } else {
            model.addAttribute("logged", false);
        }

        // Siempre mandamos el token CSRF para que el Logout no de error 403
        Object csrf = request.getAttribute("_csrf");
        if (csrf != null) {
            model.addAttribute("token", ((org.springframework.security.web.csrf.CsrfToken) csrf).getToken());
        }
    }
}