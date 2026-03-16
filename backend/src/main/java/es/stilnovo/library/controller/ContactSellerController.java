package es.stilnovo.library.controller;

import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import es.stilnovo.library.service.ContactSellerService;

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
    private ContactSellerService contactSellerService;

    @GetMapping("/contact-seller-page/{id}")
    public String showContactSeller(@PathVariable long id, Model model, Principal principal,
                                    @RequestParam(required = false) String sent,
                                    @RequestParam(required = false) String error,
                                    @RequestParam(required = false) String cooldown) {
        // STEP 1: Check buyer is authenticated
        if (principal == null) {
            return "redirect:/login-page";
        }

        try {
            var pageData = contactSellerService.getContactSellerPageData(id, principal.getName());
            model.addAttribute("product", pageData.product());
            model.addAttribute("seller", pageData.seller());
            model.addAttribute("buyerName", pageData.buyerName());
            model.addAttribute("buyerEmail", pageData.buyerEmail());
        } catch (IllegalStateException exception) {
            return "redirect:/info-product-page/" + id + "?error=self_purchase";
        }

        // STEP 7: Pass status flags to template (sent, error, cooldown messages)
        model.addAttribute("sent", "true".equalsIgnoreCase(sent));
        model.addAttribute("error", error);
        model.addAttribute("cooldownMinutes", cooldown);

        return "contact-seller-page";
    }
}
