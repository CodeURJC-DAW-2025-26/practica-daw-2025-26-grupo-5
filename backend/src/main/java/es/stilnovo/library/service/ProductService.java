package es.stilnovo.library.service;

import java.io.IOException;
import java.security.Principal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import es.stilnovo.library.model.Image;
import es.stilnovo.library.model.Product;
import es.stilnovo.library.model.User;
import es.stilnovo.library.model.UserInteraction;
import es.stilnovo.library.repository.ProductRepository;
import es.stilnovo.library.repository.UserInteractionRepository;
import es.stilnovo.library.repository.UserRepository;
import jakarta.transaction.Transactional;

/**
 * ProductService: Manages all product-related operations
 * 
 * This service handles:
 * - Product CRUD operations (create, read, update, delete)
 * - Product search and filtering (by name, category, seller)
 * - Product availability status management
 * - Product image handling
 * - Personalized product recommendations based on user interactions
 * - User interaction tracking (views, likes, purchases)
 * 
 * Uses: ProductRepository, UserRepository, ImageService, UserInteractionRepository
 */
@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserInteractionRepository userInteractionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ImageService imageService;
    
    /** Checks if a product exists by ID */
    public boolean exist(long id) {
        return productRepository.existsById(id);
    }

    public List<Product> findAll() {
        return productRepository.findAll();
    }

    /** Gets a product by ID from database */
    public Optional<Product> findById(long id) {
        return productRepository.findById(id);
    }

    public void deleteById(long id) {
        productRepository.deleteById(id);
    }

    /** Retrieves all products with a specific status (Active, Inactive, Sold) */
    public List<Product> findProductsByStatus(String status){
        return productRepository.findByStatus(status);
    }

    // Search methods
    public void save(Product product) {
        productRepository.save(product);
    }

    public void delete(long id) {
        productRepository.deleteById(id);
    }

    // Logic to either return all products or filter them by name
    public List<Product> findByQuery(String query) {
        if (query == null || query.isEmpty()) {
            return productRepository.findAll();
        }
        return productRepository.findByNameContainingIgnoreCase(query);
    }

    public List<Product> findBySeller(User seller) {
        return productRepository.findBySeller(seller);
    }

    public long getProductCount(User seller) {
        return productRepository.countBySeller(seller);
    }

    // ALGORITHM METHODS
    public List<Product> getRecommendations(User user) {
        // STEP 1: Handle null user (anonymous browsing)
        if (user == null) { 
            return Collections.emptyList(); 
        }

        // STEP 2: Query database for recommended products based on user interaction history
        List<Product> recommendations = productRepository.findRecommendedProducts(user.getUserId());

        // STEP 3: Return filtered recommendations
        return recommendations;
    }

    public void saveInteraction(User user, Product product, UserInteraction.InteractionType type) {
        // STEP 1: Validate inputs before recording interaction
        if (user != null && product != null) {
            // STEP 2: Create and persist interaction record
            UserInteraction interaction = new UserInteraction(user, product, type);
            userInteractionRepository.save(interaction);
        }
    }

    public void recordView(User user, Product product) {
        // STEP 1: Create view interaction record
        UserInteraction interaction = new UserInteraction(user, product, UserInteraction.InteractionType.VIEW);
        // STEP 2: Persist to database for recommendation algorithm
        userInteractionRepository.save(interaction);
    }

    /**
     * Validates product price is greater than 0
     */
    public void validateProductPrice(double price) {
        if (price <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Price must be greater than 0.");
        }
    }

    /**
     * Validates product photo file is provided and not empty
     */
    public void validateProductPhoto(MultipartFile photo) {
        if (photo == null || photo.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You must upload one product photo.");
        }
    }

    /**
     * Filters out current product from recommendations list
     */
    public List<Product> filterOutCurrentProduct(List<Product> recommendations, long currentProductId) {
        if (recommendations == null) {
            return Collections.emptyList();
        }
        return recommendations.stream()
                .filter(p -> !p.getId().equals(currentProductId))
                .toList();
    }

    /**
     * Checks if recommendations exist and are not empty
     */
    public boolean hasRecommendations(List<Product> recommendations) {
        return recommendations != null && !recommendations.isEmpty();
    }

    /**
     * Gets product count for user (for inventory page)
     */
    public int getUserProductCount(String username) {
        User user = userRepository.findByName(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return user.getProducts().size();
    }
    
    public List<Product> findByQueryCategory(String query) {
        // STEP 1: Handle empty query - return all products
        if (query == null || query.isEmpty()) {
            return productRepository.findAll();
        }
        // STEP 2: Search products by category (case-insensitive)
        return productRepository.findByCategoryContainingIgnoreCase(query);
    }


    /**
     * Business Logic: Retrieves the authenticated user and their associated products.
     * Leverages the @OneToMany relationship defined in the User entity for efficient data retrieval.
     */
    public User getAuthenticatedUserWithProducts(String username) {
        
        // 1. Fetch the user from the database using the username from the Principal object
        // This ensures that we only access the data of the currently authenticated session
        return userRepository.findByName(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }


    /**
     * Updates a product's details and image after verifying the requester's identity.
     * Uses @Transactional to ensure the database remains consistent even if the image upload fails.
     * * @param id The ID of the product to update.
     * @param updatedData DTO or entity containing the new text fields.
     * @param username The name of the authenticated user from the session.
     * @param imageFile The new image file (optional).
     */
    @Transactional
    public void updateProductSafely(long id, Product updatedData, String username, MultipartFile imageFile) throws IOException {

        // 1. Domain Logic: Search for the original product in the database
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        // 2. Security Enforcement: Verify ownership
        // We check if the current user is the actual seller of the item.
        if (!existingProduct.getSeller().getName().equals(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not the owner of this product");
        }

        validatePositivePrice(updatedData.getPrice());

        // 3. Field Synchronization: Apply text changes
        existingProduct.setName(updatedData.getName());
        existingProduct.setPrice(updatedData.getPrice());
        existingProduct.setDescription(updatedData.getDescription());
        existingProduct.setLocation(updatedData.getLocation());
        existingProduct.setCategory(updatedData.getCategory());

        // 4. Image Processing: replace image only when a new one is provided
        if (imageFile != null && !imageFile.isEmpty()) {
            Image newImage = imageService.createImage(imageFile.getInputStream());
            existingProduct.setImage(newImage);
        }

        // 5. Persistence: Explicit save for clarity
        productRepository.save(existingProduct);
    }

    /**
     * Processes the creation of a new product and links it to the authenticated seller.
     * @Transactional ensures that the product and its image are saved as a single atomic operation.
     */
    @Transactional
    public void addProduct(Principal principal, MultipartFile productPhoto,
                                String productName, String category, String description,
                                double price, String location, String status) throws IOException {

        validatePositivePrice(price);

        // 1. Security: Identify the authenticated seller
        User seller = userRepository.findByName(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Authenticated user not found"));

        // 2. Domain Logic: Initialize the new Product entity
        Product newProduct = new Product(productName, category, price, description, status, seller, location);

        // 3. Image Processing: Set a single product image
        if (productPhoto != null && !productPhoto.isEmpty()) {
            Image img = imageService.createImage(productPhoto.getInputStream());
            newProduct.setImage(img);
        }

        // 4. Persistence: Save the product. Cascading handles the Image entity
        productRepository.save(newProduct);
    }

    @Transactional
    public Product createProduct(String username,
                                    String productName,
                                    String category,
                                    String description,
                                    double price,
                                    String location,
                                    String status,
                                    MultipartFile productPhoto) throws IOException {

        validatePositivePrice(price);

        User seller = userRepository.findByName(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Authenticated user not found"));

        Product newProduct = new Product(productName, category, price, description, status, seller, location);

        if (productPhoto != null && !productPhoto.isEmpty()) {
            Image img = imageService.createImage(productPhoto.getInputStream());
            newProduct.setImage(img);
        }

        return productRepository.save(newProduct);
    }

    private void validatePositivePrice(double price) {
        if (price <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Price must be greater than 0");
        }
    }

    @Transactional
    public Product replaceImage(long productId, String username, MultipartFile imageFile) throws IOException {
        User user = userRepository.findByName(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        boolean isOwner = product.getSeller().getUserId().equals(user.getUserId());
        boolean isAdmin = user.getRoles() != null && user.getRoles().contains("ROLE_ADMIN");

        if (!isOwner && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unauthorized: You do not own this product");
        }

        if (imageFile == null || imageFile.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image file is required");
        }

        product.setImage(imageService.createImage(imageFile.getInputStream()));

        return productRepository.save(product);
    }

    /**
     * Retrieves a product for editing after validating that the requester is the legitimate owner.
     * This prevents users from accessing the edit page of products they do not own by simply changing the ID in the URL.
     * * @param productId The ID of the product to be edited.
     * @param username The name of the authenticated user (from Principal).
     * @return The Product entity if found and ownership is verified.
     * @throws ResponseStatusException 404 if product not found, 403 if ownership verification fails.
     */
    public Product getProductForEditing(long productId, String username) {
        
        // 1. Fetch the product from the database
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        // 2. Security Check: Compare the authenticated username with the product seller's name 
        if (!product.getSeller().getName().equals(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to edit this product");
        }

        return product;
    }

    /**
     * Permanently deletes a product from the marketplace after verifying the requester's ownership.
     * Leveraging 'CascadeType.ALL' in the Product entity, this operation also removes all 
     * associated images from the database.
     * * @param id The unique identifier of the product to be deleted.
     * @param username The authenticated username (from Principal) performing the action.
     * @throws ResponseStatusException 404 if product not found, 403 if user is not the owner. [cite: 412]
     */
    @Transactional
    public void deleteProduct(Long id, String username) {
        User user = userRepository.findByName(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        // Check if they are the owner OR if they are an administrator
        boolean isOwner = product.getSeller().getUserId().equals(user.getUserId());
        boolean isAdmin = user.getRoles() != null && user.getRoles().contains("ROLE_ADMIN");

        if (!isOwner && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unauthorized: You do not own this product");
        }

        productRepository.delete(product);
    }

    /**
     * Prepares the public seller profile data.
     * This method aggregates products, ratings, and calculated star counts for the UI.
     * * @param username The seller's username to fetch.
     * @return The User entity with all associated seller data.
     */
    public User getSellerProfileData(String username) {
        // 1. Fetch the user and ensure all Lazy relationships are loaded if needed
        return userRepository.findByName(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Seller not found"));
    }

    /**
     * Calculates the number of full stars based on the user's average rating.
     * @param user The seller entity.
     * @return The floor value of the rating.
     */
    public int calculateFullStars(User user) {
        return (int) Math.floor(user.getRating());
    }

    public List<Product> getProductsByStatusAndPage(String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
    
        // Here we call the new method combining status and pagination
        return productRepository.findByStatus(status, pageable).getContent();
    }

    public Page<Product> findActiveProducts(String query, String category, Pageable pageable) {
        if (query != null && !query.isBlank()) {
            return productRepository.findByStatusIgnoreCaseAndNameContainingIgnoreCase("Active", query, pageable);
        }
        if (category != null && !category.isBlank()) {
            return productRepository.findByStatusIgnoreCaseAndCategoryContainingIgnoreCase("Active", category, pageable);
        }
        return productRepository.findByStatusIgnoreCase("Active", pageable);
    }

    public CatalogPageResult getCatalogPage(String query, String category, User user, Pageable pageable) {
        boolean searching = (query != null && !query.isBlank()) || (category != null && !category.isBlank());
        Page<Product> page;

        if (searching) {
            page = findActiveProducts(query, category, pageable);
        } else {
            List<Long> recommendedIds = getRecommendations(user).stream().map(Product::getId).toList();
            if (recommendedIds.isEmpty()) {
                page = productRepository.findByStatusIgnoreCase("Active", pageable);
            } else {
                page = productRepository.findByStatusIgnoreCaseAndIdNotIn("Active", recommendedIds, pageable);
            }
        }

        return new CatalogPageResult(
                page.getContent(),
                page.isLast(),
                page.getTotalElements(),
                page.getNumber(),
                page.getSize());
    }
}
