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
        
        @Schema(description = "Total number of banned users", example = "2")
        int numBanneds,
        
        @Schema(description = "Current memory usage information", example = "1024 MB")
        String memoryUsage,
        
        @Schema(description = "List of recently registered users")
        List<UserDTO> recentUsers,
        
        @Schema(description = "List of recently added products")
        List<ProductDTO> recentProducts,
        
        @Schema(description = "Total count of all products in the system", example = "7")
        int totalProductCount,

        @Schema(description = "Total revenue from completed transactions", example = "45798.00")
        double totalRevenue
) {
}