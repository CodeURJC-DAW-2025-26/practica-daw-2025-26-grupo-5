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
        
        @Schema(description = "Total count of all products in the system (including Sold)", example = "8")
        int totalProductCount,
        
        @Schema(description = "Count of active listings ready for purchase (status=Active, seller not banned)", example = "6")
        int activeListingCount,

        @Schema(description = "Total revenue from completed transactions", example = "45798.00")
        double totalRevenue,

        @Schema(description = "Global average rating across all platform valorations", example = "4.5")
        double globalAverageRating,

        @Schema(description = "Total number of completed transactions", example = "42")
        int totalTransactions,

        @Schema(description = "Average value per transaction", example = "1090.43")
        double averageTransactionValue
) {
}