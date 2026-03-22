package es.stilnovo.library.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import es.stilnovo.library.model.Product;
import es.stilnovo.library.model.User;
import es.stilnovo.library.model.UserInteraction;

/**
 * UserInteractionRepository interface for UserInteraction entity database operations
 * Tracks user actions including views, likes (favorites), and purchases
 */
@Repository
public interface UserInteractionRepository extends JpaRepository<UserInteraction, Long> {

    boolean existsByUserAndProductAndType(User user, Product product, UserInteraction.InteractionType type);

    /**
     * Delete all interactions associated with a specific user
     * @param user the user whose interactions to delete
     */
    void deleteByUser(User user);
    
    /**
     * Delete all interactions involving products from a specific seller
     * @param seller the seller whose product interactions to delete
     */
    void deleteByProductSeller(User seller);

    /**
     * Get all interactions with products offered by a specific seller
     * @param seller the seller
     * @return list of interactions with this seller's products
     */
    List<UserInteraction> findByProductSeller(User seller);

    /**
     * Deletes all interactions linked to a specific product.
     * @param product the product to clean up
     */
    void deleteByProduct(Product product);

    /**
     * Deletes a specific interaction (like a Favorite/LIKE) for a user and product.
     */
    void deleteByUserAndProductAndType(User user, Product product, UserInteraction.InteractionType type);
}