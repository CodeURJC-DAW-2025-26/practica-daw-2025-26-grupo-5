package es.stilnovo.library.controller;

import java.security.Principal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.server.ResponseStatusException;

import es.stilnovo.library.model.Product;
import es.stilnovo.library.model.User;
import es.stilnovo.library.service.MailService;
import es.stilnovo.library.service.ProductService;
import es.stilnovo.library.service.TransactionService;
import es.stilnovo.library.service.UserService;
import jakarta.mail.MessagingException;

/** Controller for handling purchase transactions and payment confirmation */
@Controller
public class TransactionController {

    @Autowired
    private TransactionService transactionService;
    
    @Autowired
    private ProductService productService;

    @Autowired  
    private UserService userService;

    @Autowired
    private MailService mailService;

    @Autowired
    private ResourceLoader resourceLoader;

    /**
     * Finalizes the purchase of a product.
     * It validates that the buyer is not the seller and then delegates the 
     * financial and inventory logic to the service layer.
     * * @param productId The ID of the item being purchased.
     * @param principal The authenticated buyer from the Security Context.
     * @return A redirect to the orders page on success, or back to the product on error.
     */
    @PostMapping("/transactions/confirm/{productId}")
    public String confirmPayment(@PathVariable long productId, Principal principal) {
        // STEP 1: Fetch buyer and product entities from services
        User buyer = userService.getFullUserProfile(principal.getName());
        Product product = productService.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        // STEP 2: Security validation - prevent seller from buying their own product
        if (product.getSeller().getUserId().equals(buyer.getUserId())) {
            return "redirect:/info-product-page/" + productId + "?error=self_purchase";
        }

        try {
            // STEP 3: Execute purchase transaction (updates inventory, balances, records transaction)
            transactionService.executePurchase(product, buyer);

            // STEP 4: Prepare confirmation email with logo
            Resource logoResource = resourceLoader.getResource("classpath:static/images/logo.png");
            String logoCid = "stilnovoLogo";
            String htmlBody = createPurchaseConfirmationEmail(
                product.getName(), 
                product.getPrice(), 
                product.getSeller().getName(),
                buyer.getName(),
                logoCid
            );
            
            try {
                // STEP 5: Send confirmation email to buyer
                mailService.sendHtmlWithInline(
                    buyer.getEmail(), 
                    "Stilnovo: Purchase Confirmation - " + product.getName(), 
                    htmlBody, 
                    logoCid, 
                    logoResource
                );
                
                // STEP 6: Send sale notification email to seller
                String sellerHtmlBody = createSellerSaleNotificationEmail(
                    product.getName(),
                    product.getPrice(),
                    buyer.getName(),
                    buyer.getEmail(),
                    logoCid
                );
                
                mailService.sendHtmlWithInline(
                    product.getSeller().getEmail(),
                    "Stilnovo: Your product sold! - " + product.getName(),
                    sellerHtmlBody,
                    logoCid,
                    logoResource
                );
            } catch (MailException | MessagingException ex) {
                // Log error but don't fail the transaction
                System.err.println("Failed to send confirmation emails: " + ex.getMessage());
            }

            // STEP 7: Redirect to orders page with clean URL
            return "redirect:/sales-and-orders-page";

        } catch (IllegalStateException e) {
            // Handle business logic errors (e.g., product already sold or insufficient funds)
            return "redirect:/info-product-page/" + productId + "?error=" + e.getMessage();
        }
    }

