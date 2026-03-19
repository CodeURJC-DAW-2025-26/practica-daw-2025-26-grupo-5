package es.stilnovo.library.model;

import jakarta.persistence.*;
import java.util.List;

import es.stilnovo.library.util.NumberFormattingUtils;

/**
 * Product: Represents an item/product listed for sale
 * 
 * This entity manages:
 * - Product details (name, description, price, category, location)
 * - Product status (Active, Inactive, or Sold)
 * - Product image and media
 * - Seller information (who is selling this item)
 * - User interactions tracking (analytics, recommendations)
 * - Purchase availability checks
 * 
 * Relationships:
 * - ManyToOne: User (the seller)
 * - OneToOne: Image (single product image)
 * - OneToMany: UserInteraction (views, likes, purchases)
 * 
 * Transient field 'favorite' is used by UI for real-time display
 * Used by: Controllers, Services, Repositories
 */
@Entity(name = "ProductTable")
public class Product {

    /** Unique identifier for this product */
    /** Unique identifier for this product */
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    /** Product name/title */
    private String name;

    /** Category of product (Electronics, Books, etc.) */
    private String category;

    /** Price of the product */
    private double price;

    /** Location where product is available */
    private String location;

    /** Detailed product description */
    @Column(columnDefinition = "TEXT")
    private String description;

    /** Product status: Active, Inactive, or Sold */
    private String status; // active, inactive

    /** Product primary image. */
    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "image_id")
    private Image image;

    /** The seller (User) who owns this product */
    @ManyToOne
    private User seller; // product owner

    /** User interactions with this product (for analytics/recommendations) */
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserInteraction> interactions;

    /**
     * Temporary flag: whether current user marked this as favorite (not saved to
     * DB)
     */
    @Transient
    private boolean favorite; // Temporary flag for the view

    /** Get/Set favorite status for UI display */
    public boolean isFavorite() {
        return favorite;
    }

    public void setFavorite(boolean favorite) {
        this.favorite = favorite;
    }

    // CONSTRUCTORS
    public Product() {
    }

    public Product(String name, String category, double price, String description, String status, User seller,
            String location) {
        this.name = name;
        this.category = category;
        this.price = price;
        this.description = description;
        this.status = status;
        this.seller = seller;
        this.location = location;
    }

    // GETTERS AND SETTERS
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public String getFormattedPrice() {
        return NumberFormattingUtils.formatMoney(this.price);
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Image getImage() {
        return image;
    }

    public void setImage(Image image) {
        this.image = image;
    }

    public User getSeller() {
        return seller;
    }

    public void setSeller(User seller) {
        this.seller = seller;
    }

    public List<UserInteraction> getInteractions() {
        return interactions;
    }

    public void setInteractions(List<UserInteraction> interactions) {
        this.interactions = interactions;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    // Inside Product.java class

    /**
     * Checks if the product is active.
     * Used by Mustache templates via {{isActive}}
     */
    public boolean getIsActive() {
        return "Active".equalsIgnoreCase(this.status);
    }

    /**
     * Checks if the product is blocked.
     * Used by Mustache templates via {{isBlocked}}
     */
    public boolean getIsBlocked() {
        return "Blocked".equalsIgnoreCase(this.status);
    }

    /**
     * Checks if the product is sold.
     * Used by Mustache templates via {{isSold}}
     */
    public boolean getIsSold() {
        return "Sold".equalsIgnoreCase(this.status);
    }

}