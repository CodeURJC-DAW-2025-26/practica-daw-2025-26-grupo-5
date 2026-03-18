package es.stilnovo.library.controller;

import java.io.IOException;
import java.security.Principal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import es.stilnovo.library.model.Product;
import es.stilnovo.library.model.User;
import es.stilnovo.library.service.CatalogPageResult;
import es.stilnovo.library.service.MainService;
import es.stilnovo.library.service.ProductService;
import es.stilnovo.library.service.UserService;

/** Controller for product loading and pagination */
@Controller
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private MainService mainService;

    @Autowired
    private UserService userService;

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
        User user = mainService.getUserContext(principal != null ? principal.getName() : null);
        int pageSize = 10;
        int pageNumber = Math.max(0, offset / pageSize);

        CatalogPageResult page = productService.getCatalogPage(query, category, user, PageRequest.of(pageNumber, pageSize));

        model.addAttribute("products", page.products());
        model.addAttribute("isLast", page.last());
        
        return "product_items"; 
    }

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
    
    /**
     * Displays the authenticated user's personal product inventory.
     * Following REST best practices: The User ID is hidden from the URL to prevent enumeration attacks.
     */
    @GetMapping("/user-products-page")
    public String userProducts(Model model, Principal principal) {
    
        // STEP 1: Get user with their product inventory from database
        User user = productService.getAuthenticatedUserWithProducts(principal.getName());
    
        // STEP 2: Populate model with user products list and count
        model.addAttribute("user", user); 
        model.addAttribute("userProducts", user.getProducts());
        model.addAttribute("itemsCount", user.getProducts().size());
    
        return "user-products-page";
    }

    /*-- Edit product --*/
    // GET method to display the edit form with existing data
    @GetMapping("/edit-product-page/{id}")
    public String showEditForm(Model model, @PathVariable long id, Principal principal) {
    
        // STEP 1: Fetch product and validate ownership
        Product product = productService.getProductForEditing(id, principal.getName());

        // STEP 2: Pre-fill form fields with existing product data
        model.addAttribute("product", product);
    
        return "edit-product-page"; 
    }
    
    @PostMapping("/edit-product/{id}")
    public String updateProduct(@PathVariable long id,
                                Product updatedProduct,
                                Principal principal,
                                Model model,
                                @RequestParam(name = "productPhotos", required = false) MultipartFile productPhoto) throws IOException {

        if (updatedProduct.getPrice() <= 0) {
            model.addAttribute("product", productService.getProductForEditing(id, principal.getName()));
            model.addAttribute("error", "Price must be greater than 0.");
            return "edit-product-page";
        }
    
        // STEP 1: Update product with new data (service validates ownership)
        productService.updateProductSafely(id, updatedProduct, principal.getName(), productPhoto);

        // STEP 2: Redirect to inventory page
        return "redirect:/user-products-page";
    } 
    
    /**
     * GET method to display the product creation form.
     * Ensures the authenticated user data is available for the sidebar/navbar.
     */
    @GetMapping("/add-product-page")
    public String showAddForm(Model model, Principal principal) {
        
        // STEP 1: Load user data for sidebar/navbar if authenticated
        if (principal != null) {
            User user = userService.getFullUserProfile(principal.getName());
            model.addAttribute("user", user);
        }
        
        return "add-product-page"; 
    }

    @PostMapping("/add-product")
    public String newProduct(Model model, Principal principal, 
                            @RequestParam("productPhotos") MultipartFile productPhoto,
                            @RequestParam String productName,
                            @RequestParam String category,
                            @RequestParam String description,
                            @RequestParam double price,
                            @RequestParam String location,
                            @RequestParam String status) throws IOException {

        if (price <= 0) {
            model.addAttribute("error", "Price must be greater than 0.");
            model.addAttribute("productName", productName);
            model.addAttribute("category", category);
            model.addAttribute("price", price);
            model.addAttribute("location", location);
            model.addAttribute("description", description);
            model.addAttribute("status", status);
            return "add-product-page";
        }

        // STEP 1: Validate product photo is uploaded
        if (productPhoto == null || productPhoto.isEmpty()) {
            model.addAttribute("error", "You must upload one product photo.");
            model.addAttribute("productName", productName);
            model.addAttribute("category", category);
            model.addAttribute("price", price);
            model.addAttribute("location", location);
            model.addAttribute("description", description);
            model.addAttribute("status", status);
            
            return "add-product-page"; 
        }

        // STEP 2: Create product and associate with authenticated user
        productService.addProduct(principal, productPhoto, productName, category, description, price, location, status);

        // STEP 3: Redirect to inventory page
        return "redirect:/user-products-page";
    }

    /**
     * Processes the deletion request for a specific product.
     * After a successful deletion, it redirects the user to the clean inventory page.
     */
    @PostMapping("/delete-product/{id}")
    public String deleteProduct(@PathVariable long id, Principal principal) {
        
        // STEP 1: Delete product from database (service validates ownership)
        productService.deleteProduct(id, principal.getName());

        // STEP 2: Redirect to inventory page
        return "redirect:/user-products-page";
    }
}