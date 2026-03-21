package es.stilnovo.library.dto;

/**
 * Contains data for the contact seller page with product and buyer information.
 * 
 * @param product The product being inquired about
 * @param seller The seller of the product
 * @param buyerName Name of the buyer contacting the seller
 * @param buyerEmail Email address of the buyer
 */
public record ContactSellerPageDTO(
        ProductDTO product,
        UserDTO seller,
        String buyerName,
        String buyerEmail
) {
}