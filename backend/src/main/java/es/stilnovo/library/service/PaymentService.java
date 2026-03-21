package es.stilnovo.library.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import es.stilnovo.library.model.Product;
import es.stilnovo.library.model.User;

/**
 * PaymentService: Manages payment and checkout operations
 * 
 * This service handles:
 * - Checkout data preparation and validation
 * - Product availability verification
 * - Self-purchase prevention
 * - Payment page resolution and error handling
 */
@Service
public class PaymentService {

    /**
     * Holds the resolved payment page view and checkout data
     * @param viewName The view name or redirect URL
     * @param checkoutData Checkout data if successful, null if redirect needed
     */
    public record PaymentPageResolution(String viewName, CheckoutData checkoutData) {
    }

    @Autowired
    private ProductService productService;

    @Autowired
    private UserService userService;

    /**
     * Prepares checkout data for a product purchase
     * @param productId The product to purchase
     * @param username The authenticated buyer
     * @return CheckoutData with product and buyer information
     * @throws ResponseStatusException 401 if not authenticated, 404 if product not found
     * @throws IllegalStateException if self-purchase or product unavailable
     */
    public CheckoutData prepareCheckout(long productId, String username) {
        // Checks authentication and if it is a self purchase
        if (username == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }

        Product product = productService.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        User buyer = userService.findByName(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (product.getSeller().getUserId().equals(buyer.getUserId())) {
            throw new IllegalStateException("self_purchase");
        }

        if (!"active".equalsIgnoreCase(product.getStatus())) {
            throw new IllegalStateException("not_available");
        }

        return new CheckoutData(product, buyer);
    }

    /**
     * Resolves the payment page view, handling redirects for various scenarios
     * @param productId The product ID
     * @param username The buyer's username (optional)
     * @return PaymentPageResolution with view name and checkout data (if applicable)
     */
    public PaymentPageResolution resolvePaymentPage(long productId, String username) {
        if (username == null) {
            return new PaymentPageResolution("redirect:/login-page", null);
        }

        try {
            CheckoutData checkoutData = prepareCheckout(productId, username);
            return new PaymentPageResolution("payment-page", checkoutData);
        } catch (IllegalStateException exception) {
            return new PaymentPageResolution("redirect:/info-product-page/" + productId + "?error=" + exception.getMessage(), null);
        }
    }
}
