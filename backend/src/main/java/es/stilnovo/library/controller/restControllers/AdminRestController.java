package es.stilnovo.library.controller.restControllers;

import java.io.IOException;
import java.net.URI;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import es.stilnovo.library.dto.AdminProductCreateRequestDTO;
import es.stilnovo.library.dto.AdminProductUpdateRequestDTO;
import es.stilnovo.library.dto.AdminSummaryDTO;
import es.stilnovo.library.dto.AdminUserBanRequestDTO;
import es.stilnovo.library.dto.AdminUserUpdateRequestDTO;
import es.stilnovo.library.dto.PagedResponse;
import es.stilnovo.library.dto.ProductDTO;
import es.stilnovo.library.dto.ProductMapper;
import es.stilnovo.library.dto.TransactionDTO;
import es.stilnovo.library.dto.TransactionMapper;
import es.stilnovo.library.dto.UserDTO;
import es.stilnovo.library.dto.UserMapper;
import es.stilnovo.library.dto.ValorationDTO;
import es.stilnovo.library.dto.ValorationMapper;
import es.stilnovo.library.model.Product;
import es.stilnovo.library.model.User;
import es.stilnovo.library.model.Valoration;
import es.stilnovo.library.service.AdminService;
import es.stilnovo.library.service.ProductService;
import es.stilnovo.library.service.TransactionService;
import es.stilnovo.library.service.UserService;
import es.stilnovo.library.service.ValorationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * REST controller for administrative operations.
 * Provides management endpoints for users, products, transactions, and valorations.
 */
