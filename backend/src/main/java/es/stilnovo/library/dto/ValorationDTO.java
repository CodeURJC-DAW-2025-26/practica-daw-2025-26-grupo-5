package es.stilnovo.library.dto;

import es.stilnovo.library.model.Valoration;

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