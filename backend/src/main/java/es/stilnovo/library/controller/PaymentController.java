package es.stilnovo.library.controller;

import java.security.Principal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import es.stilnovo.library.model.Product;
import es.stilnovo.library.model.User;
import es.stilnovo.library.service.ProductService;
import es.stilnovo.library.service.UserService;


/**
 * PaymentController: Handles checkout and payment page display
 * 
 * This controller manages:
 * - Payment form display
 * - Product and buyer information validation
 * - Prevention of sellers buying their own products
 * - Redirection to login for unauthenticated users
 * - Payment form data preparation (buyer info, product details)
 * 
 * Uses: ProductService, UserService
 */
@Controller
public class PaymentController {

    @Autowired
    private ProductService productService;

    @Autowired
    private UserService userService;

    /**
     * Renders the payment page for a specific product.
     * Includes security checks to ensure a valid transaction environment.
     * @param id The ID of the product to purchase.
     * @param principal The security principal of the logged-in buyer.
     * @return The payment view or a redirect if validation fails.
     */
    @GetMapping("/payment-page/{id}")
    public String showPaymentPage(Model model, @PathVariable long id, Principal principal) {
        // STEP 1: Authentication check - redirect to login if not authenticated
        if (principal == null) {
            return "redirect:/login-page";
        }

        // STEP 2: Fetch product from database via service layer
        Product product = productService.findById(id).orElseThrow();

        // STEP 3: Get current buyer user information from security context
        User buyer = userService.findByName(principal.getName()).orElseThrow();

        // STEP 4: Security validation - prevent sellers from buying their own products
        if (product.getSeller().getUserId().equals(buyer.getUserId())) {
            return "redirect:/info-product-page/" + id + "?error=self_purchase";
        }

        // STEP 5: Check product is still available (active status)
        if (!"active".equalsIgnoreCase(product.getStatus())) {
            return "redirect:/info-product-page/" + id + "?error=not_available";
        }

        // STEP 6: Populate model with product and buyer data for payment form
        model.addAttribute("product", product);
        model.addAttribute("user", buyer);

        return "payment-page";
    }
}