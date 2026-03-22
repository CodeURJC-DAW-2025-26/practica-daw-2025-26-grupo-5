package es.stilnovo.library.dto;

import java.time.LocalDateTime;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Represents a completed transaction between seller and buyer.
 */
@Schema(description = "Represents a completed transaction between seller and buyer")
public record TransactionDTO(
        
        @Schema(description = "Unique transaction identifier", example = "1001")
        Long transactionId,
        
        @Schema(description = "Final amount paid for the transaction", example = "150.75")
        double finalPrice,
        
        @Schema(description = "Timestamp when the transaction was created", example = "2024-05-12T14:30:00")
        LocalDateTime createdAt,
        
        @Schema(description = "Human-readable formatted date of the transaction", example = "12 May 2024")
        String formattedDate,     
        
        @Schema(description = "Current status of the transaction (e.g., completed, pending delivery)", example = "completed")
        String transactionStatus,
        
        @Schema(description = "Boolean indicating if the buyer has rated this transaction", example = "true")
        boolean rated,            
        
        @Schema(description = "Rating given by the buyer (1-5 stars)", example = "5")
        Integer stars,
        
        @Schema(description = "Information about the seller in this transaction")
        UserDTO seller,           
        
        @Schema(description = "Information about the buyer in this transaction")
        UserDTO buyer,            
        
        @Schema(description = "The product that was sold in this transaction")
        ProductDTO product 
) {
}