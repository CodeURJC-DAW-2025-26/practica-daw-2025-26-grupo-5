package es.stilnovo.library.service;

import java.time.Duration;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.mail.MailException;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import es.stilnovo.library.model.Inquiry;
import es.stilnovo.library.model.Product;
import es.stilnovo.library.model.User;
import jakarta.mail.MessagingException;

/**
 * NotificationService: Manages buyer-to-seller inquiries and email notifications
 * 
 * This service handles:
 * - Inquiry creation and submission
 * - Spam prevention with 30-minute cooldown
 * - Seller notification email delivery
 * - Buyer confirmation emails
 * - Inquiry status tracking and error handling
 */
@Service
public class NotificationService {

    /**
     * Result of an inquiry submission attempt
     * @param inquiry The created inquiry (null if failed)
     * @param sent True if emails were sent successfully
     * @param cooldownMinutes Remaining cooldown time if applicable
     * @param errorCode Error code if operation failed
     */
    public record InquirySubmissionResult(
            Inquiry inquiry,
            boolean sent,
            Long cooldownMinutes,
            String errorCode
    ) {
    }

    @Autowired
    private ProductService productService;

    @Autowired
    private MailService mailService;

    @Autowired
    private UserService userService;

    @Autowired
    private InquiryService inquiryService;

    @Autowired
    private ResourceLoader resourceLoader;

    @Value("${app.public-base-url:https://localhost:8443}")
    private String publicBaseUrl;

    public String resolveInquiryRedirect(long productId,
            String phone,
            String type,
            String message,
            String username) {
        if (username == null) {
            return "redirect:/contact-seller-page/" + productId + "?error=auth";
        }

        InquirySubmissionResult result = sendInquiry(productId, phone, type, message, username);
        if (result.cooldownMinutes() != null) {
            return "redirect:/contact-seller-page/" + productId + "?cooldown=" + result.cooldownMinutes();
        }
        if (!result.sent()) {
            return "redirect:/contact-seller-page/" + productId + "?error=" + result.errorCode();
        }
        return "redirect:/contact-seller-page/" + productId + "?sent=true";
    }

    public InquirySubmissionResult sendInquiry(long productId, String phone, String type, String message, String username) {
        Product product = productService.findById(productId).orElseThrow();
        User buyer = userService.findByName(username)
                .orElseThrow(() -> new ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "User not found"));

        if (product.getSeller().getUserId().equals(buyer.getUserId())) {
            return new InquirySubmissionResult(null, false, null, "self_purchase");
        }

        Inquiry lastInquiry = inquiryService.getLastInquiry(buyer.getUserId(), product.getId()).orElse(null);
        if (lastInquiry != null) {
            long secondsSince = Duration.between(lastInquiry.getCreatedAt(), LocalDateTime.now()).getSeconds();
            long cooldown = 1800 - secondsSince;
            if (cooldown > 0) {
                long minutes = (long) Math.ceil(cooldown / 60.0);
                return new InquirySubmissionResult(lastInquiry, false, minutes, "cooldown");
            }
        }

        Resource logoResource = resourceLoader.getResource("classpath:static/images/logo.png");
        String logoCid = "stilnovoLogo";
        String sellerEmail = product.getSeller().getEmail();
        String phoneValue = (phone == null || phone.isBlank()) ? "Not provided" : phone;

        String sellerHtml = MailTemplates.proSellerInquiry(
                publicBaseUrl,
                product.getId(), product.getName(), type, message,
                buyer.getName(), buyer.getEmail(), phoneValue, logoCid);
        String buyerHtml = MailTemplates.buyerConfirmation(publicBaseUrl, product.getName(), type, message, logoCid);

        try {
            mailService.sendHtmlWithInline(sellerEmail, "New Inquiry: " + product.getName(), sellerHtml, logoCid, logoResource);
            mailService.sendHtmlWithInline(buyer.getEmail(), "Confirmation: Message sent to seller", buyerHtml, logoCid, logoResource);

            Inquiry inquiry = inquiryService.createInquiry(
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
                    "SENT");
            return new InquirySubmissionResult(inquiry, true, null, null);
        } catch (MailException | MessagingException exception) {
            Inquiry inquiry = inquiryService.createInquiry(
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
                    "FAILED_MAIL");
            return new InquirySubmissionResult(inquiry, false, null, "mail");
        }
    }

    private static class MailTemplates {

        private static String proSellerInquiry(String baseUrl, long productId, String productName, String type, String message,
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
                                    <li><strong>Name:</strong> %s</li>
                                    <li><strong>Email:</strong> <a href="mailto:%s" style="color: #2f6ced; text-decoration: none;">%s</a></li>
                                    <li><strong>Phone:</strong> %s</li>
                                </ul>
                            </div>
                            <p><strong>Inquiry type:</strong> %s</p>
                            <div style="border-left: 4px solid #2f6ced; padding: 15px; border-radius: 4px; margin: 20px 0; font-style: italic; background-color: #f9fbff;">
                                "%s"
                            </div>
                            <div style="text-align: center; margin-top: 35px;">
                                <a href="%s/info-product-page/%d" style="background-color: #2f6ced; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 30px; font-weight: bold; display: inline-block;">
                                    View Product & Reply
                                </a>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(logoCid, escape(productName), escape(buyerName), escape(buyerEmail), escape(buyerEmail), escape(phone), escape(type), escape(message), baseUrl, productId);
        }

        private static String buyerConfirmation(String baseUrl, String productName, String type, String message, String logoCid) {
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
                            <div style="border-left: 4px solid #2f6ced; padding: 15px; border-radius: 4px; margin: 20px 0; background-color: #f9fbff;">
                                <p style="margin: 0; font-size: 14px; color: #555;">Your message: "%s"</p>
                            </div>
                            <div style="text-align: center; margin-top: 35px;">
                                <a href="%s/sales-and-orders-page" style="background-color: #2f6ced; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 30px; font-weight: bold; display: inline-block;">
                                    View Your Inquiries
                                </a>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(logoCid, escape(productName), escape(type), escape(message), baseUrl);
        }

        private static String escape(String value) {
            if (value == null) {
                return "";
            }
            return value.replace("&", "&amp;")
                    .replace("<", "&lt;")
                    .replace(">", "&gt;")
                    .replace("\"", "&quot;")
                    .replace("'", "&#39;");
        }
    }
}