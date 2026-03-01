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
     * @param buyerId The ID of the buyer
     * @param productId The ID of the product
     * @return Optional containing the last inquiry, or empty if none found
     */
    public Optional<Inquiry> getLastInquiry(Long buyerId, Long productId) {
        User buyer = userRepository.findById(buyerId).orElse(null);
        Product product = productRepository.findById(productId).orElse(null);
        
        if (buyer == null || product == null) {
            return Optional.empty();
        }
        
        Inquiry lastInquiry = inquiryRepository.findTopByBuyerAndProductOrderByCreatedAtDesc(buyer, product);
        return Optional.ofNullable(lastInquiry);
    }

    /**
     * Saves a new inquiry to the database.
     * @param inquiry The inquiry to save
     * @return The saved inquiry with generated ID
     */
    public Inquiry saveInquiry(Inquiry inquiry) {
        return inquiryRepository.save(inquiry);
    }

    /**
     * Creates and saves a new inquiry with the given parameters.
     * @param productId The product ID
     * @param productName The product name
     * @param sellerId The seller's user ID
     * @param sellerEmail The seller's email
     * @param buyerId The buyer's user ID
     * @param buyerName The buyer's name
     * @param buyerEmail The buyer's email
     * @param buyerPhone The buyer's phone (optional)
     * @param inquiryType The type of inquiry
     * @param message The inquiry message
     * @param status The status (e.g., "SENT", "FAILED_MAIL")
     * @return The saved inquiry
     */
    public Inquiry createInquiry(Long productId, String productName, Long sellerId, 
                                    String sellerEmail, Long buyerId, String buyerName, 
                                    String buyerEmail, String buyerPhone, String inquiryType, 
                                    String message, String status) {
        Inquiry inquiry = new Inquiry();
        
        Product product = productRepository.findById(productId).orElse(null);
        User buyer = userRepository.findById(buyerId).orElse(null);
        
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
        
        return inquiryRepository.save(inquiry);
    }
}
