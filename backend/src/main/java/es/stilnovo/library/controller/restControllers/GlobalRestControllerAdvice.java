package es.stilnovo.library.controller.restControllers;

import java.time.Instant;
import java.util.NoSuchElementException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import es.stilnovo.library.dto.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class GlobalRestControllerAdvice {

        @ExceptionHandler(ResponseStatusException.class)
        public ResponseEntity<ApiErrorResponse> handleResponseStatusException(
                        ResponseStatusException exception,
                        HttpServletRequest request) {
                HttpStatus status = HttpStatus.valueOf(exception.getStatusCode().value());
                return ResponseEntity.status(status)
                                .body(new ApiErrorResponse(
                                                Instant.now(),
                                                status.value(),
                                                status.getReasonPhrase(),
                                                exception.getReason(),
                                                request.getRequestURI()));
        }

        @ExceptionHandler(NoSuchElementException.class)
        public ResponseEntity<ApiErrorResponse> handleNoSuchElementException(
                        NoSuchElementException exception,
                        HttpServletRequest request) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body(new ApiErrorResponse(
                                                Instant.now(),
                                                HttpStatus.NOT_FOUND.value(),
                                                HttpStatus.NOT_FOUND.getReasonPhrase(),
                                                exception.getMessage(),
                                                request.getRequestURI()));
        }

        @ExceptionHandler(IllegalStateException.class)
        public ResponseEntity<ApiErrorResponse> handleIllegalStateException(
                        IllegalStateException exception,
                        HttpServletRequest request) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                                .body(new ApiErrorResponse(
                                                Instant.now(),
                                                HttpStatus.CONFLICT.value(),
                                                HttpStatus.CONFLICT.getReasonPhrase(),
                                                exception.getMessage(),
                                                request.getRequestURI()));
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<ApiErrorResponse> handleException(
                        Exception exception,
                        HttpServletRequest request) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(new ApiErrorResponse(
                                                Instant.now(),
                                                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                                                HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(),
                                                exception.getMessage(),
                                                request.getRequestURI()));
        }
}
