package es.stilnovo.library.dto;

import es.stilnovo.library.model.Valoration;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Represents a product rating and review from a buyer.
 */
@Schema(description = "Represents a product rating and review from a buyer")
public record ValorationDTO(
                
                @Schema(description = "Unique valoration identifier", example = "305")
                Long id,
                
                @Schema(description = "Rating given by the buyer (1-5 stars)", example = "5")
                int stars,
                
                @Schema(description = "Review comment from the buyer", example = "Product arrived in perfect condition and very fast. Recommended seller.")
                String comment,
                
                @Schema(description = "Name of the buyer who provided the rating", example = "Carlos Garcia")
                String buyerName,
                
                @Schema(description = "ID of the transaction this rating is for", example = "1001")
                Long transactionId) {

        public ValorationDTO(Valoration valoration) {
                this(
                        valoration.getId(),
                        valoration.getStars(),
                        valoration.getComment(),
                        valoration.getBuyer().getName(),
                        valoration.getTransaction().getTransactionId()
                );
        }
}