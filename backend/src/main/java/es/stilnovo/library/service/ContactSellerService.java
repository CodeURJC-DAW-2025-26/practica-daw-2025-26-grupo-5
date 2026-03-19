package es.stilnovo.library.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import es.stilnovo.library.model.Product;
import es.stilnovo.library.model.User;

@Service
public class ContactSellerService {

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