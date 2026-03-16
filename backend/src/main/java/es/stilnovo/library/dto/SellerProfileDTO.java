package es.stilnovo.library.dto;

import java.util.List;

public record SellerProfileDTO(
        UserDTO seller,
        List<ProductDTO> products,
        List<ValorationDTO> valorations,
        int fullStars,
        boolean owner
) {
}
