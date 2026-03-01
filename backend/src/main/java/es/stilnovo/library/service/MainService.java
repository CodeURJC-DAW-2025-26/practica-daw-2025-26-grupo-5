package es.stilnovo.library.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import es.stilnovo.library.model.Product;
import es.stilnovo.library.model.User;
import es.stilnovo.library.repository.UserRepository;

/**
 * MainService: Central service for homepage and main operations
 * 
 * This service handles:
 * - Product searching by query text or category filter
 * - User context retrieval from authentication
 * - Admin privilege checking
 * - Main page data preparation
 * 
 * Uses: ProductService, UserRepository
 */
@Service
public class MainService {

    @Autowired
    private ProductService productService;

    @Autowired
    private UserRepository userRepository;

    /**
     * Executes product search based on query or category.
     */
    public List<Product> searchProducts(String query, String category) {
        // STEP 1: Define search filter (only active products)
        String status = "Active";

        // STEP 2: Check if user searched by query text
        if(query != null && !query.isEmpty()){
            return productService.findByQuery(query);
        }
        // STEP 3: Check if user filtered by category
        if (category != null && !category.isEmpty()) {
            return productService.findByQueryCategory(category);
        } 
        
        // STEP 4: Return all active products (default browse)
        return productService.findProductsByStatus(status);
    }

    /**
     * Retrieves the full user profile safely.
     */
    public User getUserContext(String username) {
        if (username == null) return null;
        return userRepository.findByName(username).orElse(null);
    }

    public boolean isUserAdmin(User user) {
        return user != null && user.getRoles().contains("ROLE_ADMIN");
    }
}