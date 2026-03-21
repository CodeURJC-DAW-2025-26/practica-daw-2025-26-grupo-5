package es.stilnovo.library.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;

import es.stilnovo.library.model.User;
import java.util.List;

/**
 * Contains sales statistics and performance metrics for a seller.
 * 
 * @param user The user entity whose statistics are displayed (excluded from JSON)
 * @param totalSales Total sales amount as a formatted string
 * @param itemsSold Total number of items sold
 * @param avgRating Average rating received as a formatted string
 * @param inventoryValue Total value of active inventory as a formatted string
 * @param date Date or period for the statistics
 * @param chartLabels Labels for sales chart
 * @param chartValues Values for sales chart visualization
 * @param revenueLabels Labels for revenue chart
 * @param revenueValues Revenue values for chart display
 * @param barLabels Labels for bar chart
 * @param visitsData Number of product visits over time
 */
public record UserStatisticsDataDTO(
        @JsonIgnore User user,
        String totalSales,
        int itemsSold,
        String avgRating,
        String inventoryValue,
        String date,
        List<String> chartLabels,   
        List<Long> chartValues,     
        List<String> revenueLabels, 
        List<Double> revenueValues, 
        List<String> barLabels,    
        List<Long> visitsData,  
        List<Long> interestData
) {}