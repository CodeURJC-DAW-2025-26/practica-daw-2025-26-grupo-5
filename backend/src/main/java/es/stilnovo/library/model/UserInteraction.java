package es.stilnovo.library.model;

import jakarta.persistence.*;
//import java.time.LocalDateTime;

/**
 * Tracks user interactions with products (views, likes, purchases).
 * Used for analytics and generating product recommendations.
 */
@Entity
@Table(name = "user_interactions")
public class UserInteraction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The user who performed the interaction */
    @ManyToOne
    @JoinColumn(name = "user_id") 
    private User user;

    /** The product being interacted with */
    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    /** Type of interaction: VIEW, LIKE, or BUY */
    @Enumerated(EnumType.STRING)
    private InteractionType type; // VIEW, CLICK, BUY

    //private LocalDateTime timestamp;

    public UserInteraction() {}

    /** Create interaction record */
    public UserInteraction(User user, Product product, InteractionType type) {
        this.user = user;
        this.product = product;
        this.type = type;
        //this.timestamp = LocalDateTime.now();
    }

    // Getters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public InteractionType getType() { return type; }
    public void setType(InteractionType type) { this.type = type; }
    
    // Enum for interaction types
    public enum InteractionType {
        VIEW, LIKE, BUY
    }
}