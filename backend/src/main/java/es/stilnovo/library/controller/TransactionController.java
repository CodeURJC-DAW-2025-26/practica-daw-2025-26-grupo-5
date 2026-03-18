package es.stilnovo.library.controller;

import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

import es.stilnovo.library.service.PaymentService;
import es.stilnovo.library.service.TransactionService;

@Controller
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private PaymentService paymentService;

    /**
     * Processes the final confirmation of a product purchase from the web interface.
     * This method triggers the transaction logic via the service layer, including 
     * balance verification and inventory status updates.
     *
     * @param productId The unique ID of the product to be purchased.
     * @param principal The security context of the authenticated buyer.
     * @return A redirect to the "Sales and Orders" page on success, or back to the 
     * product detail page with an error message if the transaction fails 
     * (e.g., due to insufficient balance or product unavailability).
     */
    @PostMapping("/transactions/confirm/{productId}")
    public String confirmPayment(@PathVariable long productId, Principal principal) {
        try {
            // 1. Attempt to execute the purchase business logic
            transactionService.confirmPurchase(productId, principal.getName());
            
            // 2. SUCCESS: Redirect to the user's transaction history
            return "redirect:/sales-and-orders-page";
            
        } catch (IllegalStateException exception) {
            // 3. FAILURE: Redirect back to the product page with a descriptive error parameter
            return "redirect:/info-product-page/" + productId + "?error=" + exception.getMessage();
        }
    }

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