    /**
     * Creates a professional HTML email template for purchase confirmation.
     * Similar in style to the inquiry email template.
     */
    private String createPurchaseConfirmationEmail(String productName, Double price, 
                                                    String sellerName, String buyerName, String logoCid) {
        return """
            <!DOCTYPE html>
            <html>
            <body style="margin: 0; padding: 0; background-color: #f4f7f6;">
                <div style="font-family: Arial, sans-serif; color: #1a1f2e; max-width: 600px; margin: 20px auto; border: 1px solid #e6e9f2; border-radius: 16px; background-color: #ffffff; overflow: hidden;">
                    <div style="background-color: #ffffff; padding: 30px; text-align: center; border-bottom: 1px solid #f0f0f0;">
                        <img src="cid:%s" alt="Stilnovo" width="60" style="display: block; margin: 0 auto;">
                        <h1 style="color: #2f6ced; margin: 15px 0 0; font-size: 24px;">Purchase Successful!</h1>
                    </div>
                    <div style="padding: 30px;">
                        <p style="font-size: 16px;">Congratulations %s! Your purchase has been confirmed.</p>
                        <h2 style="margin: 10px 0; font-size: 20px; color: #1a1f2e;">%s</h2>
                        
                        <div style="background-color: #eef4ff; padding: 20px; border-radius: 12px; margin: 25px 0;">
                            <p style="margin: 0 0 10px 0; font-weight: bold; color: #2f6ced;">Purchase Details:</p>
                            <ul style="list-style: none; padding: 0; margin: 0; font-size: 14px; line-height: 1.8;">
                                <li><strong>Price:</strong> €%.2f</li>
                                <li><strong>Seller:</strong> %s</li>
                                <li><strong>Status:</strong> Completed</li>
                            </ul>
                        </div>

                        <div style="background: #ffffff; border-left: 4px solid #2f6ced; padding: 15px; border-radius: 4px; margin: 20px 0; background-color: #f9fbff;">
                            <p style="margin: 0; font-size: 14px; color: #555;">
                                Your payment has been processed successfully. The seller has been notified and will contact you shortly to arrange delivery or pickup.
                            </p>
                        </div>

                        <div style="text-align: center; margin-top: 35px;">
                            <a href="https://localhost:8443/sales-and-orders-page" 
                                style="background-color: #2f6ced; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 30px; font-weight: bold; display: inline-block;">
                                View Your Orders
                            </a>
                        </div>
                    </div>
                    <div style="padding: 20px; text-align: center; font-size: 12px; color: #888; background-color: #fafafa; border-top: 1px solid #f0f0f0;">
                        <p>© 2026 Stilnovo Marketplace • Giving design a second life.</p>
                        <p>Thank you for choosing sustainable shopping!</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(logoCid, escape(buyerName), escape(productName), price, escape(sellerName));
    }

    /**
     * Creates a professional HTML email template for seller sale notification.
     * Notifies the seller that their product has been sold.
     */
    private String createSellerSaleNotificationEmail(String productName, Double price, 
                                                    String buyerName, String buyerEmail, String logoCid) {
        return """
            <!DOCTYPE html>
            <html>
            <body style="margin: 0; padding: 0; background-color: #f4f7f6;">
                <div style="font-family: Arial, sans-serif; color: #1a1f2e; max-width: 600px; margin: 20px auto; border: 1px solid #e6e9f2; border-radius: 16px; background-color: #ffffff; overflow: hidden;">
                    <div style="background-color: #ffffff; padding: 30px; text-align: center; border-bottom: 1px solid #f0f0f0;">
                        <img src="cid:%s" alt="Stilnovo" width="60" style="display: block; margin: 0 auto;">
                        <h1 style="color: #2f6ced; margin: 15px 0 0; font-size: 24px;">Great News! Product Sold!</h1>
                    </div>
                    <div style="padding: 30px;">
                        <p style="font-size: 16px;">Excellent work! Your product has been purchased by a buyer.</p>
                        <h2 style="margin: 10px 0; font-size: 20px; color: #1a1f2e;">%s</h2>
                        
                        <div style="background-color: #eef4ff; padding: 20px; border-radius: 12px; margin: 25px 0;">
                            <p style="margin: 0 0 10px 0; font-weight: bold; color: #2f6ced;">Sale Details:</p>
                            <ul style="list-style: none; padding: 0; margin: 0; font-size: 14px; line-height: 1.8;">
                                <li><strong>Sale Price:</strong> €%.2f</li>
                                <li><strong>Buyer Name:</strong> %s</li>
                                <li><strong>Buyer Email:</strong> <a href="mailto:%s" style="color: #2f6ced; text-decoration: none;">%s</a></li>
                                <li><strong>Status:</strong> Payment Received</li>
                            </ul>
                        </div>

                        <div style="background: #ffffff; border-left: 4px solid #2f6ced; padding: 15px; border-radius: 4px; margin: 20px 0; background-color: #f9fbff;">
                            <p style="margin: 0; font-size: 14px; color: #555;">
                                The buyer has been notified and will contact you shortly to arrange delivery or pickup. Please make sure to communicate with them within 24 hours.
                            </p>
                        </div>

                        <div style="text-align: center; margin-top: 35px;">
                            <a href="https://localhost:8443/sales-and-orders-page" 
                                style="background-color: #2f6ced; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 30px; font-weight: bold; display: inline-block;">
                                View Your Sales
                            </a>
                        </div>
                    </div>
                    <div style="padding: 20px; text-align: center; font-size: 12px; color: #888; background-color: #fafafa; border-top: 1px solid #f0f0f0;">
                        <p>© 2026 Stilnovo Marketplace • Giving design a second life.</p>
                        <p>Keep up the great work selling treasures!</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(logoCid, escape(productName), price, escape(buyerName), escape(buyerEmail), escape(buyerEmail));
    }

    /**
     * Escapes HTML special characters to prevent XSS and rendering issues.
     */
    private String escape(String value) {
        if (value == null) return "";
        return value.replace("&", "&amp;")
                    .replace("<", "&lt;")
                    .replace(">", "&gt;")
                    .replace("\"", "&quot;")
                    .replace("'", "&#39;");
    }
}