package es.stilnovo.library.dto;

public record InquiryRequestDTO(
        Long productId,
        String phone,
        String type,
        String message
) {
}