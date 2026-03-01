package es.stilnovo.library.controller;

import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import es.stilnovo.library.model.Product;
import es.stilnovo.library.model.User;
import es.stilnovo.library.service.ProductService;
import es.stilnovo.library.service.UserService;

/**
 * ContactSellerController: Handles buyer-to-seller messaging
 * 
 * This controller manages:
 * - Inquiry form display for contacting sellers
 * - Inquiry submission and validation
 * - Message/question storage
 * - Spam prevention via cooldown periods
 * - Seller notification of new inquiries
 * - Inquiry status tracking
 * 
 * Uses: InquiryService, ProductService, UserService, MailService
 */
@Controller
public class ContactSellerController {

    @Autowired
    private ProductService productService;

    @Autowired
    private UserService userService;

    @GetMapping("/contact-seller-page/{id}")
    public String showContactSeller(@PathVariable long id, Model model, Principal principal,
                                    @RequestParam(required = false) String sent,
                                    @RequestParam(required = false) String error,
                                    @RequestParam(required = false) String cooldown) {
        // STEP 1: Check buyer is authenticated
        if (principal == null) {
            return "redirect:/login-page";
        }

        // STEP 2: Fetch product and its seller
        Product product = productService.findById(id).orElseThrow();
        User seller = product.getSeller();
        
        // STEP 3: Get current buyer from security context
        User buyer = userService.findByName(principal.getName()).orElseThrow();

        // STEP 4: Prevent seller from sending inquiry about their own product
        if (seller.getUserId().equals(buyer.getUserId())) {
            return "redirect:/info-product-page/" + id + "?error=self_purchase";
        }

        // STEP 5: Populate model with product and seller information
        model.addAttribute("product", product);
        model.addAttribute("seller", seller);
        
        // STEP 6: Pre-fill buyer's contact information for convenience
        userService.findByName(principal.getName()).ifPresent(user -> {
            model.addAttribute("buyerName", user.getName());
            model.addAttribute("buyerEmail", user.getEmail());
        });

        // STEP 7: Pass status flags to template (sent, error, cooldown messages)
        model.addAttribute("sent", "true".equalsIgnoreCase(sent));
        model.addAttribute("error", error);
        model.addAttribute("cooldownMinutes", cooldown);

        return "contact-seller-page";
    }
}
