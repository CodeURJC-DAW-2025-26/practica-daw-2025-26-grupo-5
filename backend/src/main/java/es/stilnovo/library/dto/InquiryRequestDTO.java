package es.stilnovo.library.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * DTO: Data Transfer Object - Converts to/from JSON in REST API responses.
 * 
 * This record is ONLY used in REST Controllers as request/response bodies.
 * Record automatically generates: no-arg constructor, getters, toString, equals, hashCode.
 * Encapsulates customer inquiry creation parameters with type safety.
 * 
 * Request body for creating a new customer inquiry.
 */
@Schema(description = "Request body for creating a new customer inquiry")
public record InquiryRequestDTO(
        
        @Schema(description = "ID of the product being inquired about", example = "12")
        Long productId,
        
        @Schema(description = "Customer's phone number", example = "+34611223344")
        String phone,
        
        @Schema(description = "Type or category of the inquiry", example = "Product status")
        String type,
        
        @Schema(description = "The inquiry message content", example = "Does the screen have any scratches?")
        String message
) {
}