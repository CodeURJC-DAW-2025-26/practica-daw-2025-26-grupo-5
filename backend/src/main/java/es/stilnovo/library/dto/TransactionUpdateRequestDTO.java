package es.stilnovo.library.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * DTO: Data Transfer Object - Converts to/from JSON in REST API responses.
 * 
 * This record is ONLY used in REST Controllers as request/response bodies.
 * Record automatically generates: no-arg constructor, getters, toString, equals, hashCode.
 * Enforces validation constraints for transaction state modifications via API.
 * 
 * Request body for updating an existing transaction.
 * Only the fields that are allowed to be modified should be included.
 */
@Schema(description = "Request body for updating an existing transaction. Only the fields that are allowed to be modified should be included.")
public record TransactionUpdateRequestDTO(
        
        @NotNull(message = "Transaction status cannot be null")
        @Schema(description = "Current status of the transaction", example = "shipped")
        String transactionStatus,
        
        @Schema(description = "Boolean indicating if the buyer has rated this transaction", example = "true")
        boolean rated,
        
        @Min(value = 1, message = "Stars must be at least 1")
        @Max(value = 5, message = "Stars cannot be more than 5")
        @Schema(description = "Rating given by the buyer (1-5 stars)", example = "4")
        Integer stars
) {
}