package es.stilnovo.library.dto;

public record AdminProductUpdateRequestDTO(
        String name,
        String category,
        Double price,
        String description,
        String location,
        String status
) {
}