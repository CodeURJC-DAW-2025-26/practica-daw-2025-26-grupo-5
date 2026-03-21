package es.stilnovo.library.dto;

/**
 * Contains checkout transaction information with product and buyer details.
 * 
 * @param product The product being purchased
 * @param buyer The user completing the purchase
 */
public record CheckoutDTO(
        ProductDTO product,
        UserDTO buyer
) {
}
