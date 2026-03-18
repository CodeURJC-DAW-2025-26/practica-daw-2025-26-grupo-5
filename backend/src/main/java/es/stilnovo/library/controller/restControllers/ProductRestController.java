package es.stilnovo.library.controller.restControllers;

import java.io.IOException;
import java.net.URI;
import java.security.Principal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import es.stilnovo.library.dto.ContactSellerPageDTO;
import es.stilnovo.library.dto.PagedResponse;
import es.stilnovo.library.dto.ProductDTO;
import es.stilnovo.library.dto.ProductDetailsDTO;
import es.stilnovo.library.dto.ProductMapper;
import es.stilnovo.library.dto.ProductWriteRequestDTO;
import es.stilnovo.library.dto.UserMapper;
import es.stilnovo.library.model.Product;
import es.stilnovo.library.model.User;
import es.stilnovo.library.service.CatalogPageResult;
import es.stilnovo.library.service.ContactSellerService;
import es.stilnovo.library.service.MainService;
import es.stilnovo.library.service.ProductService;

/**
 * REST Controller for managing Product-related operations.
 * Provides endpoints for catalog browsing, personalized recommendations,
 * and authenticated user product management (CRUD).
 */
@RestController
@RequestMapping("/api/v1/products")
public class ProductRestController {

    @Autowired
    private ProductService productService;

    @Autowired
    private ProductMapper productMapper;

    @Autowired
    private MainService mainService;

    @Autowired
	private ContactSellerService contactSellerService;

	@Autowired
	private UserMapper userMapper;

    /**
     * Retrieves a paginated list of products from the global catalog.
     * Supports filtering by search query and category.
     *
     * @param query    Optional search string to filter by name or description.
     * @param category Optional category name to filter products.
     * @param pageable Pagination parameters (page, size, sort).
     * @param principal The security context of the user (optional).
     * @return PagedResponse containing product data and pagination metadata.
     */
    @GetMapping
    public PagedResponse<ProductDTO> getProducts(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String category,
            @PageableDefault(size = 10) Pageable pageable,
            Principal principal) {
        
        User user = mainService.getUserContext(principal != null ? principal.getName() : null);
        CatalogPageResult page = productService.getCatalogPage(query, category, user, pageable);
        
        return new PagedResponse<>(
                productMapper.toDTOs(page.products()),
                page.page(),
                page.size(),
                page.totalElements(),
                page.last());
    }


    /**
     * Retrieves all necessary data to populate the "Contact Seller" interface for a specific product.
     * This endpoint aggregates the product details, the seller's public information, 
     * and the authenticated buyer's pre-filled contact data (name and email) to 
     * facilitate communication.
     *
     * @param id        The unique identifier of the product the user is interested in.
     * @param principal The security context of the authenticated user (prospective buyer).
     * @return ContactSellerPageDTO containing the product DTO, seller DTO, and buyer's basic info.
     */
    @GetMapping("/{id}/contact")
    public ContactSellerPageDTO getContactSellerData(@PathVariable long id, Principal principal) {
        // 1. Delegate business logic to fetch aggregated page data
        var pageData = contactSellerService.getContactSellerPageData(id, principal.getName());
        
        // 2. Map domain entities to DTOs and return the composite object
        return new ContactSellerPageDTO(
                productMapper.toDTO(pageData.product()),
                userMapper.toDTO(pageData.seller()),
                pageData.buyerName(),
                pageData.buyerEmail());
    }

    /*Private secction for user*/
    /**
     * Retrieves the authenticated user's personal inventory.
     *
     * @param principal The security context of the logged-in user.
     * @return List of products owned by the current user.
     */
    @GetMapping("/me")
    public ResponseEntity<List<ProductDTO>> getMyProducts(Principal principal) {
        var user = productService.getAuthenticatedUserWithProducts(principal.getName());
        return ResponseEntity.ok(productMapper.toDTOs(user.getProducts()));
    }

    /**
     * Retrieves a list of recommended products for the authenticated user.
     *
     * @param principal The security context of the logged-in user.
     * @return List of recommended products.
     */
    @GetMapping("/recommendations")
    public List<ProductDTO> getRecommendations(Principal principal) {
        User user = mainService.getUserContext(principal != null ? principal.getName() : null);
        return productMapper.toDTOs(productService.getRecommendations(user));
    }

