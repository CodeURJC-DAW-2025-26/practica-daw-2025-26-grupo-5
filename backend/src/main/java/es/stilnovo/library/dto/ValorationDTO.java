package es.stilnovo.library.dto;

import es.stilnovo.library.model.Valoration;

public class ValorationDTO {
        private Long id;
        private int stars;
        private String comment;
        private String buyerName; // Solo el nombre, no todo el objeto User
        private Long transactionId;

        // Constructores, Getters y Setters
        public ValorationDTO(Valoration v) {
                this.id = v.getId();
                this.stars = v.getStars();
                this.comment = v.getComment();
                this.buyerName = v.getBuyer().getName();
                this.transactionId = v.getTransaction().getId();
        }
}