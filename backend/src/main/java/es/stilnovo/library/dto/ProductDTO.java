package es.stilnovo.library.dto;

import java.util.List;

public record ProductDTO(
        Long id,
        String name,
        String category,
        Double price,
        String location,
        String description,
        String status,
        ImageDTO image,
        UserDTO seller,
        List<UserInteractionDTO> userInteractions,
        boolean favorite) {
}