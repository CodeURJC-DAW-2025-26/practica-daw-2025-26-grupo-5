package es.stilnovo.library.dto;

import java.util.List;

public record HomePageDTO(
        List<ProductDTO> products,
        List<ProductDTO> recommendedProducts,
        UserDTO user,
        boolean logged,
        boolean admin,
        String query,
        boolean searching,
        boolean last,
        int nextOffset
) {
}
