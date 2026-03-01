package es.stilnovo.library.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

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


    /**
     * Executes the business logic for a purchase.
     * Updates product status and creates a permanent transaction record.
     */
    @Transactional
    public Transaction executePurchase(Product product, User buyer) {
        
        if (!"active".equalsIgnoreCase(product.getStatus())) {
            throw new IllegalStateException("Product is no longer available for sale.");
        }

        Transaction transaction = new Transaction(
            product.getSeller(),
            buyer,
            product,
            "Completed"
        );

        User seller = product.getSeller();
        Double productPrice = product.getPrice();
        Double sellerBalance = seller.getBalance();
        Double sellerTotalRevenue = seller.getTotalRevenue();

        sellerBalance += productPrice;
        sellerTotalRevenue += productPrice;
        
        seller.setBalance(sellerBalance);
        seller.setTotalRevenue(sellerTotalRevenue);

        userRepository.save(seller);

        product.setStatus("Sold");
        productRepository.save(product);
        UserInteraction buyInteraction = new UserInteraction(buyer, product, UserInteraction.InteractionType.BUY);
        interactionRepository.save(buyInteraction);

        return transactionRepository.save(transaction);
    }

    /**
     * Gets a transaction if the current user is either the buyer or seller.
     * Used for Invoice generation (both parties can see it).
     * @param transactionId The ID of the transaction
     * @param username The authenticated username from Principal
     * @return The transaction if user has access
     * @throws IllegalStateException if user is not involved or transaction not found
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
     * @param transactionId The ID of the transaction
     * @param username The authenticated username from Principal
     * @return The transaction if user is the seller
     * @throws IllegalStateException if user is not the seller or transaction not found
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
     * @param username The authenticated username from Principal
     * @return List of transactions where this user is the seller
     */
    public List<Transaction> getSellerTransactions(String username) {
        User seller = userRepository.findByName(username)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        return transactionRepository.findBySeller(seller);
    }

    /**
     * This method returns all the transactions at the moment.
     * @return a list of transactions
     */
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    /**
     * This method returns the totalRevenue of Stilnovo
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
    public void deleteTransacction(Long transactionId) {
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
}