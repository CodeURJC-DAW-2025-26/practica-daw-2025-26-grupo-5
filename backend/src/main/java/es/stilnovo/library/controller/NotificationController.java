package es.stilnovo.library.controller;

import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import es.stilnovo.library.service.NotificationService;

/**
 * NotificationController: Handles buyer-to-seller inquiry emails
 * 
 * This controller manages:
 * - Inquiry form submission validation
 * - Spam prevention with cooldown periods (30 minutes)
 * - Email notification to seller about new inquiry
 * - Confirmation email to buyer
 * - Inquiry persistence with status tracking (SENT/FAILED_MAIL)
 * 
 * Uses: ProductService, MailService, UserService, InquiryService
 */
@Controller
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    /** Process inquiry submission with spam prevention and email notifications */
    @PostMapping("/notifications/send-inquiry")
    public String sendInquiry(@RequestParam long productId,
                                @RequestParam(required = false) String phone,
                                @RequestParam String type,
                                @RequestParam String message,
                                Principal principal) {
        if (principal == null) {
            return "redirect:/contact-seller-page/" + productId + "?error=auth";
        }

        var result = notificationService.sendInquiry(productId, phone, type, message, principal.getName());
        if (result.cooldownMinutes() != null) {
            return "redirect:/contact-seller-page/" + productId + "?cooldown=" + result.cooldownMinutes();
        }
        if (!result.sent()) {
            return "redirect:/contact-seller-page/" + productId + "?error=" + result.errorCode();
        }
        return "redirect:/contact-seller-page/" + productId + "?sent=true";
    }
}