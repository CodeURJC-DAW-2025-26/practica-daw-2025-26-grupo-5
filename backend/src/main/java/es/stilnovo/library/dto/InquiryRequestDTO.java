package es.stilnovo.library.dto;

/**
 * Request body for creating a new customer inquiry.
 * 
 * @param productId ID of the product being inquired about
 * @param phone Customer's phone number
 * @param type Type or category of the inquiry
 * @param message The inquiry message content
 */
public record InquiryRequestDTO(
        Long productId,
        String phone,
        String type,
        String message
) {
}