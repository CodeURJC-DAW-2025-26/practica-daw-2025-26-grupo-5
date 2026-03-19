package es.stilnovo.library.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import es.stilnovo.library.model.Inquiry;
import es.stilnovo.library.model.Product;
import es.stilnovo.library.model.User;
import es.stilnovo.library.repository.InquiryRepository;
import es.stilnovo.library.repository.ProductRepository;
import es.stilnovo.library.repository.UserRepository;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import jakarta.transaction.Transactional;

/**
 * InquiryService for managing buyer-to-seller inquiries
 * Handles creation, retrieval, and management of product inquiries
 */
@Service
public class InquiryService {

    @Autowired
    private InquiryRepository inquiryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Gets the most recent inquiry from a specific buyer for a specific product.
     * Used for cooldown validation to prevent spam.
     * 
     * @param buyerId   The ID of the buyer
     * @param productId The ID of the product
     * @return Optional containing the last inquiry, or empty if none found
     */
    @Transactional
    public Optional<Inquiry> getLastInquiry(Long buyerId, Long productId) {
        // STEP 1: Load buyer and product entities from database
        User buyer = userRepository.findById(buyerId).orElse(null);
        Product product = productRepository.findById(productId).orElse(null);

        // STEP 2: Return empty if either entity doesn't exist
        if (buyer == null || product == null) {
            return Optional.empty();
        }

        // STEP 3: Query most recent inquiry for spam/cooldown detection
        Inquiry lastInquiry = inquiryRepository.findTopByBuyerAndProductOrderByCreatedAtDesc(buyer, product);
        return Optional.ofNullable(lastInquiry);
    }

    /**
     * Saves a new inquiry to the database.
     * 
     * @param inquiry The inquiry to save
     * @return The saved inquiry with generated ID
     */
    @Transactional
    public Inquiry saveInquiry(Inquiry inquiry) {
        return inquiryRepository.save(inquiry);
    }

    @Transactional
    public Inquiry findById(Long id) {
        return inquiryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Inquiry not found"));
    }

    /**
     * Creates and saves a new inquiry with the given parameters.
     * 
     * @param productId   The product ID
     * @param productName The product name
     * @param sellerId    The seller's user ID
     * @param sellerEmail The seller's email
     * @param buyerId     The buyer's user ID
     * @param buyerName   The buyer's name
     * @param buyerEmail  The buyer's email
     * @param buyerPhone  The buyer's phone (optional)
     * @param inquiryType The type of inquiry
     * @param message     The inquiry message
     * @param status      The status (e.g., "SENT", "FAILED_MAIL")
     * @return The saved inquiry
     */
    @Transactional
    public Inquiry createInquiry(Long productId, String productName, Long sellerId,
            String sellerEmail, Long buyerId, String buyerName,
            String buyerEmail, String buyerPhone, String inquiryType,
            String message, String status) {
        // STEP 1: Create new inquiry entity
        Inquiry inquiry = new Inquiry();

        // STEP 2: Fetch related entities (product and buyer) from database
        Product product = productRepository.findById(productId).orElse(null);
        User buyer = userRepository.findById(buyerId).orElse(null);

        // STEP 3: Populate inquiry with all provided data
        inquiry.setProduct(product);
        inquiry.setBuyer(buyer);
        inquiry.setProductName(productName);
        inquiry.setSellerEmail(sellerEmail);
        inquiry.setBuyerName(buyerName);
        inquiry.setBuyerEmail(buyerEmail);
        inquiry.setBuyerPhone(buyerPhone);
        inquiry.setInquiryType(inquiryType);
        inquiry.setMessage(message);
        inquiry.setCreatedAt(LocalDateTime.now());
        inquiry.setStatus(status);

        // STEP 4: Persist inquiry to database and return
        return inquiryRepository.save(inquiry);
    }

    @Transactional
    public void deleteInquiry(Inquiry inquiry) {
        if (inquiry != null) {
            inquiryRepository.delete(inquiry);
        }
    }
}
