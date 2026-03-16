package es.stilnovo.library.dto;

import java.util.List;
import es.stilnovo.library.model.User;
import es.stilnovo.library.model.Transaction;


public record UserDashboardDataDTO(
        User user,
        String date,
        List<Transaction> userSales,
        String chartLabels,
        String chartValues,
        String revenueLabels,
        String revenueValues,
        String barLabels,
        String visitsData,
        String interestData
) {
}