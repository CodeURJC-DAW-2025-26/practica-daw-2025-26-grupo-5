package es.stilnovo.library.dto;

import java.util.List;

public record PagedResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        boolean last
) {
}
