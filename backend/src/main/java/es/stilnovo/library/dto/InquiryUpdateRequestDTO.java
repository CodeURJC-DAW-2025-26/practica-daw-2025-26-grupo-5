package es.stilnovo.library.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Request body for updating an existing inquiry.
 */
public record InquiryUpdateRequestDTO(
        
        @NotNull(message = "Message cannot be null")
        @Size(min = 5, max = 1000, message = "Message must be between 5 and 1000 characters")
        String message,

        @NotNull(message = "Status cannot be null")
        String status
) {
}