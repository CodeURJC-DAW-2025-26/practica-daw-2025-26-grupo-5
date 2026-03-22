package es.stilnovo.library.dto;

import org.springframework.web.multipart.MultipartFile;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * DTO: Data Transfer Object - Converts to/from JSON in REST API responses.
 * 
 * This class is ONLY used in REST Controllers as request/response bodies.
 * Handles file uploads (MultipartFile) for product image attachment.
 * Separates API input validation from business logic for clean architecture.
 * 
 * Request body for creating or updating product listings with file upload capability.
 * Contains product details and an optional image file to be uploaded.
 */
@Schema(description = "Request body for creating or updating product listings with file upload capability")
public class ProductWriteRequestDTO {

    @Schema(description = "Product name or title", example = "Laptop Computer")
    private String name;
    
    @Schema(description = "Product category classification", example = "Electronics")
    private String category;
    
    @Schema(description = "Current selling price of the product", example = "450.00")
    private Double price;
    
    @Schema(description = "Geographic location where the product is listed", example = "Barcelona")
    private String location;
    
    @Schema(description = "Detailed product description", example = "Laptop with 16GB RAM and i7 processor.")
    private String description;
    
    @Schema(description = "Product status (e.g., available, sold, inactive)", example = "available")
    private String status;
    
    @Schema(description = "Product image file to be uploaded")
    private MultipartFile file;

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

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
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

    public MultipartFile getFile() {
        return file;
    }

    public void setFile(MultipartFile file) {
        this.file = file;
    }
}