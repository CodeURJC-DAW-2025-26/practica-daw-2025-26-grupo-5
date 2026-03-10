package es.stilnovo.library.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

/**
 * Valoration: Represents a seller review/rating from a buyer
 * 
 * This entity manages:
 * - Star rating (1-5 scale from buyer to seller)
 * - Written review/comment from buyer
 * - Link to completed transaction (proof of purchase)
 * - Seller and buyer identification
 * 
 * Relationships:
 * - OneToOne: Transaction (the completed sale being reviewed)
 * - ManyToOne: User seller (receiving the rating)
 * - ManyToOne: User buyer (giving the rating)
 * 
 * Used by:
 * - ValorationService for rating management
 * - Controllers for valoration display and creation
 * - Recommendation engine for seller reputation
 * - Analytics for marketplace trust metrics
 */
@Entity
@Table(name = "ValorationTable")
public class Valoration {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private int stars; // Numeric score (1 to 5) 

    @Column(columnDefinition = "TEXT")
    private String comment; // Subjective review 

    @OneToOne
    private Transaction transaction; // Strictly linked to a completed transaction

    @ManyToOne
    private User seller; // The user receiving the rating

    @ManyToOne
    private User buyer; // The user giving the rating

    public Valoration() {}

    public Valoration(Transaction transaction, int stars, String comment) {
        this.transaction = transaction;
        this.stars = stars;
        this.comment = comment;
        this.seller = transaction.getSeller();
        this.buyer = transaction.getBuyer();
    }

    // --- GETTERS AND SETTERS ---
    public Long getId() { return id; }
    public int getStars() { return stars; }
    public void setStars(int stars) { this.stars = stars; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public Transaction getTransaction() { return transaction; }
    public User getSeller() { return seller; }
    public User getBuyer() { return buyer; }
}