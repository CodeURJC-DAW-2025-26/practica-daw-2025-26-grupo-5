package es.stilnovo.library.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
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
        if (query != null && !query.isEmpty()) {
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
        if (username == null)
            return null;
        return userRepository.findByName(username).orElse(null);
    }

    public boolean isUserAdmin(User user) {
        return user != null && user.getRoles().contains("ROLE_ADMIN");
    }

    public HomePageData getHomePageData(String query, String category, String username, int maxItems) {
        return getHomePageData(query, category, username, PageRequest.of(0, maxItems));
    }

    /**
     * Builds homepage data with products, recommendations, and pagination.
     * Complex logic: Recommends products ONLY on first page when not searching.
     */
    public HomePageData getHomePageData(String query, String category, String username, Pageable pageable) {
        // Fetch authenticated user from security context (null if anonymous)
        User user = getUserContext(username);
        
        // Determine if user is actively searching (vs browsing catalog)
        boolean searching = (query != null && !query.isBlank()) || (category != null && !category.isBlank());
        
        // Recommendations only show on homepage (page 0) and not during searches
        boolean isFirstPage = pageable.getPageNumber() == 0;
        List<Product> recommendedProducts = (searching || !isFirstPage) ? List.of()
                : productService.getRecommendations(user);

        // Dynamic page size: if recommendations used slots, reduce catalog items accordingly
        // Example: 10 items per page, 3 recommendations = 7 catalog products this page
        int recommendedSize = recommendedProducts.size();
        int regularLimit = Math.max(0, pageable.getPageSize() - recommendedSize);
        
        // Fetch catalog products based on search/category or browse all
        CatalogPageResult catalogPage = regularLimit > 0
                ? productService.getCatalogPage(query, category, user,
                        PageRequest.of(pageable.getPageNumber(), regularLimit))
                : new CatalogPageResult(List.of(), true, 0, 0, 0);

        // Normalize query display: use query if searching by text, category if filtering by category
        String normalizedQuery = query != null ? query : (category != null ? category : "");

        return new HomePageData(
                catalogPage.products(),
                recommendedProducts,
                user,
                user != null,
                isUserAdmin(user),
                normalizedQuery,
                searching,
                catalogPage.last(),
                catalogPage.products().size());
    }

    public String resolveHomePageView(HomePageData homePageData) {
        if (homePageData.products().size() == 1 && homePageData.searching()) {
            return "redirect:/info-product-page/" + homePageData.products().get(0).getId();
        }
        return "index";
    }
}