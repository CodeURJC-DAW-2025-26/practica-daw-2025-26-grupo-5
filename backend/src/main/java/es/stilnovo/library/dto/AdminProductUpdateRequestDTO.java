package es.stilnovo.library.dto;

/**
 * Request body for administrators to update product details.
 * 
 * @param name Updated product name
 * @param category Updated product category
 * @param price Updated product price
 * @param description Updated product description
 * @param location Updated product location
 * @param status Updated product status
 */
public record AdminProductUpdateRequestDTO(
        String name,
        String category,
        Double price,
        String description,
        String location,
        String status
) {
}