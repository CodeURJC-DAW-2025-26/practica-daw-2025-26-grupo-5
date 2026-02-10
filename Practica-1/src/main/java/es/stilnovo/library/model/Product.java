package es.stilnovo.library.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String name;
    private String category;
    private double price;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String status; // active, inactive

    /**
     * One-to-Many relationship with the Image entity.
     * We use CascadeType.ALL to save images automatically when saving the product.
     */
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Image> images = new ArrayList<>();

    public Product() {}

    public Product(String name, String category, double price, String description, String status) {
        this.name = name;
        this.category = category;
        this.price = price;
        this.description = description;
        this.status = status;
    }

    /**
     * Method to add an Image entity to the product's gallery.
     * Renamed to 'addImagen' to match your DataBaseInitializer call.
     */
    public void addImagen(Image image) {
        if (this.images.size() < 4) {
            this.images.add(image);
        }
    }

    // --- GETTERS AND SETTERS ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public List<Image> getImages() { return images; }
    public void setImages(List<Image> images) {
        if (images.size() <= 4) {
            this.images = images;
        }
    }
}