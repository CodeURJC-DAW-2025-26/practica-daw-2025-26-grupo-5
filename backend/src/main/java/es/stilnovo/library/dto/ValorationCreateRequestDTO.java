package es.stilnovo.library.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO: Request body for creating or updating a valoration (review/rating).
 * 
 * This record is used ONLY for incoming POST/PATCH requests, not for responses.
 * Contains only the fields that clients should provide when submitting reviews.
 * Response uses ValorationDTO which includes seller info and IDs.
 * 
 * Validation:
 * - rating: Must be between 1-5 stars
 * - comment: Required, non-empty text
 * - transactionId: The transaction being rated
 */
@Schema(description = "Request DTO for creating or updating a valoration (review)")
public record ValorationCreateRequestDTO(
        
        @Schema(description = "Rating given by the buyer (1-5 stars)", example = "5")
        @Min(value = 1, message = "Rating must be at least 1")
        @Max(value = 5, message = "Rating must be at most 5")
        int rating,
        
        @Schema(description = "Review comment from the buyer", example = "Product arrived in perfect condition and very fast.")
        @NotBlank(message = "Comment cannot be blank")
        String comment,
        
        @Schema(description = "ID of the transaction this rating is for", example = "1001")
        Long transactionId) {
}
