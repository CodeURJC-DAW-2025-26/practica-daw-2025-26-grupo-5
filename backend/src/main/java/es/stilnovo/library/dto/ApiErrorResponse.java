package es.stilnovo.library.dto;

import java.time.Instant;

/**
 * Standardized API error response with detailed error information.
 * 
 * @param timestamp The instant when the error occurred
 * @param status HTTP status code of the error
 * @param error Error type or exception class name
 * @param message Descriptive error message for the client
 * @param path The API path that caused the error
 */
public record ApiErrorResponse(
        Instant timestamp,
        int status,
        String error,
        String message,
        String path
) {
}
