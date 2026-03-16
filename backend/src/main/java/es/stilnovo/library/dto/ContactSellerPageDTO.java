package es.stilnovo.library.dto;

public record ContactSellerPageDTO(
        ProductDTO product,
        UserDTO seller,
        String buyerName,
        String buyerEmail
) {
}