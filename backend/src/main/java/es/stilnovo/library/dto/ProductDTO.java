package es.stilnovo.library.dto;

import java.util.List;

/**
 * Represents a product with its core details, seller information, and user interactions.
 * 
 * @param id Unique product identifier
 * @param name Product name or title
 * @param category Product category classification
 * @param price Current selling price of the product
 * @param location Geographic location where the product is listed
 * @param description Detailed product description
 * @param status Product status (e.g., available, sold, inactive)
 * @param image Product image reference
 * @param seller Information about the product seller
 * @param userInteractions List of user interactions (views, favorites, etc.) on this product
 * @param favorite Boolean indicating if the current user has favorited this product
 */
public record ProductDTO(
        Long id,
        String name,
        String category,
        Double price,
        String location,
        String description,
        String status,
        ImageDTO image,
        UserDTO seller,
        List<UserInteractionDTO> userInteractions,
        boolean favorite) {
}