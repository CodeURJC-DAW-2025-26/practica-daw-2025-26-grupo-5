package es.stilnovo.library.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import es.stilnovo.library.model.Inquiry;
import es.stilnovo.library.model.Product;
import es.stilnovo.library.model.User;

/**
 * InquiryRepository interface for Inquiry entity database operations
 * Manages buyer-to-seller contact inquiries and messages
 */
public interface InquiryRepository extends JpaRepository<Inquiry, Long> {
    /**
     * Find the most recent inquiry from a buyer about a product
     * @param buyer the buyer user
     * @param product the product being inquired about
     * @return the most recent inquiry, or null if none exists
     */
    Inquiry findTopByBuyerAndProductOrderByCreatedAtDesc(User buyer, Product product);
    
    // Find inquiries sent by a specific buyer
    List<Inquiry> findByBuyer(User buyer);
    Page<Inquiry> findByBuyer(User buyer, Pageable pageable);
    
    // Find inquiries related to a list of products
    List<Inquiry> findByProductIn(List<Product> products);
        
    // Direct delete by product
    void deleteByProductIn(List<Product> products);

    void deleteByProduct(Product product);
}