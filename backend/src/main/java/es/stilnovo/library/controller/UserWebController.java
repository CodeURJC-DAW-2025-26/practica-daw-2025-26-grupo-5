package es.stilnovo.library.controller;

import java.io.IOException;
import java.security.Principal;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import es.stilnovo.library.model.Product;
import es.stilnovo.library.model.Transaction;
import es.stilnovo.library.model.User;
import es.stilnovo.library.model.UserInteraction;
import es.stilnovo.library.repository.UserInteractionRepository;
import es.stilnovo.library.service.ProductService;
import es.stilnovo.library.service.TransactionService;
import es.stilnovo.library.service.UserService;
import es.stilnovo.library.service.UserService.BarChartData;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;

/**
 * UserWebController: Manages user profile and account pages
 * 
 * This controller manages:
 * - User profile page display
 * - Profile photo upload/retrieval
 * - User settings and preference management
 * - Favorite products management
 * - Order/transaction history
 * - User valorations (ratings received)
 * - Password changes and account updates
 * 
 * Uses: ProductService, UserService, TransactionService
 */
@Controller
public class UserWebController {

    @Autowired
    private ProductService productService;

    @Autowired
    private UserService userService;

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private UserInteractionRepository interactionRepository;

    @GetMapping("/about-page")
	public String login() {
		return "about-page";
	}
    
    /**
     * GET method to retrieve the profile photo of the currently authenticated user.
     * Uses 'me' in the URL to hide the ID and rely on the session Principal.
     */
    @GetMapping("/user/me/profile-photo")
    public ResponseEntity<Resource> getMyProfilePhoto(Principal principal) throws SQLException {
        return fetchPhotoResponse(principal.getName());
    }

