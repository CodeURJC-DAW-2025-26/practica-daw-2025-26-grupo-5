package es.stilnovo.library.controller;

import java.security.Principal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import es.stilnovo.library.model.Product;
import es.stilnovo.library.model.User;

import es.stilnovo.library.service.MainService;
import es.stilnovo.library.service.ProductService; 

/**
 * MainController: Displays the homepage and handles product browsing
 * 
 * This controller manages:
 * - Homepage display with product listings
 * - Product search by query text
 * - Product filtering by category
 * - Personalized recommendations (for logged-in users)
 * - Pagination/infinite scroll for product loading
 * - Auto-redirect when search returns single product
 * 
 * Uses: MainService, ProductService
 */
@Controller
public class MainController {

    @Autowired
    private MainService mainService;

    @Autowired
    private ProductService productService;

    /** Display homepage with product listings and recommendations */
    @GetMapping("/")
    public String index(Model model,
                        @RequestParam(required = false) String query,
                        @RequestParam(required = false) String category,
                        Principal principal) {
        // STEP 1: Get authenticated user context (null if not logged in)
        User user = mainService.getUserContext(principal != null ? principal.getName() : null);

        List<Product> products;
        List<Product> recommendedProducts = null; 
        
        // STEP 2: Determine if user is searching or browsing homepage
        boolean isSearching = (query != null && !query.isEmpty()) || (category != null && !category.isEmpty());

        if (isSearching) {
            // STEP 3a: Search mode - get filtered products only
            products = new ArrayList<>(mainService.searchProducts(query, category));
        } else {
            // STEP 3b: Browse mode - get all products and recommendations
            products = new ArrayList<>(mainService.searchProducts(query, category)); 
            
            // STEP 4: Get personalized recommendations based on user history
            recommendedProducts = productService.getRecommendations(user);

            // STEP 5: Remove duplicates between recommendations and main product list
            if (recommendedProducts != null && !recommendedProducts.isEmpty()) {
                List<Long> recommendedIds = recommendedProducts.stream().map(Product::getId).toList();
                products.removeIf(p -> recommendedIds.contains(p.getId()));
            }
        }


        // STEP 6: Calculate pagination and display limits
        boolean logged = (user != null);
        boolean isAdmin = mainService.isUserAdmin(user);
        
        int recSize = (recommendedProducts != null) ? recommendedProducts.size() : 0;
        int maxItems = 10;
        
        // STEP 7: Calculate how many regular products fit in first page (max 10 total)
        int regularLimit = Math.max(0, maxItems - recSize);
        
        // STEP 8: Determine if this is the last page (all products fit in view)
        boolean isLast = (recSize + products.size()) <= maxItems;
        
        int nextOffset = products.size(); 

        // STEP 9: Trim product list to fit pagination limit
        if (products.size() > regularLimit) {
            products = products.subList(0, regularLimit);
            nextOffset = regularLimit;
        }
                
        // STEP 10: Populate model with all data for template rendering
        model.addAttribute("products", products);
        model.addAttribute("recommendedProducts", recommendedProducts);
        model.addAttribute("user", user);
        model.addAttribute("logged", logged);
        model.addAttribute("isAdmin", isAdmin);
        model.addAttribute("query", (query != null) ? query : (category != null ? category : ""));
        model.addAttribute("searching", isSearching);
        model.addAttribute("isLast", isLast);
        model.addAttribute("nextOffset", nextOffset);

        // STEP 11: Auto-redirect if search returned only one product
        if (products.size() == 1 && isSearching) {
            return "redirect:/info-product-page/" + products.get(0).getId();
        }

        return "index";
    }
}