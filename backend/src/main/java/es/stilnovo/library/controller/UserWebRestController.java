package es.stilnovo.library.controller;

import java.security.Principal;
import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ModelAttribute;

import es.stilnovo.library.dto.ProductMapper;
import es.stilnovo.library.dto.SellerProfileDTO;
import es.stilnovo.library.dto.UserDTO;
import es.stilnovo.library.dto.UserSettingsUpdateDTO;
import es.stilnovo.library.dto.UserMapper;
import es.stilnovo.library.dto.ValorationMapper;
import es.stilnovo.library.service.ProductService;
import es.stilnovo.library.service.UserService;

@RestController
@RequestMapping("/api/v1/users")
public class UserWebRestController {

    @Autowired
    private UserService userService;

    @Autowired
    private ProductService productService;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private ProductMapper productMapper;

    @Autowired
    private ValorationMapper valorationMapper;

    @GetMapping("/me")
    public UserDTO getCurrentUser(Principal principal) {
        return userMapper.toDTO(userService.getFullUserProfile(principal.getName()));
    }

    @GetMapping("/{id}/seller-profile")
    public SellerProfileDTO getSellerProfile(@PathVariable long id, Principal principal) {
        var seller = userService.getPublicProfileById(id);
        boolean owner = principal != null && principal.getName().equals(seller.getName());
        return new SellerProfileDTO(
                userMapper.toDTO(seller),
                productMapper.toDTOs(seller.getProducts()),
                valorationMapper.toDTOs(seller.getValorations()),
                productService.calculateFullStars(seller),
                owner);
    }

    @PutMapping(value = "/me/settings", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UserDTO updateMySettings(@ModelAttribute UserSettingsUpdateDTO request, Principal principal) throws IOException {
        userService.updateUserSettings(
                principal.getName(),
                request.getNewProfilePhoto(),
                request.getNewEmail(),
                request.getNewCardNumber(),
                request.getNewCardCvv(),
                request.getNewCardExpiringDate(),
                request.getNewDescription());

        return userMapper.toDTO(userService.getFullUserProfile(principal.getName()));
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteMyAccount(Principal principal) {
        userService.deleteUserSelf(principal.getName());
        return ResponseEntity.noContent().build();
    }
}
