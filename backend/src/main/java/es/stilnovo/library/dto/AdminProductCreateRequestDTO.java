package es.stilnovo.library.dto;

import org.springframework.web.multipart.MultipartFile;

public record AdminProductCreateRequestDTO(
        Long sellerId,
        String name,
        String category,
        String description,
        Double price,
        String location,
        String status,
        MultipartFile image
) {
}