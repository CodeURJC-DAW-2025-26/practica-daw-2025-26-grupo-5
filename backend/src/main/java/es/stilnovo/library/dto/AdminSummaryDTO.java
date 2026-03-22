package es.stilnovo.library.dto;

import java.util.List;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * DTO: Data Transfer Object - Converts to/from JSON in REST API responses.
 * 
 * This record is ONLY used in REST Controllers as request/response bodies.
 * Record automatically generates: no-arg constructor, getters, toString, equals, hashCode.
 * Ensures immutable data transfer without side effects on service layer.
 * 
 * Reports administrative summary statistics including user counts, banned users, and memory usage.
 */
@Schema(description = "Reports administrative summary statistics including user counts, banned users, and memory usage")
public record AdminSummaryDTO(
        
        @Schema(description = "Total number of users in the system", example = "150")
        int numUsers,
        
        @Schema(description = "Total number of banned users", example = "3")
        int numBanneds,
        
        @Schema(description = "Current memory usage information", example = "512 MB")
        String memoryUsage,
        
        @Schema(description = "List of recently registered users")
        List<UserDTO> recentUsers,
        
        @Schema(description = "List of recently added products")
        List<ProductDTO> recentProducts
) {
}