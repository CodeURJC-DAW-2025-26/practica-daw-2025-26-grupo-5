package es.stilnovo.library.dto;

import java.util.List;

/**
 * Reports administrative summary statistics including user counts, banned users, and memory usage.
 * 
 * @param numUsers Total number of users in the system
 * @param numBanneds Total number of banned users
 * @param memoryUsage Current memory usage information
 * @param recentUsers List of recently registered users
 * @param recentProducts List of recently added products
 */
public record AdminSummaryDTO(
        int numUsers,
        int numBanneds,
        String memoryUsage,
        List<UserDTO> recentUsers,
        List<ProductDTO> recentProducts
) {
}