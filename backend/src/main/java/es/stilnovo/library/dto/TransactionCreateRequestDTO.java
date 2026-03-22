package es.stilnovo.library.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * DTO: Data Transfer Object - Converts to/from JSON in REST API responses.
 * 
 * This record is ONLY used in REST Controllers as request/response bodies.
 * Record automatically generates: no-arg constructor, getters, toString, equals, hashCode.
 * Encapsulates purchase initiation parameters with validation constraints.
 * 
 * Request body for initiating a new transaction/purchase.
 */
@Schema(description = "Request body for initiating a new transaction/purchase")
public record TransactionCreateRequestDTO(
        
        @NotNull
        @Positive
        @Schema(description = "ID of the product being purchased", example = "15")
        Long productId
) {
}