package es.stilnovo.library.controller.restControllers;

import java.security.Principal;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ModelAttribute;

import es.stilnovo.library.dto.ProductMapper;
import es.stilnovo.library.dto.SellerProfileDTO;
import es.stilnovo.library.dto.UserDTO;
import es.stilnovo.library.dto.UserSettingsUpdateDTO;
import es.stilnovo.library.dto.UserStatisticsDataDTO;
import es.stilnovo.library.dto.ValorationDTO;
import es.stilnovo.library.dto.UserMapper;
import es.stilnovo.library.dto.ValorationMapper;
import es.stilnovo.library.service.ContactSellerService;
import es.stilnovo.library.service.ProductService;
import es.stilnovo.library.service.UserService;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/v1/users")
public class UserWebRestController {

    @Autowired
    private UserService userService;

    @Autowired
    private ProductService productService;

    @Autowired
    private ContactSellerService contactSellerService;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private ProductMapper productMapper;

    @Autowired
    private ValorationMapper valorationMapper;

    /**
     * This section refers to the current (principal) user.
     */
    @GetMapping("/me")
    public UserDTO getCurrentUser(Principal principal) {
        return userMapper.toDTO(userService.getFullUserProfile(principal.getName()));
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteMyAccount(Principal principal) {
        userService.deleteUserSelf(principal.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me/profile-photo")
    public ResponseEntity<Resource> getMyProfilePhoto(Principal principal) throws SQLException {
        Resource my_image = userService.getProfilePhotoResourceByUsername(principal.getName());
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .body(my_image);
    }

    @PutMapping("/me/profile-photo")
    public ResponseEntity<UserDTO> putMethodName(Principal principal, @RequestParam("image") MultipartFile file)
            throws IOException {
        String nameToModify = principal.getName();
        UserDTO updatedUser = userMapper.toDTO(userService.getFullUserProfile(nameToModify));

        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping(value = "/me/profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UserDTO updateMySettings(@ModelAttribute UserSettingsUpdateDTO request, Principal principal)
            throws IOException {
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

    @GetMapping("/me/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardData(Principal principal) {
        var dashboardData = userService.getUserDashboardData(principal.getName());

        return ResponseEntity.ok(Map.of(
                "user", userMapper.toDTO(dashboardData.user()),
                "totalRevenue", dashboardData.user().getTotalRevenue(),
                "balance", dashboardData.user().getBalance(),
                "chartLabels", dashboardData.chartLabels(),
                "chartValues", dashboardData.chartValues(),
                "salesCount", dashboardData.userSales()));
    }

    @GetMapping("/me/transactions")
    public ResponseEntity<Map<String, Object>> getMyTransactions(Principal principal,
            @RequestParam(required = false) Long transactionId) {
        Map<String, Object> data = userService.getSalesAndOrdersDashboard(principal.getName(), transactionId);
        // Note: Here we should map the Map objects to DTOs if they contain JPA entities
        return ResponseEntity.ok(data);
    }

    @GetMapping("/me/valorations")
    public ResponseEntity<List<ValorationDTO>> getMyValorations(Principal principal) {
        var user = userService.getFullUserProfile(principal.getName());
        return ResponseEntity.ok(valorationMapper.toDTOs(user.getValorations()));
    }

    @GetMapping("me/statistics")
    public ResponseEntity<UserStatisticsDataDTO> getStatictis(Principal principal) {
        var statisticsData = userService.getUserStatisticsData(principal.getName());

        return ResponseEntity.ok(statisticsData);
    }

    /**
     * This section refers to other users (sellers).
     */
    @GetMapping("/{id}/profile")
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

    @GetMapping("/{id}/profile-photo")
    public ResponseEntity<Resource> getPublicProfilePhoto(@PathVariable Long id) throws SQLException {
        Resource image = userService.getProfilePhotoResourceById(id);
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .body(image);
    }

    @GetMapping("{id}/contact-info")
    public ResponseEntity<Map<String, Object>> getContactInfo(@PathVariable int id, Principal principal) {
        try {
            var pageData = contactSellerService.getContactSellerPageData(id, principal.getName());

            Map<String, Object> responseData = Map.of(
                    "product", productMapper.toDTO(pageData.product()),
                    "seller", userMapper.toDTO(pageData.seller()),
                    "buyerName", pageData.buyerName(),
                    "buyerEmail", pageData.buyerEmail());

            return ResponseEntity.ok(responseData);

        } catch (IllegalStateException exception) {
            return ResponseEntity.badRequest().body(Map.of("error", "You cannot self order a product"));
        }

    }

}