package es.stilnovo.library.dto;

/**
 * Request body for initiating a new transaction/purchase.
 * 
 * @param productId ID of the product being purchased
 */
public record TransactionCreateRequestDTO(
        Long productId
) {
}
