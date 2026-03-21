package es.stilnovo.library.dto;

import org.springframework.web.multipart.MultipartFile;

/**
 * Request body for administrators to create a product on behalf of a seller.
 * 
 * @param sellerId ID of the seller who will own the product
 * @param name Product name or title
 * @param category Product category classification
 * @param description Detailed product description
 * @param price Product listing price
 * @param location Geographic location of the product
 * @param status Product status (e.g., available, inactive)
 * @param image Product image file to upload
 */
public record AdminProductCreateRequestDTO(
        Long sellerId,
        String name,
        String category,
        String description,
        Double price,
        String location,
        String status,
        MultipartFile image
) {
}