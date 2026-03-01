package es.stilnovo.library.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import es.stilnovo.library.model.Valoration;
import es.stilnovo.library.model.Transaction;
import es.stilnovo.library.model.User;
import java.util.List;

/**
 * ValorationRepository interface for Valoration entity database operations
 * Manages user feedback, ratings and reputation information
 */
@Repository
public interface ValorationRepository extends JpaRepository<Valoration, Long> {

    /**
     * Check if a transaction has already been rated
     * Prevents duplicate reviews for the same purchase
     * @param transaction the completed transaction
     * @return true if transaction has a rating, false otherwise
     */
    boolean existsByTransaction(Transaction transaction);

    /**
     * Get all ratings received by a seller
     * Used to calculate seller's reputation score
     * @param seller the seller user
     * @return list of ratings for this seller
     */
    List<Valoration> findBySeller(User seller);

    /**
     * Get all ratings submitted by a buyer
     * Shows the user's review history
     * @param buyer the user who wrote the reviews
     * @return list of ratings authored by this buyer
     */
    List<Valoration> findByBuyer(User buyer);

    /**
     * Delete all ratings associated with specific transactions
     * Bulk deletion when transactions are removed
     * @param transactions list of transactions to delete ratings for
     */
    @Modifying
    @Query("DELETE FROM Valoration v WHERE v.transaction IN :transactions")
    void deleteByTransactionIn(List<Transaction> transactions);
}