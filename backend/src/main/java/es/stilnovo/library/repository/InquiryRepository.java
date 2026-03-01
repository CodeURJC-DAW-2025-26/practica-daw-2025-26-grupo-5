package es.stilnovo.library.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import es.stilnovo.library.model.Inquiry;
import es.stilnovo.library.model.Product;
import es.stilnovo.library.model.User;

package es.stilnovo.library.repository;

import org.springframework.data.jpa.repository.JpaRepository;

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
}
