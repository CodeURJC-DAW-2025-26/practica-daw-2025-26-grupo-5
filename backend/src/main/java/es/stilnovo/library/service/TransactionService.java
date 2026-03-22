package es.stilnovo.library.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import jakarta.mail.MessagingException;
import es.stilnovo.library.dto.TransactionDTO;
import es.stilnovo.library.dto.TransactionMapper;
import es.stilnovo.library.dto.TransactionUpdateRequestDTO;
import es.stilnovo.library.model.Product;
import es.stilnovo.library.model.Transaction;
import es.stilnovo.library.model.User;
import es.stilnovo.library.model.UserInteraction;
import es.stilnovo.library.repository.ProductRepository;
import es.stilnovo.library.repository.TransactionRepository;
import es.stilnovo.library.repository.UserInteractionRepository;
import es.stilnovo.library.repository.UserRepository;
import es.stilnovo.library.repository.ValorationRepository;

/**
 * TransactionService for managing purchase transactions
 * Handles payment processing, transaction recording, and financial updates
 */
@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ValorationRepository valorationRepository;

    @Autowired
    private UserInteractionRepository interactionRepository;

    @Autowired
    private MailService mailService;

    @Autowired
    private ResourceLoader resourceLoader;

    @Autowired
    private TransactionMapper transactionMapper;

    /**
     * Executes the business logic for a purchase.
     * Updates product status and creates a permanent transaction record.
     */
    @Transactional
    public Transaction executePurchase(Product product, User buyer) {
        // STEP 1: Validate product is available for sale
        if (!"active".equalsIgnoreCase(product.getStatus())) {
            throw new IllegalStateException("not_available");
        }

        // STEP 2: Create transaction record with buyer, seller, and product details
        Transaction transaction = new Transaction(
                product.getSeller(),
                buyer,
                product,
                "Completed");

        // STEP 3: Calculate new seller financial balance
        User seller = product.getSeller();
        Double productPrice = product.getPrice();
        Double sellerBalance = seller.getBalance();
        Double sellerTotalRevenue = seller.getTotalRevenue();

        sellerBalance += productPrice;
        sellerTotalRevenue += productPrice;

        // STEP 4: Persist updated seller financial information
        seller.setBalance(sellerBalance);
        seller.setTotalRevenue(sellerTotalRevenue);

        userRepository.save(seller);

        // STEP 5: Mark product as sold and record interaction
        product.setStatus("Sold");
        productRepository.save(product);
        UserInteraction buyInteraction = new UserInteraction(buyer, product, UserInteraction.InteractionType.BUY);
        interactionRepository.save(buyInteraction);

        // STEP 6: Persist transaction and return
        return transactionRepository.save(transaction);
    }

    @Transactional
    public Transaction confirmPurchase(long productId, String buyerUsername) {
        User buyer = userRepository.findByName(buyerUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        if (product.getSeller().getUserId().equals(buyer.getUserId())) {
            throw new IllegalStateException("self_purchase");
        }

        Transaction transaction = executePurchase(product, buyer);
        sendPurchaseEmails(product, buyer);
        return transaction;
    }

    public String resolveConfirmPurchaseRedirect(long productId, String buyerUsername) {
        if (buyerUsername == null) {
            return "redirect:/login-page";
        }

        try {
            confirmPurchase(productId, buyerUsername);
            return "redirect:/sales-and-orders-page";
        } catch (IllegalStateException exception) {
            return "redirect:/info-product-page/" + productId + "?error=" + exception.getMessage();
        }
    }

    /**
     * Calculates financial breakdown for payment invoice (VAT, fees, total)
     * VAT rate: 21%, Service fee: 1%
     */
    public record InvoiceBreakdown(double base, double fees, double vat, double total) {
    }

    public InvoiceBreakdown calculateInvoiceBreakdown(double finalPrice) {
        double base = finalPrice;
        double vat = base * 0.21; // 21% VAT
        double fees = base * 0.01; // 1% Stilnovo service fee
        double total = base + fees + vat;
        return new InvoiceBreakdown(base, fees, vat, total);
    }

    /**
     * Gets a transaction if the current user is either the buyer or seller.
     * Used for Invoice generation (both parties can see it).
     * 
     * @param transactionId The ID of the transaction
     * @param username      The authenticated username from Principal
     * @return The transaction if user has access
     * @throws IllegalStateException if user is not involved or transaction not
     *                               found
     */
    public Transaction getTransactionForInvolvedUser(long transactionId, String username) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));

        boolean isBuyer = transaction.getBuyer().getName().equals(username);
        boolean isSeller = transaction.getSeller().getName().equals(username);

        if (!isBuyer && !isSeller) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        return transaction;
    }

    /**
     * Gets a transaction if the current user is the seller.
     * Used for Shipping Label generation (only seller can generate it).
     * 
     * @param transactionId The ID of the transaction
     * @param username      The authenticated username from Principal
     * @return The transaction if user is the seller
     * @throws IllegalStateException if user is not the seller or transaction not
     *                               found
     */
    public Transaction getTransactionForSeller(long transactionId, String username) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));

        if (!transaction.getSeller().getName().equals(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        return transaction;
    }

    /**
     * Gets all transactions where the user is the seller.
     * Used for statistics and reports (secure via Principal-based username).
     * 
     * @param username The authenticated username from Principal
     * @return List of transactions where this user is the seller
     */
    public List<Transaction> getSellerTransactions(String username) {
        User seller = userRepository.findByName(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        return transactionRepository.findBySeller(seller);
    }

    public Page<Transaction> getSellerTransactions(String username, Pageable pageable) {
        User seller = userRepository.findByName(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return transactionRepository.findBySeller(seller, pageable);
    }

    /**
     * This method returns all the transactions at the moment.
     * 
     * @return a list of transactions
     */
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    /**
     * This method returns the totalRevenue of Stilnovo
     * 
     * @return the totalRevenue of earnings
     */
    public int getTotalRevenue() {
        List<Transaction> transactions = getAllTransactions();
        int totalRevenue = 0;
        for (Transaction transaction : transactions) {
            totalRevenue += transaction.getProduct().getPrice();
        }
        return totalRevenue;
    }

    public int getTotalNumOfTransactions() {
        return getAllTransactions().size();
    }
    /**
     * Updates the details of an existing transaction.
     * It relies on getTransactionForInvolvedUser to ensure that only an involved 
     * user (buyer or seller) can access and modify it.
     *
     * @param transactionId The ID of the transaction to update
     * @param request       The DTO containing the updated fields
     * @param username      The username of the currently authenticated user
     * @return The updated Transaction entity
     */
    @Transactional
    public Transaction updateTransaction(long transactionId, TransactionUpdateRequestDTO request, String username) {
        // 1. Retrieve the transaction. This helper method already checks if the user 
        // is involved (buyer/seller) and throws 404 (Not Found) or 403 (Forbidden) if necessary.
        Transaction transaction = getTransactionForInvolvedUser(transactionId, username);

        // 2. Update the fields based on the provided request DTO.
        // Assuming your Transaction entity has these standard setters.
        if (request.transactionStatus() != null) {
            transaction.setTransactionStatus(request.transactionStatus());
        }
        
        transaction.setRated(request.rated());
        
        if (request.stars() != null) {
            transaction.setStars(request.stars());
        }

        // 3. Save and return the updated transaction
        return transactionRepository.save(transaction);
    }

    /**
     * Performs a secure deletion of a transaction by its ID.
     * This method reverts the business logic associated with the sale:
     * 1. Removes linked ratings to satisfy foreign key constraints.
     * 2. Sets the product status back to 'Active' so it can be sold again.
     * 3. Subtracts the sale price from the seller's balance with decimal precision.
     * 4. Detaches entity relationships before final removal.
     *
     * @param transactionId the unique identifier of the transaction to be deleted
     * @throws RuntimeException if the transaction does not exist in the database
     */
    @Transactional
    public void deleteTransaction(Long transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        valorationRepository.deleteByTransactionIn(List.of(transaction));

        User seller = transaction.getSeller();
        Product product = transaction.getProduct();

        if (product != null) {
            product.setStatus("Active");
            product.setSeller(seller);
        }

        if (seller != null && product != null) {
            double price = product.getPrice();
            double newBalance = seller.getBalance() - price;
            seller.setBalance(Math.round(newBalance * 100.0) / 100.0);
        }

        transaction.setBuyer(null);
        transaction.setSeller(null);
        transaction.setProduct(null);

        transactionRepository.delete(transaction);
    }

    private void sendPurchaseEmails(Product product, User buyer) {
        try {
            Resource logoResource = resourceLoader.getResource("classpath:static/images/logo.png");
            String logoCid = "stilnovoLogo";
            String buyerHtml = createPurchaseConfirmationEmail(
                    product.getName(),
                    product.getPrice(),
                    product.getSeller().getName(),
                    buyer.getName(),
                    logoCid);

            mailService.sendHtmlWithInline(
                    buyer.getEmail(),
                    "Stilnovo: Purchase Confirmation - " + product.getName(),
                    buyerHtml,
                    logoCid,
                    logoResource);

            String sellerHtml = createSellerSaleNotificationEmail(
                    product.getName(),
                    product.getPrice(),
                    buyer.getName(),
                    buyer.getEmail(),
                    logoCid);

            mailService.sendHtmlWithInline(
                    product.getSeller().getEmail(),
                    "Stilnovo: Your product sold! - " + product.getName(),
                    sellerHtml,
                    logoCid,
                    logoResource);
        } catch (MailException | MessagingException ex) {
            System.err.println("Failed to send confirmation emails: " + ex.getMessage());
        }
    }

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
                        </div>
                    </div>
                </body>
                </html>
                """
                .formatted(logoCid, escape(buyerName), escape(productName), price, escape(sellerName));
    }

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
                                    <li><strong>Buyer Email:</strong> %s</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
                """
                .formatted(logoCid, escape(productName), price, escape(buyerName), escape(buyerEmail));
    }

    private String escape(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
    /**
     * Retrieves a single transaction by its ID and converts it to a DTO.
     * @param id The ID of the transaction.
     * @return The TransactionDTO if found.
     */
    public TransactionDTO getTransactionById(Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));
        
        return transactionMapper.toDTO(transaction);
    }
}
