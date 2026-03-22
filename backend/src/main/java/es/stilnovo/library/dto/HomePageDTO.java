package es.stilnovo.library.dto;

import java.util.List;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * DTO: Data Transfer Object - Converts to/from JSON in REST API responses.
 * 
 * This record is ONLY used in REST Controllers as request/response bodies.
 * Record automatically generates: no-arg constructor, getters, toString, equals, hashCode.
 * Separates API data contracts from business logic for clean architecture.
 * 
 * Contains all data required to render the home page.
 */
@Schema(description = "Contains all data required to render the home page")
public record HomePageDTO(
        
        @Schema(description = "List of general products to display")
        List<ProductDTO> products,
        
        @Schema(description = "List of personalized recommended products")
        List<ProductDTO> recommendedProducts,
        
        @Schema(description = "Logged-in user information, null if not authenticated")
        UserDTO user,
        
        @Schema(description = "Boolean indicating if a user is currently logged in", example = "true")
        boolean logged,
        
        @Schema(description = "Boolean indicating if the logged-in user is an administrator", example = "false")
        boolean admin,
        
        @Schema(description = "Search query string if applicable", example = "photo camera")
        String query,
        
        @Schema(description = "Boolean indicating if a search is active", example = "true")
        boolean searching,
        
        @Schema(description = "Boolean indicating if this is the last page of results", example = "false")
        boolean last,
        
        @Schema(description = "Offset value for fetching the next set of products", example = "10")
        int nextOffset
) {
}