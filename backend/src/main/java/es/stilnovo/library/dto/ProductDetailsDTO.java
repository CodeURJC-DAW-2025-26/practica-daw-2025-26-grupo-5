package es.stilnovo.library.dto;

import java.util.List;

public record ProductDetailsDTO(
        ProductDTO product,
        List<ProductDTO> recommendedProducts,
        boolean logged
) {
}
