package es.stilnovo.library.dto;

import java.time.LocalDateTime;

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