package es.stilnovo.library.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.server.ResponseStatusException;

import es.stilnovo.library.model.Product;
import es.stilnovo.library.model.User;
import es.stilnovo.library.service.MainService;
import es.stilnovo.library.service.ProductService;

/**
 * InfoProductController: Displays detailed product information pages
 * 
 * This controller manages:
 * - Product details display (description, price, seller info, images)
 * - Product availability status checking
 * - Related/similar products display
 * - Buyer can contact seller functionality
 * - Favorite/unfavorite product actions
 * - In-stock availability status
 * 
 * Uses: ProductService, UserService
 */
@Controller
public class InfoProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private MainService mainService;

    @GetMapping("/info-product-page/{id}")
    public String infoProduct(Model model, @PathVariable long id, Principal principal) {
        // STEP 1: Get the authenticated user context if logged in
        User user = (principal != null) ? mainService.getUserContext(principal.getName()) : null;

        // STEP 2: Fetch product by ID from database (throws 404 if not found)
        Product product = productService.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        // STEP 3: Record user view interaction for analytics if logged in
        if (user != null) {
            productService.recordView(user, product);
        }

        // STEP 4: Get personalized product recommendations for user
        List<Product> recommendations = productService.getRecommendations(user);
        
        // STEP 5: Remove current product from recommendations to avoid duplication
        if (recommendations != null) {
            recommendations.removeIf(p -> p.getId().equals(id));
        }

        // STEP 6: Determine if recommendations section should be displayed
        boolean showSection = (recommendations != null && !recommendations.isEmpty());
        model.addAttribute("haveRecoProds", showSection);

        // STEP 7: Populate model with all data for template rendering
        model.addAttribute("product", product);
        model.addAttribute("recommendedProducts", recommendations);
        model.addAttribute("logged", user != null);
        
        return "info-product-page";
    }
}