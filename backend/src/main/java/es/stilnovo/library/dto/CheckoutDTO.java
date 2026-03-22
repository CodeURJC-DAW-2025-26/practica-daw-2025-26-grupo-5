package es.stilnovo.library.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Contains checkout transaction information with product and buyer details.
 */
@Schema(description = "Contains checkout transaction information with product and buyer details")
public record CheckoutDTO(
        
        @Schema(description = "The product being purchased")
        ProductDTO product,
        
        @Schema(description = "The user completing the purchase")
        UserDTO buyer
) {
}