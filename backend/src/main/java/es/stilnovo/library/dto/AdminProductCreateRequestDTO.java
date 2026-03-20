package es.stilnovo.library.dto;

public record AdminProductCreateRequestDTO(
        Long sellerId,
        String name,
        String category,
        String description,
        Double price,
        String location,
        String status
) {
}