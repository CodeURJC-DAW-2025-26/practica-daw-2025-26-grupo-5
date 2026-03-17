package es.stilnovo.library.controller.restControllers;

import java.security.Principal;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ModelAttribute;

import es.stilnovo.library.dto.ProductDTO;
import es.stilnovo.library.dto.ProductMapper;
import es.stilnovo.library.dto.SellerProfileDTO;
import es.stilnovo.library.dto.UserDTO;
import es.stilnovo.library.dto.UserSettingsUpdateDTO;
import es.stilnovo.library.dto.ValorationDTO;
import es.stilnovo.library.dto.UserMapper;
import es.stilnovo.library.dto.ValorationMapper;
import es.stilnovo.library.model.Product;
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
    private UserMapper userMapper;

    @Autowired
    private ProductMapper productMapper;

    @Autowired
    private ValorationMapper valorationMapper;

    @GetMapping("/me")
    public UserDTO getCurrentUser(Principal principal) {
        return userMapper.toDTO(userService.getFullUserProfile(principal.getName()));
    }
    
    @GetMapping("/me/profile-photo")
    public ResponseEntity<Resource> getMyProfilePhoto(Principal principal) throws SQLException {
        Resource my_image = userService.getProfilePhotoResourceByUsername(principal.getName());
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .body(my_image);
    }

    @GetMapping("/me/products")
    public ResponseEntity<List<ProductDTO>> getMyProducts(Principal principal) {
        var user = productService.getAuthenticatedUserWithProducts(principal.getName());
        return ResponseEntity.ok(productMapper.toDTOs(user.getProducts()));
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
            "salesCount", dashboardData.userSales()
        ));
    }

    @GetMapping("/me/transactions")
    public ResponseEntity<Map<String, Object>> getMyTransactions(Principal principal, 
            @RequestParam(required = false) Long transactionId) {
        Map<String, Object> data = userService.getSalesAndOrdersDashboard(principal.getName(), transactionId);
        // Nota: Aquí deberiamos mapear los objetos del Map a DTOs si contienen entidades JPA
        return ResponseEntity.ok(data);
    }

    @GetMapping("/me/valorations")
    public ResponseEntity<List<ValorationDTO>> getMyValorations(Principal principal) {
        var user = userService.getFullUserProfile(principal.getName());
        return ResponseEntity.ok(valorationMapper.toDTOs(user.getValorations()));
    }

    @DeleteMapping("/me/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable long id, Principal principal) {
        productService.deleteProduct(id, principal.getName());
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/me/products", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductDTO> createProduct(
            Principal principal,
            @RequestParam String productName,
            @RequestParam String category,
            @RequestParam String description,
            @RequestParam double price,
            @RequestParam String location,
            @RequestParam String status,
            @RequestParam("productPhoto") MultipartFile productPhoto) throws IOException { // Singular

        productService.addProduct(principal, List.of(productPhoto), productName, category, description, price, location, status);

        var user = productService.getAuthenticatedUserWithProducts(principal.getName());
        
        Product newProduct = user.getProducts().stream()
                .filter(p -> p.getName().equals(productName))
                .findFirst()
                .orElse(user.getProducts().get(user.getProducts().size() - 1));

        return ResponseEntity.status(HttpStatus.CREATED).body(productMapper.toDTO(newProduct));
    }

    @PutMapping(value = "/me/products/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductDTO> editProduct(
            @PathVariable long id,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Double price,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String category,
            @RequestParam(name = "productPhotos", required = false) List<MultipartFile> productPhotos,
            Principal principal) throws IOException {

        Product currentProduct = productService.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        if (name != null) currentProduct.setName(name);
        if (price != null) currentProduct.setPrice(price);
        if (description != null) currentProduct.setDescription(description);
        if (location != null) currentProduct.setLocation(location);
        if (category != null) currentProduct.setCategory(category);

        productService.updateProductSafely(id, currentProduct, principal.getName(), productPhotos);

        return ResponseEntity.ok(productMapper.toDTO(currentProduct));
    }
    
    @PutMapping(value = "/me/profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
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
    
    
    
}