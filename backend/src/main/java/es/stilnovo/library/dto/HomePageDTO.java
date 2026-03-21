package es.stilnovo.library.dto;

import java.util.List;

/**
 * Contains all data required to render the home page.
 * 
 * @param products List of general products to display
 * @param recommendedProducts List of personalized recommended products
 * @param user Logged-in user information, null if not authenticated
 * @param logged Boolean indicating if a user is currently logged in
 * @param admin Boolean indicating if the logged-in user is an administrator
 * @param query Search query string if applicable
 * @param searching Boolean indicating if a search is active
 * @param last Boolean indicating if this is the last page of results
 * @param nextOffset Offset value for fetching the next set of products
 */
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
