package es.stilnovo.library.dto;

import org.springframework.web.multipart.MultipartFile;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Request body for administrators to create a product on behalf of a seller.
 */
@Schema(description = "Request body for administrators to create a product on behalf of a seller")
public record AdminProductCreateRequestDTO(
        
        @Schema(description = "ID of the seller who will own the product", example = "1")
        Long sellerId,
        
        @Schema(description = "Product name or title", example = "Vintage Camera")
        String name,
        
        @Schema(description = "Product category classification", example = "Electronics")
        String category,
        
        @Schema(description = "Detailed product description", example = "A classic 35mm film camera in perfect condition.")
        String description,
        
        @Schema(description = "Product listing price", example = "150.50")
        Double price,
        
        @Schema(description = "Geographic location of the product", example = "Madrid")
        String location,
        
        @Schema(description = "Product status (e.g., available, inactive)", example = "available")
        String status,
        
        @Schema(description = "Product image file to upload")
        MultipartFile image
) {
}