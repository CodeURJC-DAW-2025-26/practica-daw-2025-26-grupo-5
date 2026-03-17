package es.stilnovo.library.controller;

import java.io.IOException;
import java.text.NumberFormat;
import java.util.List;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import es.stilnovo.library.model.Product;
import es.stilnovo.library.model.User;
import es.stilnovo.library.service.AdminService;
import es.stilnovo.library.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import es.stilnovo.library.service.ProductService;



/**
 * AdminController: Handles all administrative panel operations
 * 
 * This controller manages:
 * - Admin dashboard display (statistics, user count, banned users)
 * - User list management and filtering
 * - User deletion from the system
 * - User banning/unbanning functionality
 * - System inventory view
 * - Transaction history view
 * 
 * All endpoints are protected with ADMIN role requirement
 * Uses: AdminService, UserService
 */
@Controller
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private UserService userService;

    @Autowired
    private ProductService productService;

    

    /**
     * Displays the main admin dashboard with system statistics
     * Shows: total users, banned users count, recent users list, memory usage
     */
    @GetMapping({ "", "/", "/panel" })
    public String showAdminPanel(Model model, HttpServletRequest request) {
        var panelData = adminService.getAdminPanelData();
        model.addAttribute("numUsers", panelData.numUsers());
        model.addAttribute("numBanneds", panelData.numBanneds());
        model.addAttribute("formattedNumUsers", formatInt(panelData.numUsers()));
        model.addAttribute("formattedNumBanneds", formatInt(panelData.numBanneds()));
        model.addAttribute("users", panelData.users());
        model.addAttribute("products", panelData.products());

        // STEP 4: Extract CSRF token for form submissions
        CsrfToken csrf = (CsrfToken) request.getAttribute("_csrf");
        if (csrf != null) {
            model.addAttribute("token", csrf.getToken());
        }

        model.addAttribute("memoryUsage", panelData.memoryUsage());

        return "admin-panel-page";
    }

    /**
     * Lists all users in the system with sorting/filtering
     * Includes CSRF token for delete/ban operations
     */
    @GetMapping("/users")
    public String listUsers(Model model, HttpServletRequest request) {
        List<User> users = adminService.getUsersPage(org.springframework.data.domain.Pageable.unpaged()).getContent();
        model.addAttribute("users", users);

        // STEP 2: Extract CSRF token for delete/ban form operations
        // STEP 3: Make token available to Mustache templates via _csrf object
        CsrfToken csrf = (CsrfToken) request.getAttribute("_csrf");
        if (csrf != null) {
            model.addAttribute("_csrf", csrf);
        }

        return "admin-user-managment-page";
    }

    @GetMapping("/users/edit/{id}")
    public String showEditUserAsAdmin(@PathVariable Long id, Model model, HttpServletRequest request) {

        User user = userService.findById(id).orElseThrow();

        model.addAttribute("user", user);
        model.addAttribute("isAdminEditing", true);

        boolean isAdmin = user.getRoles().contains("ROLE_ADMIN");
        model.addAttribute("isAdmin", isAdmin);

        CsrfToken csrf = (CsrfToken) request.getAttribute("_csrf");
        if (csrf != null) {
            model.addAttribute("token", csrf.getToken());
        }

        return "user-setting-page";
    }

    @PostMapping("/users/edit/{id}")
    public String updateUserAsAdmin(@PathVariable Long id,
                                    @RequestParam(required = false) MultipartFile newProfilePhoto,
                                    @RequestParam(required = false) String newEmail,
                                    @RequestParam(required = false) String newCardNumber,
                                    @RequestParam(required = false) String newCardCvv,
                                    @RequestParam(required = false) String newCardExpiringDate,
                                    @RequestParam(required = false) String newDescription) throws IOException {

        adminService.updateUserAsAdmin(id, newProfilePhoto, newEmail,
                newCardNumber, newCardCvv, newCardExpiringDate, newDescription);

        return "redirect:/admin/users";
    }



    /**
     * Displays global product inventory view
     * Shows all products in the system with status
     */
    @GetMapping("/global-inventory")
    public String showGlobalInventory(Model model, HttpServletRequest request) {
        model.addAttribute("products", adminService.getInventoryPage(org.springframework.data.domain.Pageable.unpaged()).getContent());
        model.addAttribute("allUsers", userService.findAll());

        CsrfToken csrf = (CsrfToken) request.getAttribute("_csrf");
        if (csrf != null) {
            model.addAttribute("token", csrf.getToken());
        }

        return "admin-global-invent-page";
    }

    @PostMapping("/products/add")
    public String createProductAsAdmin(@RequestParam Long sellerId,
                                        @RequestParam("productPhotos") List<MultipartFile> productPhotos,
                                        @RequestParam String productName,
                                        @RequestParam String category,
                                        @RequestParam String description,
                                        @RequestParam double price,
                                        @RequestParam String location,
                                        @RequestParam(defaultValue = "Active") String status) throws IOException {
        adminService.createProductAsAdmin(sellerId, productName, category, description, price, location, status, productPhotos);
        return "redirect:/admin/global-inventory";
    }


    /**
     * Permanently deletes a user account from the system
     * Also deletes all associated products, transactions, and reviews
     */
    @PostMapping("/users/delete/{id}")
    public String deleteUser(@PathVariable Long id) {

        adminService.deleteUser(id);

        return "redirect:/admin/users";
    }


    @GetMapping("/transactions")
    public String showTransactions(Model model, HttpServletRequest request) { // Añade el request aquí
        var transactionsData = adminService.getAdminTransactionsData();
        model.addAttribute("totalRevenue", transactionsData.totalRevenue());
        model.addAttribute("numTransactions", transactionsData.numTransactions());
        model.addAttribute("formattedTotalRevenue", formatInt(transactionsData.totalRevenue()));
        model.addAttribute("formattedNumTransactions", formatInt(transactionsData.numTransactions()));
        model.addAttribute("globalTransactions", transactionsData.globalTransactions());
        
        return "admin-global-transac-page";
    }

    @PostMapping("/transactions/delete/{id}")
    public String deleteTransaction(@PathVariable Long id) {
        adminService.deleteTransaction(id);
        
        return "redirect:/admin/transactions";
    }
    

    // Ban / Unban user (toggle)
    @PostMapping("/users/ban/{id}")
    public String toggleBanUser(@PathVariable Long id) {
        adminService.toggleBanUser(id);

        return "redirect:/admin/users";
    }

    @GetMapping("/valorations")
    public String showGlobalValorations(Model model, HttpServletRequest request) {
        var valorationsData = adminService.getAdminValorationsData();
        model.addAttribute("globalValorations", valorationsData.globalValorations());
        model.addAttribute("numValorations", valorationsData.numValorations());
        model.addAttribute("avgRating", valorationsData.avgRating());

        // Seguridad CSRF
        CsrfToken csrf = (CsrfToken) request.getAttribute("_csrf");
        if (csrf != null) {
            model.addAttribute("token", csrf.getToken());
        }

        return "admin-global-valorations-page";
    }

    @PostMapping("/valorations/delete/{id}")
    public String deleteValoration(@PathVariable Long id) {
        adminService.deleteValoration(id);
        return "redirect:/admin/valorations";
    }

    @GetMapping("/products/edit/{id}")
    public String showEditProductAsAdmin(@PathVariable Long id, Model model, HttpServletRequest request) {

        Product product = productService.findById(id).orElseThrow();

        model.addAttribute("product", product);

        CsrfToken csrf = (CsrfToken) request.getAttribute("_csrf");
        if (csrf != null) {
            model.addAttribute("token", csrf.getToken());
        }

        return "edit-product-page";
    }

    /**
     * Updates an existing product's details.
     * The imageField is optional to allow editing text fields without re-uploading photos.
     */
    @PostMapping("/products/edit/{id}")
    public String updateProductAsAdmin(@PathVariable long id,
                                    Product updatedProduct,
                                    @RequestParam MultipartFile imageField) throws IOException {

        // Delegate update logic to AdminService
        adminService.updateProductAsAdmin(id, updatedProduct, imageField);

        return "redirect:/admin/global-inventory";
    }

    @PostMapping("/products/delete/{id}")
    public String deleteProductAsAdmin(@PathVariable Long id) {

        adminService.deleteProductAsAdmin(id);

        return "redirect:/admin/global-inventory";
    }

    private String formatInt(int value) {
        return NumberFormat.getIntegerInstance(Locale.forLanguageTag("es-ES")).format(value);
    }
}
