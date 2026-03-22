package es.stilnovo.library.dto;

import java.util.List;
import es.stilnovo.library.model.User;
import es.stilnovo.library.model.Transaction;
import io.swagger.v3.oas.annotations.media.Schema;


/**
 * DTO: Data Transfer Object - Converts to/from JSON in REST API responses.
 * 
 * This record is ONLY used in REST Controllers as request/response bodies.
 * Record automatically generates: no-arg constructor, getters, toString, equals, hashCode.
 * Aggregates dashboard data from multiple sources into single immutable structure.
 * 
 * Contains comprehensive dashboard data for a seller including sales, statistics, and charts.
 */
@Schema(description = "Contains comprehensive dashboard data for a seller including sales, statistics, and charts")
public record UserDashboardDataDTO(
        
        @Schema(description = "The user entity viewing the dashboard")
        User user,
        
        @Schema(description = "Dashboard date or period", example = "October 2024")
        String date,
        
        @Schema(description = "List of transactions made by the user as a seller")
        List<Transaction> userSales,
        
        @Schema(description = "Labels for sales chart display")
        List<String> chartLabels,
        
        @Schema(description = "Values for sales chart visualization")
        List<Long> chartValues,
        
        @Schema(description = "Labels for revenue chart")
        List<String> revenueLabels,
        
        @Schema(description = "Revenue values for chart display")
        List<Double> revenueValues,
        
        @Schema(description = "Labels for bar chart visualization")
        List<String> barLabels,
        
        @Schema(description = "Number of visits over time for the user's products")
        List<Long> visitsData,
        
        @Schema(description = "User interest engagement metrics over time")
        List<Long> interestData
) {
}