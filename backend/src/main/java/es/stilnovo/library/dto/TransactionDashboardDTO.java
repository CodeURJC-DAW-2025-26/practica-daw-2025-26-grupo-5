package es.stilnovo.library.dto;

import java.util.List;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Dashboard data containing user sales and orders")
public record TransactionDashboardDTO(
    @Schema(description = "List of sales made by the user")
    List<TransactionDTO> sales,
    
    @Schema(description = "List of orders placed by the user")
    List<TransactionDTO> orders
) {}