package es.stilnovo.library.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * Request body for updating an existing transaction.
 * Only the fields that are allowed to be modified should be included.
 */
public record TransactionUpdateRequestDTO(
        @NotNull(message = "Transaction status cannot be null")
        String transactionStatus,
        
        boolean rated,
        
        @Min(value = 1, message = "Stars must be at least 1")
        @Max(value = 5, message = "Stars cannot be more than 5")
        Integer stars
) {
}