@RestController
@RequestMapping("/api/v1/admin")
@Tag(name = "Admin", description = "REST API for administrative operations (users, products, transactions, valorations)")
public class AdminRestController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private UserService userService;

    @Autowired
    private ProductService productService;

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private ValorationService valorationService;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private ProductMapper productMapper;

    @Autowired
    private TransactionMapper transactionMapper;

    @Autowired
    private ValorationMapper valorationMapper;

    // --- ADMIN SUMMARY ---

    /**
     * Retrieves high-level administrative statistics and data overview.
     * @return AdminSummaryDTO containing user counts, memory usage, and recent items.
     */
    @GetMapping("/summary")
    @Operation(summary = "Get admin summary", description = "Retrieves high-level administrative statistics and data overview")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Summary retrieved successfully")
    })
    public AdminSummaryDTO getAdminPanel() {
        var panelData = adminService.getAdminPanelData();
        return new AdminSummaryDTO(
                panelData.numUsers(),
                panelData.numBanneds(),
                panelData.memoryUsage(),
                userMapper.toDTOs(panelData.users()),
                productMapper.toDTOs(panelData.products()),
                panelData.totalProductCount(),
                panelData.totalRevenue());
    }

    // --- USER MANAGEMENT ---

    /**
     * Retrieves a paginated list of all users.
     * @param pageable Pagination and sorting information.
     * @return PagedResponse of UserDTOs.
     */
    @GetMapping("/users")
    @Operation(summary = "Get all users", description = "Retrieves a paginated list of all users")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Users retrieved successfully")
    })
    public PagedResponse<UserDTO> getUsers(@PageableDefault(size = 10) Pageable pageable) {
        var page = adminService.getUsersPage(pageable);
        return new PagedResponse<>(userMapper.toDTOs(page.getContent()), page.getNumber(), page.getSize(),
                page.getTotalElements(), page.isLast());
    }

    /**
     * Retrieves details of a specific user.
     * @param id The ID of the user.
     * @return UserDTO representing the requested user.
     */
    @GetMapping("/users/{id}")
    @Operation(summary = "Get user by ID", description = "Retrieves details of a specific user by their ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    public UserDTO getUserById(@PathVariable Long id) {
        User user = userService.findById(id)
        	.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return userMapper.toDTO(user);
    }

    /**
     * Updates an existing user's information and profile photo.
     * @param id The ID of the user to update.
     * @param request DTO containing updated user fields.
     * @param newProfilePhoto Optional multipart file for the new profile image.
     * @return Updated UserDTO.
     * @throws IOException If image processing fails.
     */
    @PatchMapping(value = "/users/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Update user", description = "Updates an existing user's information and profile photo")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input or image processing failed"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<UserDTO> updateUser(
        @PathVariable Long id,
        @ModelAttribute AdminUserUpdateRequestDTO request,
        @RequestParam(value = "newProfilePhoto", required = false) MultipartFile newProfilePhoto) throws IOException {

        adminService.updateUserAsAdmin(
                id,
                newProfilePhoto,
                request.email(),
                request.cardNumber(),
                request.cardCvv(),
                request.cardExpiringDate(),
                request.description());

        User updatedUser = userService.findById(id).orElseThrow();
        return ResponseEntity.ok(userMapper.toDTO(updatedUser));
    }

    /**
     * Updates the ban status of a user.
     * @param id The ID of the user.
     * @param request DTO containing the desired ban status.
     * @return UserDTO with updated ban status.
     */
    @PutMapping("/users/ban/{id}")
    @Operation(summary = "Update user ban status", description = "Updates the ban status of a specific user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Ban status updated successfully"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    public UserDTO updateUserBanStatus(@PathVariable Long id, @RequestBody AdminUserBanRequestDTO request) {
        return userMapper.toDTO(adminService.setBanStatus(id, request.banned()));
    }

    /**
     * Deletes a user from the system.
     * @param id The ID of the user to remove.
     * @return Success message.
     */
    @DeleteMapping("/users/{id}")
    @Operation(summary = "Delete user", description = "Deletes a user from the system")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User deleted successfully"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<UserDTO> deleteUser(@PathVariable Long id) {
        UserDTO user = userMapper.toDTO(userService.getPublicProfileById(id));

        adminService.deleteUser(id);
        return ResponseEntity.ok(user);
    }

    // --- PRODUCT MANAGEMENT ---

    /**
     * Retrieves a paginated list of all products in the inventory.
     * @param pageable Pagination and sorting information.
     * @return PagedResponse of ProductDTOs.
     */
    @GetMapping("/products")
    @Operation(summary = "Get all products", description = "Retrieves a paginated list of all products in the inventory")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Products retrieved successfully")
    })
    public PagedResponse<ProductDTO> getProducts(@PageableDefault(size = 10) Pageable pageable) {
        var page = adminService.getInventoryPage(pageable);
        return new PagedResponse<>(productMapper.toDTOs(page.getContent()), page.getNumber(), page.getSize(),
                page.getTotalElements(), page.isLast());
    }

    /**
     * Retrieves details of a specific product.
     * @param id The ID of the product.
     * @return ProductDTO representing the requested product.
     */
    @GetMapping("/products/{id}")
    @Operation(summary = "Get product by ID", description = "Retrieves details of a specific product by its ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Product retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Product not found")
    })
    public ProductDTO getProductById(@PathVariable Long id) {
        Product product = productService.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return productMapper.toDTO(product);
    }

    /**
     * Creates a new product as an administrator.
     * @param request DTO containing product details.
     * @param file Optional multipart file for the product image.
     * @return Created ProductDTO.
     * @throws IOException If image processing fails.
     */
    @PostMapping(value = "/products", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Create product", description = "Creates a new product as an administrator")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Product created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input or image processing failed")
    })
    public ResponseEntity<ProductDTO> createProduct(
            @ModelAttribute AdminProductCreateRequestDTO request,
            @RequestParam(value = "image", required = false) MultipartFile file) throws IOException {

        Product product = adminService.createProductAsAdmin(
                request.sellerId(),
                request.name(),
                request.category(),
                request.description(),
                request.price(),
                request.location(),
                request.status() != null ? request.status() : "Active",
                file);

        // Set Location header pointing to the newly created product resource
        URI location = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/v1/products/{id}")
                .buildAndExpand(product.getId())
                .toUri();
        return ResponseEntity.created(location).body(productMapper.toDTO(product));
    }

    /**
     * Updates an existing product's details and image.
     * @param id The ID of the product to update.
     * @param request DTO containing updated product fields.
     * @param file Optional multipart file for the new product image.
     * @return Updated ProductDTO.
     * @throws IOException If image processing fails.
     */
    @PatchMapping(value = "/products/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Update product", description = "Updates an existing product's details and image")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Product updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input or image processing failed"),
        @ApiResponse(responseCode = "404", description = "Product not found")
    })
    public ResponseEntity<ProductDTO> updateProduct(
            @PathVariable Long id,
            @ModelAttribute AdminProductUpdateRequestDTO request,
            @RequestParam(value = "image", required = false) MultipartFile file) throws IOException {

        adminService.updateProductAsAdmin(
                id,
                request.sellerId(),
                request.name(),
                request.category(),
                request.price(),
                request.description(),
                request.location(),
                request.status(),
                file);

        Product finalProduct = productService.findById(id).orElseThrow();
        return ResponseEntity.ok(productMapper.toDTO(finalProduct));
    }

    /**
     * Deletes a product from the inventory.
     * @param id The ID of the product to remove.
     * @return Success message.
     */
    @DeleteMapping("/products/{id}")
    @Operation(summary = "Delete product", description = "Deletes a product from the inventory")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Product deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Product not found")
    })
    public ResponseEntity<ProductDTO> deleteProduct(@PathVariable Long id) {
        Product productEntity = productService.findById(id)
            .orElseThrow();

        ProductDTO productDto = productMapper.toDTO(productEntity);

        adminService.deleteProductAsAdmin(id);

        return ResponseEntity.ok(productDto);
    }

    // --- TRANSACTION MANAGEMENT ---

    /**
     * Retrieves a paginated list of all system transactions.
     * @param pageable Pagination and sorting information.
     * @return PagedResponse of TransactionDTOs.
     */
    @GetMapping("/transactions")
    @Operation(summary = "Get all transactions", description = "Retrieves a paginated list of all system transactions")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Transactions retrieved successfully")
    })
    public PagedResponse<TransactionDTO> getTransactions(@PageableDefault(size = 10) Pageable pageable) {
        var page = adminService.getTransactionsPage(pageable);
        return new PagedResponse<>(transactionMapper.toDTOs(page.getContent()), page.getNumber(), page.getSize(),
                page.getTotalElements(), page.isLast());
    }

    /**
     * Deletes a specific transaction record.
     * @param id The ID of the transaction to remove.
     * @return Success message.
     */
    @DeleteMapping("/transactions/{id}")
    @Operation(summary = "Delete transaction", description = "Deletes a specific transaction record")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Transaction deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Transaction not found")
    })
    public ResponseEntity<TransactionDTO> deleteTransaction(@PathVariable Long id) {
        TransactionDTO transaction = transactionService.getTransactionById(id);
        transactionService.deleteTransaction(id);
        return ResponseEntity.ok(transaction);
    }

    /**
     * Retrieves the detailed information of a specific transaction.
     * @param id The unique identifier of the transaction.
     * @return ResponseEntity containing the TransactionDTO.
     */
    @GetMapping("/transactions/{id}")
    @Operation(summary = "Get transaction by ID", description = "Retrieves the detailed information of a specific transaction")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Transaction retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Transaction not found")
    })
    public ResponseEntity<TransactionDTO> getTransactionById(@PathVariable Long id) {
        TransactionDTO transaction = transactionService.getTransactionById(id);
        
        return ResponseEntity.ok(transaction);
    }

    // --- VALORATION MANAGEMENT ---

    /**
     * Retrieves a paginated list of all user valorations/reviews.
     * @param pageable Pagination and sorting information.
     * @return PagedResponse of ValorationDTOs.
     */
    @GetMapping("/valorations")
    @Operation(summary = "Get all valorations", description = "Retrieves a paginated list of all user valorations/reviews")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Valorations retrieved successfully")
    })
    public PagedResponse<ValorationDTO> getValorations(@PageableDefault(size = 10) Pageable pageable) {
        var page = adminService.getValorationsPage(pageable);
        return new PagedResponse<>(valorationMapper.toDTOs(page.getContent()), page.getNumber(), page.getSize(),
                page.getTotalElements(), page.isLast());
    }

    /**
     * Deletes a specific valoration.
     * @param id The ID of the valoration to remove.
     * @return Success message.
     */
    @DeleteMapping("/valorations/{id}")
    @Operation(summary = "Delete valoration", description = "Deletes a specific valoration")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Valoration deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Valoration not found")
    })
    public ResponseEntity<ValorationDTO> deleteValoration(@PathVariable Long id) {

        Valoration valorationEntity = valorationService.findById(id);

        ValorationDTO valoration = valorationMapper.toDTO(valorationEntity);

        valorationService.deleteById(id);

        return ResponseEntity.ok(valoration);
    }
}