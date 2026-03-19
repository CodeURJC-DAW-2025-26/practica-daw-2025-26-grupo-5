package es.stilnovo.library.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

/**
 * Inquiry: Represents a customer inquiry/question about a product.
 * Allows buyers to contact sellers before purchase.
 * 
 * This entity manages:
 * - Buyer questions/inquiries about products
 * - Communication between buyers and sellers
 * - Inquiry status tracking (Open, Answered, Closed)
 * - Message content and inquiry type
 * 
 * Relationships:
 * - ManyToOne: Product (the product being inquired about)
 * - ManyToOne: User buyer (who is asking)
 * - Seller accessible through Product.getSeller()
 * 
 * Used by: NotificationController, InquiryService, ContactSellerController
 */
@Entity(name = "InquiryTable")
public class Inquiry {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    /** The product this inquiry is about */
    @ManyToOne
    private Product product;

    /** The buyer asking the question */
    @ManyToOne
    private User buyer;

    /** Name of the product (cached from product object) */
    private String productName;

    /** Email of the seller (cached from product.seller) */
    private String sellerEmail;

    /** Name of the buyer (cached from buyer object) */
    private String buyerName;

    /** Email of the buyer (cached from buyer object) */
    private String buyerEmail;

    /** Phone number of the buyer */
    private String buyerPhone;

    /** Type of inquiry (question, offer, complaint, etc.) */
    private String inquiryType;

    @Column(columnDefinition = "TEXT")
    private String message;

    /** When the inquiry was created */
    private LocalDateTime createdAt;

    /** Status of inquiry: Open, Answered, Closed, etc. */
    private String status;

    public Long getId() {
        return id;
    }

    /** Get the product this inquiry is about */
    public Product getProduct() {
        return product;
    }

    /** Set the product this inquiry is about */
    public void setProduct(Product product) {
        this.product = product;
    }

    /** Get the buyer who made this inquiry */
    public User getBuyer() {
        return buyer;
    }

    /** Set the buyer who made this inquiry */
    public void setBuyer(User buyer) {
        this.buyer = buyer;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getSellerEmail() {
        return sellerEmail;
    }

    public void setSellerEmail(String sellerEmail) {
        this.sellerEmail = sellerEmail;
    }

    public String getBuyerName() {
        return buyerName;
    }

    public void setBuyerName(String buyerName) {
        this.buyerName = buyerName;
    }

    public String getBuyerEmail() {
        return buyerEmail;
    }

    public void setBuyerEmail(String buyerEmail) {
        this.buyerEmail = buyerEmail;
    }

    public String getBuyerPhone() {
        return buyerPhone;
    }

    public void setBuyerPhone(String buyerPhone) {
        this.buyerPhone = buyerPhone;
    }

    public String getInquiryType() {
        return inquiryType;
    }

    public void setInquiryType(String inquiryType) {
        this.inquiryType = inquiryType;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
