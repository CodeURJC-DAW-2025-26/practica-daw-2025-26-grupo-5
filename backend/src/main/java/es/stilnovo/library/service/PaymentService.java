package es.stilnovo.library.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import es.stilnovo.library.model.Product;
import es.stilnovo.library.model.User;

@Service
public class PaymentService {

    @Autowired
    private ProductService productService;

    @Autowired
    private UserService userService;

    public CheckoutData prepareCheckout(long productId, String username) {
        //Checks authentication and if it is a self purchase
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
}
