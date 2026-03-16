package es.stilnovo.library.dto;

public record CheckoutDTO(
        ProductDTO product,
        UserDTO buyer
) {
}
