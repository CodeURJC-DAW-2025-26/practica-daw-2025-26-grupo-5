package es.stilnovo.library.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;

import es.stilnovo.library.model.User;
import java.util.List;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * DTO: Data Transfer Object - Converts to/from JSON in REST API responses.
 * 
 * This record is ONLY used in REST Controllers as request/response bodies.
 * Record automatically generates: no-arg constructor, getters, toString, equals, hashCode.
 * Provides type-safe aggregation of seller performance data without exposing entities.
 * 
 * Contains sales statistics and performance metrics for a seller.
 */
@Schema(description = "Contains sales statistics and performance metrics for a seller")
public record UserStatisticsDataDTO(
        
        @JsonIgnore 
        @Schema(hidden = true, description = "The user entity whose statistics are displayed (excluded from JSON)")
        User user,
        
        @Schema(description = "Total sales amount as a formatted string", example = "1,250.00 €")
        String totalSales,
        
        @Schema(description = "Total number of items sold", example = "45")
        int itemsSold,
        
        @Schema(description = "Average rating received as a formatted string", example = "4.5/5")
        String avgRating,
        
        @Schema(description = "Total value of active inventory as a formatted string", example = "350.00 €")
        String inventoryValue,
        
        @Schema(description = "Date or period for the statistics", example = "2024")
        String date,
        
        @Schema(description = "Labels for sales chart")
        List<String> chartLabels,   
        
        @Schema(description = "Values for sales chart visualization")
        List<Long> chartValues,     
        
        @Schema(description = "Labels for revenue chart")
        List<String> revenueLabels, 
        
        @Schema(description = "Revenue values for chart display")
        List<Double> revenueValues, 
        
        @Schema(description = "Labels for bar chart")
        List<String> barLabels,    
        
        @Schema(description = "Number of product visits over time")
        List<Long> visitsData,  
        
        @Schema(description = "Interest engagement data metrics over time")
        List<Long> interestData
) {}