package es.stilnovo.library.dto;

import java.util.List;

/**
 * Comprehensive product details page data including recommended products.
 * 
 * @param product The main product being displayed
 * @param recommendedProducts List of products recommended to the user
 * @param logged Boolean indicating if the user is logged in
 */
public record ProductDetailsDTO(
        ProductDTO product,
        List<ProductDTO> recommendedProducts,
        boolean logged
) {
}
