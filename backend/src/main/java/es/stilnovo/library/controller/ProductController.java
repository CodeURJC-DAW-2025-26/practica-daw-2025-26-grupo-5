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

/** Controller for product loading and pagination */
@Controller
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private MainService mainService;

    /**
     * Load next batch of products via AJAX for infinite scroll feature
     * Handles search filtering, category filtering, and pagination
     * @param offset number of products to skip
     * @param query optional search text
     * @param category optional category filter
     * @param principal current user session
     * @param model UI data model
     * @return product_items template fragment
     */
    @GetMapping("/load-more-products")
    public String loadMore(@RequestParam int offset, 
                            @RequestParam(required = false) String query,
                            @RequestParam(required = false) String category,
                            Principal principal,
                            Model model) {
        // STEP 1: Get user context from session (null if anonymous)
        User user = mainService.getUserContext(principal != null ? principal.getName() : null);
        // STEP 2: Fetch products matching search/category filters
        List<Product> products = new ArrayList<>(mainService.searchProducts(query, category));
        
        // STEP 3: Detect if user is performing a search or just browsing
        boolean isSearching = (query != null && !query.isEmpty()) || (category != null && !category.isEmpty());

        // STEP 4: Exclude recommended products when browsing (not searching)
        if (!isSearching) {
            List<Product> recommendedProducts = productService.getRecommendations(user);
            if (recommendedProducts != null && !recommendedProducts.isEmpty()) {
                List<Long> recommendedIds = recommendedProducts.stream().map(Product::getId).toList();
                products.removeIf(p -> recommendedIds.contains(p.getId()));
            }
        }

        // STEP 5: Paginate results (10 items per batch)
        int pageSize = 10;
        int endIndex = Math.min(offset + pageSize, products.size());
        
        // STEP 6: Extract page slice
        List<Product> moreProducts = new ArrayList<>();
        if (offset < products.size()) {
            moreProducts = products.subList(offset, endIndex);
        }

        // STEP 7: Check if this is the last page
        boolean isLast = (endIndex >= products.size());

        // STEP 8: Pass data to template
        model.addAttribute("products", moreProducts);
        model.addAttribute("isLast", isLast);
        
        return "product_items"; 
    }
}