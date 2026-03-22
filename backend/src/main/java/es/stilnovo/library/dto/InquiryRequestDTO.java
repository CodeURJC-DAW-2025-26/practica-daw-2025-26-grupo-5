package es.stilnovo.library.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Request body for creating a new customer inquiry.
 */
@Schema(description = "Request body for creating a new customer inquiry")
public record InquiryRequestDTO(
        
        @Schema(description = "ID of the product being inquired about", example = "12")
        Long productId,
        
        @Schema(description = "Customer's phone number", example = "+34611223344")
        String phone,
        
        @Schema(description = "Type or category of the inquiry", example = "Estado del producto")
        String type,
        
        @Schema(description = "The inquiry message content", example = "¿Tiene algún rasguño la pantalla?")
        String message
) {
}