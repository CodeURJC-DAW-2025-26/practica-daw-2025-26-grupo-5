package es.stilnovo.library.dto;

import java.time.LocalDateTime;

/**
 * Represents a customer inquiry about a product with contact and product information.
 * 
 * @param id Unique identifier for the inquiry
 * @param productName Name of the product being inquired about
 * @param sellerEmail Email address of the product seller
 * @param buyerName Name of the customer making the inquiry
 * @param buyerEmail Email address of the customer
 * @param buyerPhone Phone number of the customer
 * @param inquiryType Type or category of the inquiry
 * @param message The inquiry message content
 * @param createdAt Timestamp when the inquiry was created
 * @param status Current status of the inquiry (e.g., pending, answered)
 * @param product The product being inquired about
 * @param buyer The customer making the inquiry
 */
public record InquiryDTO(
        Long id,
        String productName,
        String sellerEmail,
        String buyerName,
        String buyerEmail,
        String buyerPhone,
        String inquiryType,
        String message,
        LocalDateTime createdAt,
        String status,
        
        ProductDTO product,
        UserDTO buyer
) {
}