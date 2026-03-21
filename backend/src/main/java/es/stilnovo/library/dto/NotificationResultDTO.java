package es.stilnovo.library.dto;

/**
 * Result of attempting to send a notification about an inquiry.
 * 
 * @param inquiry The inquiry that notification was attempted for
 * @param sent Boolean indicating if the notification was successfully sent
 * @param cooldownMinutes Minutes remaining before another notification can be sent (if cooldown is active)
 * @param errorCode Error code if notification failed, null if successful
 */
public record NotificationResultDTO(
        InquiryDTO inquiry,
        boolean sent,
        Long cooldownMinutes,
        String errorCode
) {
}