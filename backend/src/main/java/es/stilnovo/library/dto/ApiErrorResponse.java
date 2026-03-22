package es.stilnovo.library.dto;

import java.time.Instant;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * DTO: Data Transfer Object - Converts to/from JSON in REST API responses.
 * 
 * This record is ONLY used in REST Controllers as request/response bodies.
 * Record automatically generates: no-arg constructor, getters, toString, equals, hashCode.
 * Provides consistent error information to API clients for all error scenarios.
 * 
 * Standardized API error response with detailed error information.
 */
@Schema(description = "Standardized API error response with detailed error information")
public record ApiErrorResponse(
        
        @Schema(description = "The instant when the error occurred", example = "2023-10-24T14:15:22Z")
        Instant timestamp,
        
        @Schema(description = "HTTP status code of the error", example = "404")
        int status,
        
        @Schema(description = "Error type or exception class name", example = "Not Found")
        String error,
        
        @Schema(description = "Descriptive error message for the client", example = "Product with ID 5 not found")
        String message,
        
        @Schema(description = "The API path that caused the error", example = "/api/v1/products/5")
        String path
) {
}