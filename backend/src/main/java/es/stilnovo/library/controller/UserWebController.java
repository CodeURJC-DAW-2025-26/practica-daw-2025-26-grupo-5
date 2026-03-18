package es.stilnovo.library.controller;

import java.io.IOException;
import java.security.Principal;
import java.sql.SQLException;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.Locale;
import java.util.Map;

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

import es.stilnovo.library.model.User;
import es.stilnovo.library.service.ContactSellerService;
import es.stilnovo.library.service.UserService;
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
    private UserService userService;

    @Autowired
    private ContactSellerService contactSellerService;

    @GetMapping("/about-page")
	public String showAboutPage() {
		return "about-page";
	}

    @GetMapping("/help-center-page")
	public String showHelpPage() {
		return "help-center-page";
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
        var sellerProfileData = userService.getSellerProfilePageData(id, principal != null ? principal.getName() : null);

        model.addAttribute("seller", sellerProfileData.seller());
        model.addAttribute("sellerValorations", sellerProfileData.sellerValorations());
        model.addAttribute("sellerProducts", sellerProfileData.sellerProducts());
        model.addAttribute("itemsCount", sellerProfileData.itemsCount());
        model.addAttribute("fullStars", sellerProfileData.fullStars());
        model.addAttribute("isOwner", sellerProfileData.owner());

        return "seller-profile-page";
    }

    @GetMapping("/contact-seller-page/{id}")
    public String showContactSeller(@PathVariable long id, Model model, Principal principal,
                                    @RequestParam(required = false) String sent,
                                    @RequestParam(required = false) String error,
                                    @RequestParam(required = false) String cooldown) {
        // STEP 1: Check buyer is authenticated
        if (principal == null) {
            return "redirect:/login-page";
        }

        try {
            var pageData = contactSellerService.getContactSellerPageData(id, principal.getName());
            model.addAttribute("product", pageData.product());
            model.addAttribute("seller", pageData.seller());
            model.addAttribute("buyerName", pageData.buyerName());
            model.addAttribute("buyerEmail", pageData.buyerEmail());
        } catch (IllegalStateException exception) {
            return "redirect:/info-product-page/" + id + "?error=self_purchase";
        }

        // STEP 7: Pass status flags to template (sent, error, cooldown messages)
        model.addAttribute("sent", "true".equalsIgnoreCase(sent));
        model.addAttribute("error", error);
        model.addAttribute("cooldownMinutes", cooldown);

        return "contact-seller-page";
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
    public String showUserPage(Model model, Principal principal) {
        
        // STEP 1: Validate user session exists
        // Safety Check: If the user session is lost, redirect to login
        if (principal == null) {
            return "redirect:/login-page";
        }


        var dashboardData = userService.getUserDashboardData(principal.getName());

        model.addAttribute("user", dashboardData.user());
        model.addAttribute("isOwner", true);
        model.addAttribute("date", dashboardData.date());
        model.addAttribute("userSales", dashboardData.userSales());
        model.addAttribute("chartLabels", dashboardData.chartLabels());
        model.addAttribute("chartValues", dashboardData.chartValues());
        model.addAttribute("revenueLabels", dashboardData.revenueLabels());
        model.addAttribute("revenueValues", dashboardData.revenueValues());
        model.addAttribute("barLabels", dashboardData.barLabels());
        model.addAttribute("visitsData", dashboardData.visitsData());
        model.addAttribute("interestData", dashboardData.interestData());
        model.addAttribute("formattedTotalRevenue", formatCurrency(dashboardData.user().getTotalRevenue()));
        model.addAttribute("formattedBalance", formatCurrency(dashboardData.user().getBalance()));

        return "user-page"; 
    }

    private String formatCurrency(double value) {
        DecimalFormatSymbols symbols = new DecimalFormatSymbols(Locale.forLanguageTag("es-ES"));
        symbols.setGroupingSeparator('.');
        symbols.setDecimalSeparator(',');
        DecimalFormat decimalFormat = new DecimalFormat("#,##0.00", symbols);
        return decimalFormat.format(value);
    }
    

    /**
     * GET method for the sales and orders dashboard.
     * Uses the session Principal to ensure users can only see their own private financial history.
     *
     */
    @GetMapping("/sales-and-orders-page")
    public String showSalesAndOrders(Model model, Principal principal,
                                    @RequestParam(required = false) Long transactionId) {

        // STEP 1: Get authenticated user profile
        // 1. Get the full profile for the sidebar/header
        model.addAttribute("user", userService.getFullUserProfile(principal.getName()));


        // STEP 2: Fetch sales and orders dashboard data (includes transaction lists and selected transaction)
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
    
    /*USER SETTING PAGE (PERSONAL INFORMATION)*/

    /**
     * GET method to display the account settings page.
     * Identity is resolved via Spring Security's Principal to prevent ID spoofing. 
     */
    @GetMapping("/user-setting-page")
    public String showUserSettings(Model model, Principal principal) {

        // STEP 1: Validate session exists
        // 1. Safety check: Redirect to login if the session has expired [cite: 410]
        if (principal == null) {
            return "redirect:/login-page";
        }


        // STEP 2: Fetch full user profile from database
        // 2. Fetch the full User entity from the Service (NOT just the Principal)
        // The Principal only provides the name; we need the full JPA entity for the view 
        User loggedInUser = userService.getFullUserProfile(principal.getName());
        
        
        // STEP 3: Check if user is admin (admins cannot delete account)
        //If is admin, we not show delete form
        boolean isAdmin = loggedInUser.getRoles().contains("ROLE_ADMIN");
        model.addAttribute("isAdmin", isAdmin);
        
        
        // STEP 4: Pre-fill settings form with current user data
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
        
        // STEP 1: Update user profile with new data (only updates non-null fields)
        // 1. Delegate everything to the Service Layer using the secure session identity
        userService.updateUserSettings(principal.getName(), newProfilePhoto, newEmail, 
                                    newCardNumber, newCardCvv, newCardExpiringDate, newDescription);


        // STEP 2: Redirect to settings page to show updated data
        // 2. Redirect to the settings page (the clean GET route we created before)
        return "redirect:/user-setting-page";
    }

    /**
     * Processes the account deletion request.
     * After deleting the data, it invalidates the session to log out the user.
     */
    @PostMapping("/user-settings/delete")
    public String deleteUserInSettings(Principal principal, HttpServletRequest request) throws ServletException {


        // STEP 1: Delete user and all associated data from database
        // 1. Delete the user from the database via the service layer
        userService.deleteUserSelf(principal.getName());


        // STEP 2: Invalidate session and clear security context
        // 2. request.logout() invalidates the session and 
        // clears the SecurityContext in Spring Security.
        request.logout();


        // STEP 3: Redirect to homepage as anonymous user
        // 3. Redirect to the home page as an anonymous guest
        return "redirect:/";
    }

    /**
     * Display the statistics page for the authenticated user.
     * Uses Principal for secure authentication - no user ID in URL.
     * Calculates real statistics from transaction data.
     */
    @GetMapping("/statistics-page")
    public String showStatisticsPage(Model model, Principal principal) {
        var statisticsData = userService.getUserStatisticsData(principal.getName());

        model.addAttribute("user", statisticsData.user());
        model.addAttribute("userId", statisticsData.user().getUserId());
        model.addAttribute("totalSales", statisticsData.totalSales());
        model.addAttribute("itemsSold", statisticsData.itemsSold());
        model.addAttribute("avgRating", statisticsData.avgRating());
        model.addAttribute("inventoryValue", statisticsData.inventoryValue());
        model.addAttribute("date", statisticsData.date());
        model.addAttribute("chartLabels", statisticsData.chartLabels());
        model.addAttribute("chartValues", statisticsData.chartValues());
        model.addAttribute("revenueLabels", statisticsData.revenueLabels());
        model.addAttribute("revenueValues", statisticsData.revenueValues());
        model.addAttribute("barLabels", statisticsData.barLabels());
        model.addAttribute("visitsData", statisticsData.visitsData());
        model.addAttribute("interestData", statisticsData.interestData());

        return "statistics-page";
    }

}