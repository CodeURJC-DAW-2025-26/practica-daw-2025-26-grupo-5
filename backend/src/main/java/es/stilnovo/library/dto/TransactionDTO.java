package es.stilnovo.library.dto;

import java.time.LocalDateTime;

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
