package es.stilnovo.library.dto;

import es.stilnovo.library.model.Valoration;

/**
 * Represents a product rating and review from a buyer.
 * 
 * @param id Unique valoration identifier
 * @param stars Rating given by the buyer (1-5 stars)
 * @param comment Review comment from the buyer
 * @param buyerName Name of the buyer who provided the rating
 * @param transactionId ID of the transaction this rating is for
 */
public record ValorationDTO(
                Long id,
                int stars,
                String comment,
                String buyerName,
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