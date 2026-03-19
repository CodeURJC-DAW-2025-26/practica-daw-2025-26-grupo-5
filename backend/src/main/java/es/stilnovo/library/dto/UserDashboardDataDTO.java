package es.stilnovo.library.dto;

import java.util.List;
import es.stilnovo.library.model.User;
import es.stilnovo.library.model.Transaction;


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