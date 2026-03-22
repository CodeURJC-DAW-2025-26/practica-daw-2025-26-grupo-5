package es.stilnovo.library.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import io.swagger.v3.oas.annotations.media.Schema;

/**
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