    /**
     * Retrieves full product details including recommendations and tracks the visit.
     * This method is essential for updating user statistics and providing related items.
     *
     * InfoProductPage
     * 
     * @param id        Unique identifier of the product.
     * @param principal The security context of the user (optional).
     * @return ProductDetailsDTO containing the main product, recommendations, and login status.
     * @throws ResponseStatusException 404 if the product is not found.
     */
    @GetMapping("/{id}")
    public ProductDetailsDTO getProductDetails(@PathVariable long id, Principal principal) {
        // 1. Get user context if logged in
        User user = principal != null ? mainService.getUserContext(principal.getName()) : null;
        
        // 2. Fetch the main product
        Product product = productService.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        // 3. Logic: Record the view for statistics (CRITICAL for dashboard data)
        if (user != null) {
            productService.recordView(user, product);
        }

        // 4. Logic: Fetch personalized recommendations excluding the current product
        List<Product> recommendations = productService.getRecommendations(user);
        recommendations.removeIf(current -> current.getId().equals(id));

        // 5. Return composite DTO
        return new ProductDetailsDTO(
                productMapper.toDTO(product),
                productMapper.toDTOs(recommendations),
                user != null);
    }

    /**
     * Creates a new product for the authenticated user.
     * As the service returns void, the new product is retrieved from the database 
     * after creation to return its data.
     *
     * @param request   DTO containing product text data and multipart files.
     * @param principal The security context of the logged-in user.
     * @return 201 Created response with the new product data.
     * @throws IOException If file processing fails.
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductDTO> createProduct(
            @ModelAttribute ProductWriteRequestDTO request, 
            Principal principal) throws IOException {
        
        // 1. Trigger product creation (Service is void)
        productService.addProduct(
                principal,
                request.getFiles(),
                request.getName(),
                request.getCategory(),
                request.getDescription(),
                request.getPrice() != null ? request.getPrice() : 0.0,
                request.getLocation(),
                request.getStatus() != null ? request.getStatus() : "Active");

        // 2. Recovery: Fetch the newly created product from the user's updated list
        var user = productService.getAuthenticatedUserWithProducts(principal.getName());
        Product newProduct = user.getProducts().stream()
                .filter(p -> p.getName().equals(request.getName()))
                .findFirst()
                .orElse(user.getProducts().get(user.getProducts().size() - 1));

        // 3. Build response with URI location
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(newProduct.getId())
                .toUri();

        return ResponseEntity.created(location).body(productMapper.toDTO(newProduct));
    }

    /**
     * Updates an existing product. 
     * Performs a partial update (Merge) to prevent data loss on omitted fields.
     *
     * @param id        ID of the product to update.
     * @param request   DTO containing updated fields.
     * @param principal The security context of the logged-in user.
     * @return The updated ProductDTO.
     * @throws IOException If file processing fails.
     */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductDTO> updateProduct(
            @PathVariable long id,
            @ModelAttribute ProductWriteRequestDTO request,
            Principal principal) throws IOException {

        // 1. Fetch current database state for merging
        Product current = productService.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        // 2. Merge logic: apply changes only if fields are present in the request
        if (request.getName() != null) current.setName(request.getName());
        if (request.getPrice() != null) current.setPrice(request.getPrice());
        if (request.getDescription() != null) current.setDescription(request.getDescription());
        if (request.getCategory() != null) current.setCategory(request.getCategory());
        if (request.getLocation() != null) current.setLocation(request.getLocation());
        if (request.getStatus() != null) current.setStatus(request.getStatus());

        // 3. Execute secure update via service
        productService.updateProductSafely(id, current, principal.getName(), request.getFiles());

        return ResponseEntity.ok(productMapper.toDTO(current));
    }

    /**
     * Deletes a product. Ownership is verified at the service layer.
     *
     * @param id        ID of the product to delete.
     * @param principal The security context of the logged-in user.
     * @return 204 No Content response on success.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id, Principal principal) {
        productService.deleteProduct(id, principal.getName());
        return ResponseEntity.noContent().build();
    }
}