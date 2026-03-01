package es.stilnovo.library.controller;

import java.security.Principal;
import java.time.Duration;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.mail.MailException;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import es.stilnovo.library.model.Product;
import es.stilnovo.library.model.User;
import es.stilnovo.library.model.Inquiry;
import es.stilnovo.library.service.InquiryService;
import es.stilnovo.library.service.MailService;
import es.stilnovo.library.service.ProductService;
import es.stilnovo.library.service.UserService;
import jakarta.mail.MessagingException;

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
    private ProductService productService;

    @Autowired
    private MailService mailService;

    @Autowired
    private UserService userService;

    @Autowired
    private InquiryService inquiryService;

    @Autowired
    private ResourceLoader resourceLoader; // To load the logo from classpath

    /** Process inquiry submission with spam prevention and email notifications */
    @PostMapping("/notifications/send-inquiry")
    public String sendInquiry(@RequestParam long productId,
                                @RequestParam(required = false) String phone,
                                @RequestParam String type,
                                @RequestParam String message,
                                Principal principal) {
        // STEP 1: Validate product exists and user is authenticated
        Product product = productService.findById(productId).orElseThrow();
        if (principal == null) {
            return "redirect:/contact-seller-page/" + productId + "?error=auth";
        }

        User buyer = userService.findByName(principal.getName()).orElse(null);
        if (buyer == null) {
            return "redirect:/contact-seller-page/" + productId + "?error=auth";
        }

        // STEP 2: Check spam cooldown (30 minutes between inquiries)
        Inquiry lastInquiry = inquiryService.getLastInquiry(buyer.getUserId(), product.getId()).orElse(null);
        if (lastInquiry != null) {
            long secondsSince = Duration.between(lastInquiry.getCreatedAt(), LocalDateTime.now()).getSeconds();
            long cooldown = 1800 - secondsSince;
            if (cooldown > 0) {
                long minutes = (long) Math.ceil(cooldown / 60.0);
            return "redirect:/contact-seller-page/" + productId + "?cooldown=" + minutes;
            }
        }

        // STEP 3: Prepare email resources and template data
        Resource logoResource = resourceLoader.getResource("classpath:static/images/logo.png");
        String logoCid = "stilnovoLogo";
        String sellerEmail = product.getSeller().getEmail();
        String phoneValue = (phone == null || phone.isBlank()) ? "Not provided" : phone;

        // STEP 4: Generate HTML email templates for seller and buyer
        String sellerHtml = MailTemplates.proSellerInquiry(
                product.getId(), product.getName(), type, message, 
                buyer.getName(), buyer.getEmail(), phoneValue, logoCid
        );
        String buyerHtml = MailTemplates.buyerConfirmation(product.getName(), type, message, logoCid);

        // STEP 5: Send emails and persist inquiry with appropriate status
        try {
            mailService.sendHtmlWithInline(sellerEmail, "New Inquiry: " + product.getName(), sellerHtml, logoCid, logoResource);
            mailService.sendHtmlWithInline(buyer.getEmail(), "Confirmation: Message sent to seller", buyerHtml, logoCid, logoResource);
            
            inquiryService.createInquiry(
                product.getId(),
                product.getName(),
                product.getSeller().getUserId(),
                sellerEmail,
                buyer.getUserId(),
                buyer.getName(),
                buyer.getEmail(),
                phoneValue,
                type,
                message,
                "SENT"
            );
            return "redirect:/contact-seller-page/" + productId + "?sent=true";

        } catch (MailException | MessagingException ex) {
            inquiryService.createInquiry(
                product.getId(),
                product.getName(),
                product.getSeller().getUserId(),
                sellerEmail,
                buyer.getUserId(),
                buyer.getName(),
                buyer.getEmail(),
                phoneValue,
                type,
                message,
                "FAILED_MAIL"
            );
            return "redirect:/contact-seller-page/" + productId + "?error=mail";
        }
    }

    /**
     * Inner class to manage HTML Email Templates with inline CSS for compatibility.
     */
    private static class MailTemplates {
        
        private static String proSellerInquiry(long productId, String productName, String type, String message,
                                                String buyerName, String buyerEmail, String phone, String logoCid) {
            return """
                <!DOCTYPE html>
                <html>
                <body style="margin: 0; padding: 0; background-color: #f4f7f6;">
                    <div style="font-family: Arial, sans-serif; color: #1a1f2e; max-width: 600px; margin: 20px auto; border: 1px solid #e6e9f2; border-radius: 16px; background-color: #ffffff; overflow: hidden;">
                        <div style="background-color: #ffffff; padding: 30px; text-align: center; border-bottom: 1px solid #f0f0f0;">
                            <img src="cid:%s" alt="Stilnovo" width="60" style="display: block; margin: 0 auto;">
                            <h1 style="color: #2f6ced; margin: 15px 0 0; font-size: 24px;">New Inquiry Received!</h1>
                        </div>
                        <div style="padding: 30px;">
                            <p style="font-size: 16px;">Good news! Someone is interested in your treasure:</p>
                            <h2 style="margin: 10px 0; font-size: 20px; color: #1a1f2e;">%s</h2>
                            
                            <div style="background-color: #eef4ff; padding: 20px; border-radius: 12px; margin: 25px 0;">
                                <p style="margin: 0 0 10px 0; font-weight: bold; color: #2f6ced;">Buyer Contact Information:</p>
                                <ul style="list-style: none; padding: 0; margin: 0; font-size: 14px; line-height: 1.8;">
                                    <li>👤 <strong>Name:</strong> %s</li>
                                    <li>✉️ <strong>Email:</strong> <a href="mailto:%s" style="color: #2f6ced; text-decoration: none;">%s</a></li>
                                    <li>📞 <strong>Phone:</strong> %s</li>
                                </ul>
                            </div>

                            <p><strong>Inquiry type:</strong> %s</p>
                            <div style="background: #ffffff; border-left: 4px solid #2f6ced; padding: 15px; border-radius: 4px; margin: 20px 0; font-style: italic; background-color: #f9fbff;">
                                "%s"
                            </div>

                            <div style="text-align: center; margin-top: 35px;">
                                <a href="https://localhost:8443/info-product-page/%d" 
                                    style="background-color: #2f6ced; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 30px; font-weight: bold; display: inline-block;">
                                    View Product & Reply
                                </a>
                            </div>
                        </div>
                        <div style="padding: 20px; text-align: center; font-size: 12px; color: #888; background-color: #fafafa; border-top: 1px solid #f0f0f0;">
                            <p>© 2026 Stilnovo Marketplace • Giving design a second life.</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(logoCid, escape(productName), escape(buyerName), escape(buyerEmail), escape(buyerEmail), escape(phone), escape(type), escape(message), productId);
        }

        private static String buyerConfirmation(String productName, String type, String message, String logoCid) {
            return """
                <!DOCTYPE html>
                <html>
                <body style="margin: 0; padding: 0; background-color: #f4f7f6;">
                    <div style="font-family: Arial, sans-serif; color: #1a1f2e; max-width: 600px; margin: 20px auto; border: 1px solid #e6e9f2; border-radius: 16px; background-color: #ffffff; overflow: hidden;">
                        <div style="background-color: #ffffff; padding: 30px; text-align: center; border-bottom: 1px solid #f0f0f0;">
                            <img src="cid:%s" alt="Stilnovo" width="60" style="display: block; margin: 0 auto;">
                            <h1 style="color: #2f6ced; margin: 15px 0 0; font-size: 24px;">Inquiry Sent!</h1>
                        </div>
                        <div style="padding: 30px;">
                            <p style="font-size: 16px;">Great! Your inquiry has been sent to the seller.</p>
                            <h2 style="margin: 10px 0; font-size: 20px; color: #1a1f2e;">%s</h2>
                            
                            <div style="background-color: #eef4ff; padding: 20px; border-radius: 12px; margin: 25px 0;">
                                <p style="margin: 0 0 10px 0; font-weight: bold; color: #2f6ced;">Inquiry Details:</p>
                                <ul style="list-style: none; padding: 0; margin: 0; font-size: 14px; line-height: 1.8;">
                                    <li><strong>Type:</strong> %s</li>
                                    <li><strong>Status:</strong> Sent to Seller</li>
                                </ul>
                            </div>

                            <div style="background: #ffffff; border-left: 4px solid #2f6ced; padding: 15px; border-radius: 4px; margin: 20px 0; background-color: #f9fbff;">
                                <p style="margin: 0; font-size: 14px; color: #555;">
                                    Your message: "%s"
                                </p>
                            </div>

                            <div style="background: #ffffff; border-left: 4px solid #2f6ced; padding: 15px; border-radius: 4px; margin: 20px 0; background-color: #f9fbff;">
                                <p style="margin: 0; font-size: 14px; color: #555;">
                                    The seller will review your inquiry and contact you shortly. You can track all your inquiries in your dashboard.
                                </p>
                            </div>

                            <div style="text-align: center; margin-top: 35px;">
                                <a href="https://localhost:8443/sales-and-orders-page" 
                                    style="background-color: #2f6ced; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 30px; font-weight: bold; display: inline-block;">
                                    View Your Inquiries
                                </a>
                            </div>
                        </div>
                        <div style="padding: 20px; text-align: center; font-size: 12px; color: #888; background-color: #fafafa; border-top: 1px solid #f0f0f0;">
                            <p>© 2026 Stilnovo Marketplace • Giving design a second life.</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(logoCid, escape(productName), escape(type), escape(message));
        }

        private static String escape(String value) {
            if (value == null) return "";
            return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;").replace("'", "&#39;");
        }
    }
}