package es.stilnovo.library.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import es.stilnovo.library.model.Product;
import es.stilnovo.library.model.Transaction;
import es.stilnovo.library.model.User;
import java.util.List;

/**
 * TransactionRepository interface for Transaction entity database operations
 * Manages transaction records for completed sales between buyers and sellers
 */
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    /**
     * Get all transactions where a user was the buyer
     * @param buyerId the buyer's user ID
     * @return list of purchases by this user
     */
    List<Transaction> findByBuyerUserId(Long buyerId);
    
    /**
     * Get all transactions where a user was the seller
     * @param sellerId the seller's user ID
     * @return list of sales by this user
     */
    List<Transaction> findBySellerUserId(Long sellerId);
    
    /**
     * Get all transactions where this user is the seller
     * @param seller the seller user entity
     * @return list of sales by this seller
     */
    List<Transaction> findBySeller(User seller);

    Page<Transaction> findBySeller(User seller, Pageable pageable);

    /**
     * Find all transactions involving a user as either buyer or seller
     * @param buyer the user as buyer
     * @param seller the user as seller
     * @return list of transactions involving this user
     */
    List<Transaction> findByBuyerOrSeller(User buyer, User seller);

    // Finds all transactions where this specific product was involved
    List<Transaction> findByProduct(Product product);
}