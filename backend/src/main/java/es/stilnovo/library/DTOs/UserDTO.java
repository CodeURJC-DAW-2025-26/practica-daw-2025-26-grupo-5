package es.stilnovo.library.DTOs;

import java.util.List;

public record UserDTO(
        Long id,
        String name,
        String email,
        Double rating,
        int numRatings,
        String description,
        List<String> roles,
        boolean banned
) {
}