package es.stilnovo.library.dto;

import es.stilnovo.library.model.User;

public record UserStatisticsDataDTO(
        User user,
        String totalSales,
        int itemsSold,
        String avgRating,
        String inventoryValue,
        String date,
        String chartLabels,
        String chartValues,
        String revenueLabels,
        String revenueValues,
        String barLabels,
        String visitsData,
        String interestData
) {
}