    /**
     * GET method to retrieve any user's profile photo by their ID.
     * This is used for public views, such as viewing a seller's photo on a product page.
     */
    @GetMapping("/user/{id}/profile-photo")
    public ResponseEntity<Resource> getPublicProfilePhoto(@PathVariable Long id) throws SQLException {
        // We delegate the search by ID to the service
        Resource image = userService.getProfilePhotoResourceById(id);
        
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG) 
                .body(image);
    }

    /**
     * Internal helper to standardize the photo response logic.
     */
    private ResponseEntity<Resource> fetchPhotoResponse(String username) throws SQLException {
        Resource image = userService.getProfilePhotoResourceByUsername(username);
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .body(image);
    }


    /**
     * GET method to display a specific seller's public profile using their ID.
     * This allows users to browse different sellers in the marketplace.
     *
     * @param id The internal ID of the seller to display.
     * @param model UI model to pass seller data to the template.
     * @param principal The current logged-in user (optional, used for ownership checks).
     */
    @GetMapping("/seller-profile/{id}")
    public String showPublicSellerProfile(@PathVariable long id, Model model, Principal principal) {
        
        // 1. Fetch the specific seller data using the ID
        User seller = userService.getPublicProfileById(id);
        
        // 2. Populate the model with seller information
        model.addAttribute("seller", seller);
        model.addAttribute("sellerValorations", seller.getValorations());
        model.addAttribute("sellerProducts", seller.getProducts());
        model.addAttribute("itemsCount", seller.getProducts().size());
        model.addAttribute("fullStars", productService.calculateFullStars(seller));

        // 3. Security logic: Check if the viewer is the owner to show/hide edit buttons
        boolean isOwner = (principal != null && principal.getName().equals(seller.getName()));
        model.addAttribute("isOwner", isOwner);

        return "seller-profile-page";
    }


    /**
     * Displays the personal profile page of the authenticated user.
     * This route is used as a private dashboard where the user can see their own public-facing info.
     * By using the Principal instead of a PathVariable ID, we prevent unauthorized access 
     * to other users' profile data.
     * * @param model UI model to pass user data to the mustache template.
     * @param principal The security context of the logged-in user.
     * @return The user profile view template.
     */
    @GetMapping("/user-page")
    public String showUserPage(Model model, Principal principal) throws JsonProcessingException {
        
        // Safety Check: If the user session is lost, redirect to login
        if (principal == null) {
            return "redirect:/login-page";
        }

        // Data Retrieval: Fetch the full user entity using the secure Principal name
        User user = userService.getFullUserProfile(principal.getName());
        String formattedDate = userService.getFormattedDate();

        // Obtain the transactions where the user is the seller to show purchase history
        List<Transaction> sales = transactionService.getSellerTransactions(principal.getName());

        // First graph: Sales by category
        Map<String, Long> salesByCategory = userService.getSalesByCategory(sales);

        // Second graph: Monthly revenue
        List<String> monthLabels = userService.getMonthLabels();
        List<Double> monthlyRevenues = userService.getRevenueByMonth(sales);

        BarChartData chartData = userService.getBarChartData(user);

        List<String> barLabels = chartData.labels();
        List<Long> visitsData = barLabels.stream()
            .map(cat -> chartData.visitsByCategory().getOrDefault(cat, 0L))
            .toList();
        List<Long> interestData = barLabels.stream()
            .map(cat -> chartData.interestByCategory().getOrDefault(cat, 0L))
            .toList();

        ObjectMapper mapper = new ObjectMapper();
        try {
            // Graph for sales by category
            model.addAttribute("chartLabels", mapper.writeValueAsString(salesByCategory.keySet()));
            model.addAttribute("chartValues", mapper.writeValueAsString(salesByCategory.values()));
            // Graph for monthly revenue
            model.addAttribute("revenueLabels", mapper.writeValueAsString(monthLabels));
            model.addAttribute("revenueValues", mapper.writeValueAsString(monthlyRevenues));
        } catch (Exception e) {
            model.addAttribute("chartLabels", "[]");
            model.addAttribute("chartValues", "[]");
            model.addAttribute("revenueLabels", "[]");
            model.addAttribute("revenueValues", "[]");
        }

        // Ownership Logic: Since this route is ID-less and bound to the Principal,
        // the visitor is ALWAYS the owner of this specific page.
        model.addAttribute("user", user);
        model.addAttribute("isOwner", true);
        model.addAttribute("date", formattedDate);
        model.addAttribute("userSales", sales);
        model.addAttribute("barLabels", mapper.writeValueAsString(barLabels));
        model.addAttribute("visitsData", mapper.writeValueAsString(visitsData));
        model.addAttribute("interestData", mapper.writeValueAsString(interestData));

        return "user-page"; 
    }
    

    /**
     * GET method for the sales and orders dashboard.
     * Uses the session Principal to ensure users can only see their own private financial history.
     *
     */
    @GetMapping("/sales-and-orders-page")
    public String showSalesAndOrders(Model model, Principal principal,
                                    @RequestParam(required = false) Long transactionId) {

        // 1. Get the full profile for the sidebar/header
        User user = userService.getFullUserProfile(principal.getName());
        model.addAttribute("user", user);

        // 2. Delegate business logic to the OrderService
        Map<String, Object> dashboardData = userService.getSalesAndOrdersDashboard(principal.getName(), transactionId);
        model.addAllAttributes(dashboardData);

        return "sales-and-orders-page";
    }


    @GetMapping("/help-center-page/{id}")
    public String showHelpCenterPage(Model model, @PathVariable long id, HttpServletRequest request) {

        // Use service layer instead of direct repository access
        User user = userService.findById(id).orElseThrow();

        if (request.getUserPrincipal() == null || !request.getUserPrincipal().getName().equals(user.getName())) {
            return "redirect:/error";
        }

        model.addAttribute("user", user);

        return "help-center-page";
    }


    /*USER PRODUCT PAGE*/
    /**
     * Displays the authenticated user's personal product inventory.
     * Following REST best practices: The User ID is hidden from the URL to prevent enumeration attacks.
     */
    @GetMapping("/user-products-page")
    public String userProducts(Model model, Principal principal) {
    
        // 1. Get the user and their products directly
        User user = productService.getAuthenticatedUserWithProducts(principal.getName());
    
        // 2. Add the raw list. Mustache will now use the getIs... methods automatically
        model.addAttribute("user", user); 
        model.addAttribute("userProducts", user.getProducts());
        model.addAttribute("itemsCount", user.getProducts().size());
    
        return "user-products-page";
    }

    /*-- Edit product --*/
    // GET method to display the edit form with existing data
    @GetMapping("/edit-product-page/{id}")
    public String showEditForm(Model model, @PathVariable long id, Principal principal) {
    
        // 1. Find the product by its ID using the service
        Product product = productService.getProductForEditing(id, principal.getName());

        // 3. Add the product to the model so the form fields can be pre-filled
        model.addAttribute("product", product);
    
        return "edit-product-page"; 
    }
    
    @PostMapping("/edit-product/{id}")
    public String updateProduct(@PathVariable long id, Product updatedProduct, Principal principal, @RequestParam MultipartFile newProfilePhoto) throws IOException {
    
        //Delegate: Send the base product and the product with changes
        productService.updateProductSafely(id, updatedProduct, principal.getName(), newProfilePhoto);

        //Redirect back to the inventory page
        return "redirect:/user-products-page";
    } 
    
    /**
     * GET method to display the product creation form.
     * Ensures the authenticated user data is available for the sidebar/navbar.
     */
    @GetMapping("/add-product-page")
    public String showAddForm(Model model, Principal principal) {
        
        // 1. Identity Check: If logged in, provide user data to the template
        if (principal != null) {
            // Reuse your service to get the full profile (avatar, balance, etc.)
            User user = userService.getFullUserProfile(principal.getName());
            model.addAttribute("user", user);
        }
        
        return "add-product-page"; 
    }


    @PostMapping("/add-product")
    public String newProduct(Model model, Principal principal, 
                            @RequestParam("productPhoto") MultipartFile productPhoto, 
                            @RequestParam String productName,
                            @RequestParam String category,
                            @RequestParam String description,
                            @RequestParam double price,
                            @RequestParam String location,
                            @RequestParam String status) throws IOException {

        // 1. Initial UI Validation: Ensure at least one photo is uploaded
        if (productPhoto == null || productPhoto.isEmpty()) {
            // ERROR HANDLING: Return to the form and preserve user input to improve UX
            model.addAttribute("error", "You must upload a product photo.");
            model.addAttribute("productName", productName);
            model.addAttribute("category", category);
            model.addAttribute("price", price);
            model.addAttribute("location", location);
            model.addAttribute("description", description);
            model.addAttribute("status", status);
            
            return "add-product-page"; 
        }

        // 2. Service Delegation: Transfer execution to the Service Layer
        // Now passing a single MultipartFile instead of an array.
        productService.addProduct(principal, productPhoto, productName, category, description, price, location, status);

        // 3. SECURE REDIRECT: Redirect back to the inventory page
        return "redirect:/user-products-page";
    }

    
    /**
     * Processes the deletion request for a specific product.
     * After a successful deletion, it redirects the user to the clean inventory page. [cite: 488]
     */
    @PostMapping("/delete-product/{id}")
    public String deleteProduct(@PathVariable long id, Principal principal) {
        
        // 1. Execute deletion via Service Layer using the secure Principal name [cite: 650]
        productService.deleteProduct(id, principal.getName());

        // 2. SECURE REDIRECT: Returns to the inventory view without exposing User IDs [cite: 124, 157]
        return "redirect:/user-products-page";
    }
    
    /*USER SETTING PAGE (PERSONAL INFORMATION)*/

    /**
     * GET method to display the account settings page.
     * Identity is resolved via Spring Security's Principal to prevent ID spoofing. 
     */
    @GetMapping("/user-setting-page")
    public String showUserSettings(Model model, Principal principal) {

        // 1. Safety check: Redirect to login if the session has expired [cite: 410]
        if (principal == null) {
            return "redirect:/login-page";
        }

        // 2. Fetch the full User entity from the Service (NOT just the Principal)
        // The Principal only provides the name; we need the full JPA entity for the view 
        User loggedInUser = userService.getFullUserProfile(principal.getName());
        
        //If is admin, we not show delete form
        boolean isAdmin = loggedInUser.getRoles().contains("ROLE_ADMIN");
        model.addAttribute("isAdmin", isAdmin);
        
        // 3. Add the complete User object to the model for the Mustache template
        model.addAttribute("user", loggedInUser);

        return "user-setting-page";
    }

    /**
     * Processes the profile update form submission.
     * Uses the Principal object to identify the user, ensuring no ID spoofing is possible.
     */
    @PostMapping("/user-settings/edit") 
    public String updateSettings(Principal principal, 
                                @RequestParam(required = false) MultipartFile newProfilePhoto,
                                @RequestParam(required = false) String newEmail,
                                @RequestParam(required = false) String newCardNumber,
                                @RequestParam(required = false) String newCardCvv,
                                @RequestParam(required = false) String newCardExpiringDate, 
                                @RequestParam(required = false) String newDescription) throws IOException {
        
        // 1. Delegate everything to the Service Layer using the secure session identity
        userService.updateUserSettings(principal.getName(), newProfilePhoto, newEmail, 
                                    newCardNumber, newCardCvv, newCardExpiringDate, newDescription);

        // 2. Redirect to the settings page (the clean GET route we created before)
        return "redirect:/user-setting-page";
    }

    /**
     * Processes the account deletion request.
     * After deleting the data, it invalidates the session to log out the user.
     */
    @PostMapping("/user-settings/delete")
    public String deleteUserInSettings(Principal principal, HttpServletRequest request) throws ServletException {


        // 1. Delete the user from the database via the service layer
        userService.deleteUserSelf(principal.getName());

        // 2. request.logout() invalidates the session and 
        // clears the SecurityContext in Spring Security.
        request.logout();

        // 3. Redirect to the home page as an anonymous guest
        return "redirect:/";
    }

    /**
     * Display the statistics page for the authenticated user.
     * Uses Principal for secure authentication - no user ID in URL.
     * Calculates real statistics from transaction data.
     */
    @GetMapping("/statistics-page")
    public String showStatisticsPage(Model model, Principal principal) throws JsonProcessingException {
        
        // 1. Use Service Layer to get the authenticated user (secure identification via Principal)
        User user = userService.findByName(principal.getName()).orElseThrow(
            () -> new IllegalStateException("User not found: " + principal.getName())
        );

        // 2. Get all seller transactions for this user
        List<Transaction> transactions = transactionService.getSellerTransactions(principal.getName());

        // Data Retrieval: Fetch the full user entity using the secure Principal name
        String formattedDate = userService.getFormattedDate();

        // Obtain the transactions where the user is the seller to show purchase history
        List<Transaction> sales = transactionService.getSellerTransactions(principal.getName());

        Map<String, Long> salesByCategory = userService.getSalesByCategory(sales);

        Map<Integer, Double> revenueByMonth = new TreeMap<>(); 
            for (int i = 1; i <= 12; i++) revenueByMonth.put(i, 0.0);

            for (Transaction t : sales) {
                if (t.getCreatedAt() != null) {
                    int month = t.getCreatedAt().getMonthValue();
                    revenueByMonth.put(month, revenueByMonth.get(month) + t.getFinalPrice());
                }
            }

        List<String> monthLabels = userService.getMonthLabels();
        List<Double> monthlyRevenues = userService.getRevenueByMonth(sales);

        BarChartData chartData = userService.getBarChartData(user);

        List<String> barLabels = chartData.labels();
        List<Long> visitsData = barLabels.stream()
            .map(cat -> chartData.visitsByCategory().getOrDefault(cat, 0L))
            .toList();
        List<Long> interestData = barLabels.stream()
            .map(cat -> chartData.interestByCategory().getOrDefault(cat, 0L))
            .toList();

        ObjectMapper mapper = new ObjectMapper();
        try {
            // Graph for sales by category
            model.addAttribute("chartLabels", mapper.writeValueAsString(salesByCategory.keySet()));
            model.addAttribute("chartValues", mapper.writeValueAsString(salesByCategory.values()));
            // Graph for monthly revenue
            model.addAttribute("revenueLabels", mapper.writeValueAsString(monthLabels));
            model.addAttribute("revenueValues", mapper.writeValueAsString(monthlyRevenues));
        } catch (Exception e) {
            model.addAttribute("chartLabels", "[]");
            model.addAttribute("chartValues", "[]");
            model.addAttribute("revenueLabels", "[]");
            model.addAttribute("revenueValues", "[]");
        }

        // Calculate statistics from real transaction data
        double totalSales = transactions.stream()
            .mapToDouble(Transaction::getFinalPrice)
            .sum();
        
        int itemsSold = transactions.size();
        
        // Calculate average rating (example: average from all ratings received)
        double avgRating = userService.getAverageRatingForSeller(principal.getName());
        

        // Add statistics and user to model for template rendering
        model.addAttribute("user", user);
        model.addAttribute("userId", user.getUserId());
        model.addAttribute("totalSales", String.format("%.2f", totalSales));
        model.addAttribute("itemsSold", itemsSold);
        model.addAttribute("avgRating", String.format("%.1f", avgRating));
        model.addAttribute("inventoryValue", calculateInventoryValue(user));
        model.addAttribute("date", formattedDate);
        model.addAttribute("barLabels", mapper.writeValueAsString(barLabels));
        model.addAttribute("visitsData", mapper.writeValueAsString(visitsData));
        model.addAttribute("interestData", mapper.writeValueAsString(interestData));

        // 6. Render the statistics page template
        return "statistics-page";
    }

    /**
     * Helper method to calculate the total value of user's inventory.
     */
    private String calculateInventoryValue(User user) {
        double total = user.getProducts().stream()
            .mapToDouble(Product::getPrice)
            .sum();
        return String.format("%.2f", total);
    }

}