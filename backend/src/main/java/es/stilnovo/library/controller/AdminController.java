package es.stilnovo.library.controller;

import java.io.IOException;
import java.util.List;

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
import es.stilnovo.library.model.Transaction;
import es.stilnovo.library.model.User;
import es.stilnovo.library.model.Valoration;
import es.stilnovo.library.service.AdminService;
import es.stilnovo.library.service.TransactionService;
import es.stilnovo.library.service.UserService;
import es.stilnovo.library.service.ValorationService;
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
    
    @Autowired
    private TransactionService transactionService;

    @Autowired
    private ValorationService valorationService;

    

    /**
     * Displays the main admin dashboard with system statistics
     * Shows: total users, banned users count, recent users list, memory usage
     */
    @GetMapping({ "", "/", "/panel" })
    public String showAdminPanel(Model model, HttpServletRequest request) {

        int numUsers = adminService.getNumTotalUsers();
        int numBanneds = adminService.getNumBanneds();

        model.addAttribute("numUsers", numUsers);
        model.addAttribute("numBanneds", numBanneds);
        
        List<User> allUsers = userService.findAll();
        List<User> dashboardUsers = allUsers.stream()
                                            .limit(3)
                                            .toList();
        
        model.addAttribute("users", dashboardUsers);

        
        List<Product> allProducts = productService.findAll();
        List<Product> dashboardProducts = allProducts.stream()
                                                    .limit(3)
                                                    .toList();

        model.addAttribute("products", dashboardProducts);

        CsrfToken csrf = (CsrfToken) request.getAttribute("_csrf");
        if (csrf != null) {
            model.addAttribute("token", csrf.getToken());
        }

        long usedMemory = (Runtime.getRuntime().totalMemory() - Runtime.getRuntime().freeMemory()) / (1024 * 1024);
        model.addAttribute("memoryUsage", usedMemory + " MB");

        return "admin-panel-page";
    }

    /**
     * Lists all users in the system with sorting/filtering
     * Includes CSRF token for delete/ban operations
     */
    @GetMapping("/users")
    public String listUsers(Model model, HttpServletRequest request) {
        // Use service layer instead of direct repository access
        List<User> users = userService.findAll();
        model.addAttribute("users", users);

        // Add CSRF token object to model so Mustache section {{#_csrf}} works
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

        List<Product> products = adminService.getAllProducts();
        model.addAttribute("products", products);

        CsrfToken csrf = (CsrfToken) request.getAttribute("_csrf");
        if (csrf != null) {
            model.addAttribute("token", csrf.getToken());
        }

        return "admin-global-invent-page";
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
        
        model.addAttribute("totalRevenue", transactionService.getTotalRevenue());
        model.addAttribute("numTransactions", transactionService.getTotalNumOfTransactions());

        List<Transaction> globalTransactions = transactionService.getAllTransactions();
        model.addAttribute("globalTransactions", globalTransactions);
        
        return "admin-global-transac-page";
    }

    @PostMapping("/transactions/delete/{id}")
    public String deleteTransaction(@PathVariable Long id) {

        transactionService.deleteTransacction(id);
        
        return "redirect:/admin/transactions";
    }
    

    // Ban / Unban user (toggle)
    @PostMapping("/users/ban/{id}")
    public String toggleBanUser(@PathVariable Long id) {

        // Use service layer instead of direct repository access
        User user = userService.findById(id).orElseThrow();

        user.setBanned(!user.isBanned()); // TOGGLE

        userService.save(user);

        return "redirect:/admin/users";
    }

    @GetMapping("/valorations")
    public String showGlobalValorations(Model model, HttpServletRequest request) {
        
        List<Valoration> valorations = valorationService.findAll(); // O el método que tengas para listar todas
        model.addAttribute("globalValorations", valorations);
        model.addAttribute("numValorations", valorations.size());
        
        // Opcional: Calcular media global de la plataforma
        double avg = valorations.stream().mapToInt(Valoration::getStars).average().orElse(0.0);
        model.addAttribute("avgRating", Math.round(avg * 10.0) / 10.0);

        // Seguridad CSRF
        CsrfToken csrf = (CsrfToken) request.getAttribute("_csrf");
        if (csrf != null) {
            model.addAttribute("token", csrf.getToken());
        }

        return "admin-global-valorations-page";
    }

    @PostMapping("/valorations/delete/{id}")
    public String deleteValoration(@PathVariable Long id) {
        valorationService.deleteById(id);
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
}
