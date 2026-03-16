package es.stilnovo.library.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Transaction: Represents a completed sale between buyer and seller
 * 
 * This entity manages:
 * - Transaction parties (buyer, seller identities)
 * - Transaction details (product, price, date)
 * - Transaction status (Pending, Completed, Cancelled, Returned)
 * - Rating/feedback system (post-purchase buyer feedback)
 * - Financial record keeping
 * 
 * Relationships:
 * - ManyToOne: User seller (who is selling)
 * - ManyToOne: User buyer (who is purchasing)
 * - OneToOne: Product (item being sold)
 * 
 * Transient field 'rated' tracks if buyer has reviewed the seller
 * Used by: Services for order processing, Controllers for transaction display
 */
@Entity(name = "TransactionTable")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long transactionId;

    /** The seller in this transaction */
    @ManyToOne
    private User seller;

    /** The buyer in this transaction */
    @ManyToOne
    private User buyer;

    /**
    * Product being sold in this transaction.
    * cascade = CascadeType.MERGE ensures product status updates are saved correctly.
    */
    @OneToOne(cascade = CascadeType.MERGE)
    private Product product;

    /** Final price paid by buyer */
    private double finalPrice;
    
    /** When transaction was created */
    private LocalDateTime createdAt;
    
    /** Transaction status: Pending, Completed, Cancelled, etc. */
    private String transactionStatus;

    // Rating integration
    /** Whether the buyer has rated the seller for this transaction */
    @Transient
    private boolean rated;
    
    /** Star rating given by buyer to seller (1-5 stars) */
    private Integer stars;

    /** Default constructor for JPA */
    public Transaction() {}

    /** Create transaction for a product purchase */
    public Transaction(User seller, User buyer, Product product, String status) {
        this.seller = seller;
        this.buyer = buyer;
        this.product = product;
        this.finalPrice = product.getPrice();
        this.transactionStatus = status;
        this.createdAt = LocalDateTime.now();
        this.rated = false;
    }

    // --- GETTERS AND SETTERS ---
    
    public Long getTransactionId() { return transactionId; }
    public void setTransactionId(Long transactionId) { this.transactionId = transactionId; }

    public User getSeller() { return seller; }
    public void setSeller(User seller) { this.seller = seller; }

    public User getBuyer() { return buyer; }
    public void setBuyer(User buyer) { this.buyer = buyer; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public double getFinalPrice() { return finalPrice; }
    public void setFinalPrice(double finalPrice) { this.finalPrice = finalPrice; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getTransactionStatus() { return transactionStatus; }
    public void setTransactionStatus(String transactionStatus) { this.transactionStatus = transactionStatus; }

    public boolean isRated() { return rated; }
    public void setRated(boolean rated) { this.rated = rated; }

    public Integer getStars() { return stars; }
    public void setStars(Integer stars) { this.stars = stars; }

    public String getFormattedDate() {
    if (this.createdAt == null) return "";
    
    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        return this.createdAt.format(formatter);
    }
}