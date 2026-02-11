package es.stilnovo.library.controller;

import java.security.Principal;
import java.sql.SQLException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import org.springframework.ui.Model;
import es.stilnovo.library.model.User;
import es.stilnovo.library.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;

@Controller
public class UserWebController {

    @Autowired
    private UserRepository userRepository;

    // ... other methods like /profile or /edit-profile ...

    /**
     * Endpoint to retrieve a specific user's profile photo from the database.
     * It fetches the Blob content and returns it as a streaming image resource.
     */
    @GetMapping("/user/{id}/profile-photo")
    public ResponseEntity<Object> getProfilePhoto(@PathVariable long id) throws SQLException {
        
        // Find the user in the database; throws an exception if the ID doesn't exist
        User user = userRepository.findById(id).orElseThrow();
        
        // Check if the user has a profile image (stored as a Blob)
        if (user.getProfileImage() != null) {
            Resource file = new InputStreamResource(user.getProfileImage().getBinaryStream());
            
            return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG) // Adjust the media type if necessary
                .body(file);
        }
        
        // Return a 404 Not Found if the user exists but has no image
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/user-page/{id}")
    public String showUserPage(Model model, @PathVariable long id, HttpServletRequest request) {
    
        // 1. Buscamos al usuario por su ID
        User user = userRepository.findById(id).orElseThrow();
    
        // 2. Pasamos los datos del usuario a la plantilla user-page.html
        model.addAttribute("user", user);
    
        // 3. Comprobamos si el que mira la página es el dueño del perfil
        Principal principal = request.getUserPrincipal();
        if (principal != null && principal.getName().equals(user.getName())) {
        model.addAttribute("isOwner", true);
        }

        return "user-page"; 
    }
}