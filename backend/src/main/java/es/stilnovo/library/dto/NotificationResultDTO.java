package es.stilnovo.library.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Result of attempting to send a notification about an inquiry.
 */
@Schema(description = "Result of attempting to send a notification about an inquiry")
public record NotificationResultDTO(
        
        @Schema(description = "The inquiry that notification was attempted for")
        InquiryDTO inquiry,
        
        @Schema(description = "Boolean indicating if the notification was successfully sent", example = "true")
        boolean sent,
        
        @Schema(description = "Minutes remaining before another notification can be sent (if cooldown is active)", example = "0")
        Long cooldownMinutes,
        
        @Schema(description = "Error code if notification failed, null if successful", example = "null", nullable = true)
        String errorCode
) {
}