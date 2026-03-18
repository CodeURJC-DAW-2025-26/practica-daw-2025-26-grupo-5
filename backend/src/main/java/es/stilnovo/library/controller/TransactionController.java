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
        return transactionService.resolveConfirmPurchaseRedirect(
                productId,
                principal != null ? principal.getName() : null);
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
        var resolution = paymentService.resolvePaymentPage(id, principal != null ? principal.getName() : null);
        if (resolution.checkoutData() != null) {
            model.addAttribute("product", resolution.checkoutData().product());
            model.addAttribute("user", resolution.checkoutData().buyer());
        }
        return resolution.viewName();
    }
}
