package es.stilnovo.library.dto;

import java.time.LocalDateTime;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Represents a customer inquiry about a product with contact and product information.
 */
@Schema(description = "Represents a customer inquiry about a product with contact and product information")
public record InquiryDTO(
        
        @Schema(description = "Unique identifier for the inquiry", example = "50")
        Long id,
        
        @Schema(description = "Name of the product being inquired about", example = "Cámara Réflex Canon")
        String productName,
        
        @Schema(description = "Email address of the product seller", example = "vendedor@example.com")
        String sellerEmail,
        
        @Schema(description = "Name of the customer making the inquiry", example = "Ana López")
        String buyerName,
        
        @Schema(description = "Email address of the customer", example = "ana.lopez@example.com")
        String buyerEmail,
        
        @Schema(description = "Phone number of the customer", example = "+34600123456")
        String buyerPhone,
        
        @Schema(description = "Type or category of the inquiry", example = "Duda sobre el envío")
        String inquiryType,
        
        @NotNull(message = "Message cannot be null")
        @Size(min = 5, max = 1000, message = "Message must be between 5 and 1000 characters")
        @Schema(description = "The inquiry message content", example = "¿Haces envíos a Canarias?")
        String message,
        
        @Schema(description = "Timestamp when the inquiry was created", example = "2024-03-24T10:15:30")
        LocalDateTime createdAt,
        
        @NotNull(message = "Status cannot be null")
        @Schema(description = "Current status of the inquiry (e.g., pending, answered)", example = "pending")
        String status,
        
        @Schema(description = "The product being inquired about")
        ProductDTO product,
        
        @Schema(description = "The customer making the inquiry")
        UserDTO buyer
) {
}