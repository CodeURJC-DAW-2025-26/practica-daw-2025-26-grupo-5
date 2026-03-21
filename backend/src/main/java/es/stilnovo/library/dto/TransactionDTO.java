package es.stilnovo.library.dto;

import java.time.LocalDateTime;

/**
 * Represents a completed transaction between seller and buyer.
 * 
 * @param transactionId Unique transaction identifier
 * @param finalPrice Final amount paid for the transaction
 * @param createdAt Timestamp when the transaction was created
 * @param formattedDate Human-readable formatted date of the transaction
 * @param transactionStatus Current status of the transaction (e.g., completed, pending delivery)
 * @param rated Boolean indicating if the buyer has rated this transaction
 * @param stars Rating given by the buyer (1-5 stars)
 * @param seller Information about the seller in this transaction
 * @param buyer Information about the buyer in this transaction
 * @param product The product that was sold in this transaction
 */
public record TransactionDTO(
        Long transactionId,
        double finalPrice,
        LocalDateTime createdAt,
        String formattedDate,     
        String transactionStatus,
        boolean rated,            
        Integer stars,
        UserDTO seller,           
        UserDTO buyer,            
        ProductDTO product 
) {
}
