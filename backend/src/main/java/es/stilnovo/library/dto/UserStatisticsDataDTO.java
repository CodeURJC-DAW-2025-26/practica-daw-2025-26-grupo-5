package es.stilnovo.library.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;

import es.stilnovo.library.model.User;
import java.util.List;

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