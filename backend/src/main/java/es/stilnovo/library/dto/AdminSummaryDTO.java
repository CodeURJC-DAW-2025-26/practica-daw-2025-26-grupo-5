package es.stilnovo.library.dto;

import java.util.List;

public record AdminSummaryDTO(
        int numUsers,
        int numBanneds,
        String memoryUsage,
        List<UserDTO> recentUsers,
        List<ProductDTO> recentProducts
) {
}