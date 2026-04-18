package es.stilnovo.library.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;

import es.stilnovo.library.model.Product;
import es.stilnovo.library.model.User;


/**
 * ProductRepository interface for Product entity database operations
 * Provides CRUD and custom search queries for product management
 */
public interface ProductRepository extends JpaRepository<Product, Long> {
    /**
     * Get all products offered by a specific seller
     * @param seller the seller user
     * @return list of products by this seller
     */
    List<Product> findBySeller(User seller);

    /**
     * Count the number of products offered by a seller
     * @param seller the seller user
     * @return count of seller's products
     */
    long countBySeller(User seller);

    /**
     * Search products by name (case-insensitive)
     * @param name product name or partial name
     * @return list of matching products
     */
    List<Product> findByNameContainingIgnoreCase(String name);

    /**
     * Filter products by category (case-insensitive)
     * @param category product category
     * @return list of products in this category
     */
    List<Product> findByCategoryContainingIgnoreCase(String category);

    /**
     * Get products by seller username and status
     * @param username the seller's username
     * @param status product status (Active, Sold, Inactive)
     * @return list of products matching criteria
     */
    List<Product> findBySellerNameAndStatus(String username, String status);

    /**
     * Get 10 most recent products
     * @return list of latest products
     */
    List<Product> findTop10ByOrderByIdDesc();
    
    /**
     * Find recommended products based on user interaction history
     * Scores categories by user interactions (BUY=5, LIKE=3, VIEW=1)
     * Returns products from preferred categories excluding user's own products and sold items
     * @param userId the user to get recommendations for
     * @return list of 4 recommended products
     */
    @Query(value = """
        SELECT p.* FROM product_table p
        JOIN (
            SELECT 
                prod.category as cat_name, 
                SUM(CASE 
                    WHEN ui.type = 'BUY' THEN 5 
                    WHEN ui.type = 'LIKE' THEN 3 
                    WHEN ui.type = 'VIEW' THEN 1 
                    ELSE 0 END) as score
            FROM user_interactions ui
            JOIN product_table prod ON ui.product_id = prod.id
            WHERE ui.user_id = :userId
            GROUP BY prod.category
        ) as prefs ON p.category = prefs.cat_name
        WHERE p.seller_user_id != :userId 
        AND p.status != 'Sold'
        ORDER BY prefs.score DESC, p.id DESC
        LIMIT 4
        """, nativeQuery = true)
    List<Product> findRecommendedProducts(@Param("userId") Long userId);

    // Look for products in a category that the user hasn't interacted with yet 
    @Query("SELECT p FROM ProductTable p WHERE p.category = :category AND p.status != 'Sold' AND p.id NOT IN (SELECT t.product.id FROM TransactionTable t WHERE t.buyer.userId = :userId)")
    List<Product> findRecommendedProducts(@Param("category") String category, @Param("userId") Long userId, Pageable pageable);
    
    /**
     * Get all products with a specific status
     * @param status product status
     * @return list of products with this status
     */
    List<Product> findByStatus(String status);

    Page<Product> findByStatusIgnoreCase(String status, Pageable pageable);

    Page<Product> findByStatusIgnoreCaseAndNameContainingIgnoreCase(String status, String name, Pageable pageable);

    Page<Product> findByStatusIgnoreCaseAndCategoryContainingIgnoreCase(String status, String category, Pageable pageable);

    Page<Product> findByStatusIgnoreCaseAndIdNotIn(String status, List<Long> excludedIds, Pageable pageable);

    /**
     * Get paginated products by status
     * @param status product status
     * @param pageable pagination parameters
     * @return page of products with this status
     */
    Page<Product> findByStatus(String status, Pageable pageable);

}