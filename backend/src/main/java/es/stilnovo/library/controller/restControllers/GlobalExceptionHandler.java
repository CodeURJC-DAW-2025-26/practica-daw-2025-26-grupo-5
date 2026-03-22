package es.stilnovo.library.controller.restControllers;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

/**
 * GlobalExceptionHandler: Centralized exception handling for REST API endpoints.
 * 
 * Intercepts and converts various exception types into proper HTTP responses:
 * - ResponseStatusException: Returns status with error reason
 * - IllegalArgumentException: Converts to 400 Bad Request
 * - RuntimeException: Converts to 500 Internal Server Error
 * - General Exception: Catches all other errors with 500
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

/**
	 * Handles ResponseStatusException and returns appropriate HTTP status.
	 * @param ex the ResponseStatusException with status code and reason
	 * @return JSON response with status and error message
	 */
	@ExceptionHandler(ResponseStatusException.class)
        public ResponseEntity<Map<String, Object>> handleResponseStatusException(ResponseStatusException ex) {

                return ResponseEntity
                                .status(ex.getStatusCode())
                                .body(Map.of(
                                                "status", ex.getStatusCode().value(),
                                                "error", ex.getReason()));
        }

/**
	 * Handles IllegalArgumentException with 400 Bad Request response.
	 * @param ex the exception with validation or argument error details
	 * @return 400 response with error message
	 */
	@ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<Map<String, Object>> handleBadRequest(Exception ex) {

                return ResponseEntity
                                .badRequest()
                                .body(Map.of(
                                                "status", 400,
                                                "error", ex.getMessage()));
        }

/**
	 * Handles RuntimeException with 500 Internal Server Error response.
	 * @param ex the runtime exception with error details
	 * @return 500 response with error message
	 */
	@ExceptionHandler(RuntimeException.class)
        public ResponseEntity<Map<String, Object>> handleRuntime(Exception ex) {

                return ResponseEntity
                                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(Map.of(
                                                "status", 500,
                                                "error", ex.getMessage()));
        }

/**
	 * Catches all unhandled exceptions with 500 Internal Server Error.
	 * Fallback handler for any exception type not explicitly handled.
	 * @param ex any unhandled exception
	 * @return 500 response with generic error message
	 */
	@ExceptionHandler(Exception.class)
        public ResponseEntity<Map<String, Object>> handleGeneral(Exception ex) {

                return ResponseEntity
                                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(Map.of(
                                                "status", 500,
                                                "error", "Unexpected error"));
        }
}