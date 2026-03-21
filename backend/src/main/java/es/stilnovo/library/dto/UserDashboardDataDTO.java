package es.stilnovo.library.dto;

import java.util.List;
import es.stilnovo.library.model.User;
import es.stilnovo.library.model.Transaction;


/**
 * Contains comprehensive dashboard data for a seller including sales, statistics, and charts.
 * 
 * @param user The user entity viewing the dashboard
 * @param date Dashboard date or period
 * @param userSales List of transactions made by the user as a seller
 * @param chartLabels Labels for sales chart display
 * @param chartValues Values for sales chart visualization
 * @param revenueLabels Labels for revenue chart
 * @param revenueValues Revenue values for chart display
 * @param barLabels Labels for bar chart visualization
 * @param visitsData Number of visits over time for the user's products
 * @param interestData User interest engagement metrics over time
 */
public record UserDashboardDataDTO(
        User user,
        String date,
        List<Transaction> userSales,
        List<String> chartLabels,
        List<Long> chartValues,
        List<String> revenueLabels,
        List<Double> revenueValues,
        List<String> barLabels,
        List<Long> visitsData,
        List<Long> interestData
) {
}