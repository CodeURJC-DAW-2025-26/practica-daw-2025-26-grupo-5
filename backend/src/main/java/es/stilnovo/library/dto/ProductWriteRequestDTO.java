package es.stilnovo.library.dto;

import org.springframework.web.multipart.MultipartFile;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Request body for creating or updating product listings with file upload capability.
 * Contains product details and an optional image file to be uploaded.
 */
@Schema(description = "Request body for creating or updating product listings with file upload capability")
public class ProductWriteRequestDTO {

    @Schema(description = "Product name or title", example = "Ordenador Portátil")
    private String name;
    
    @Schema(description = "Product category classification", example = "Electrónica")
    private String category;
    
    @Schema(description = "Current selling price of the product", example = "450.00")
    private Double price;
    
    @Schema(description = "Geographic location where the product is listed", example = "Valencia")
    private String location;
    
    @Schema(description = "Detailed product description", example = "Portátil con 16GB de RAM y procesador i7.")
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