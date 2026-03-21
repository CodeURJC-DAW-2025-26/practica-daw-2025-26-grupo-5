package es.stilnovo.library.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import es.stilnovo.library.model.Product;
import es.stilnovo.library.model.User;

/**
 * ContactSellerService: Manages seller contact page data aggregation
 * 
 * This service handles:
 * - Product and seller information retrieval
 * - Buyer authentication and profile data
 * - Self-purchase validation (prevents buyers from contacting themselves)
 * - Contact page data assembly for inquiry forms
 */
@Service
public class ContactSellerService {

    /**
     * Aggregates data needed for the contact seller page
     * @param product The product being inquired about
     * @param seller The seller's user profile
     * @param buyerName Pre-filled buyer name
     * @param buyerEmail Pre-filled buyer email
     */
    public record ContactSellerPageData(
            Product product,
            User seller,
            String buyerName,
            String buyerEmail) {
    }

    @Autowired
    private ProductService productService;

    @Autowired
    private UserService userService;

    /**
     * Aggregates all data needed to display the contact seller form
     * @param productId The product to inquire about
     * @param username The authenticated buyer
     * @return ContactSellerPageData with product, seller, and buyer info
     * @throws ResponseStatusException 404 if product/user not found
     * @throws IllegalStateException if attempting self-purchase
     */
    public ContactSellerPageData getContactSellerPageData(long productId, String username) {
        Product product = productService.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        User seller = product.getSeller();
        User buyer = userService.findByName(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (seller.getUserId().equals(buyer.getUserId())) {
            throw new IllegalStateException("self_purchase");
        }

        return new ContactSellerPageData(product, seller, buyer.getName(), buyer.getEmail());
    }
}