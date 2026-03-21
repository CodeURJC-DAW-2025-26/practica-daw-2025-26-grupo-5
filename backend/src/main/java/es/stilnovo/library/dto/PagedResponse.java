package es.stilnovo.library.dto;

import java.util.List;

/**
 * Generic paginated response container for list results.
 * 
 * @param <T> Type of elements in the paginated response
 * @param content List of items for the current page
 * @param page Current page number (typically zero-based)
 * @param size Number of items per page
 * @param totalElements Total number of elements across all pages
 * @param last Boolean indicating if this is the final page of results
 */
public record PagedResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        boolean last
) {
}
