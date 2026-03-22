package es.stilnovo.library.dto;

import java.util.List;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Generic paginated response container for list results.
 */
@Schema(description = "Generic paginated response container for list results")
public record PagedResponse<T>(
        
        @Schema(description = "List of items for the current page")
        List<T> content,
        
        @Schema(description = "Current page number (typically zero-based)", example = "0")
        int page,
        
        @Schema(description = "Number of items per page", example = "10")
        int size,
        
        @Schema(description = "Total number of elements across all pages", example = "45")
        long totalElements,
        
        @Schema(description = "Boolean indicating if this is the final page of results", example = "false")
        boolean last
) {
}
