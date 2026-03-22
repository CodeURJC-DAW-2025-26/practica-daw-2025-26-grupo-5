package es.stilnovo.library.dto;

import java.util.List;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * DTO: Data Transfer Object - Converts to/from JSON in REST API responses.
 * 
 * This record is ONLY used in REST Controllers as request/response bodies.
 * Record automatically generates: no-arg constructor, getters, toString, equals, hashCode.
 * Generic type enables type-safe pagination wrapping for any resource list.
 * 
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
