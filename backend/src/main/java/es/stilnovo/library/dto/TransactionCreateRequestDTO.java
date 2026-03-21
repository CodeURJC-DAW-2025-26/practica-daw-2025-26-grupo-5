package es.stilnovo.library.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * Request body for initiating a new transaction/purchase.
 * 
 * @param productId ID of the product being purchased
 */
public record TransactionCreateRequestDTO(
        @NotNull
        @Positive
        Long productId
) {
}
