package es.stilnovo.library.dto;

public record NotificationResultDTO(
        InquiryDTO inquiry,
        boolean sent,
        Long cooldownMinutes,
        String errorCode
) {
}