package es.stilnovo.library.controller;

import java.security.Principal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import es.stilnovo.library.service.PaymentService;


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
    private PaymentService paymentService;

    /**
     * Renders the payment page for a specific product.
     * Includes security checks to ensure a valid transaction environment.
     * @param id The ID of the product to purchase.
     * @param principal The security principal of the logged-in buyer.
     * @return The payment view or a redirect if validation fails.
     */
    @GetMapping("/payment-page/{id}")
    public String showPaymentPage(Model model, @PathVariable long id, Principal principal) {
        if (principal == null) {
            return "redirect:/login-page";
        }

        try {
            var checkoutData = paymentService.prepareCheckout(id, principal.getName());
            model.addAttribute("product", checkoutData.product());
            model.addAttribute("user", checkoutData.buyer());
            return "payment-page";
        } catch (IllegalStateException exception) {
            return "redirect:/info-product-page/" + id + "?error=" + exception.getMessage();
        }
    }
}