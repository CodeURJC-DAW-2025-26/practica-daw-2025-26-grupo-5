package es.stilnovo.library.service;

import java.util.List;

import es.stilnovo.library.model.Product;

public record CatalogPageResult(
        List<Product> products,
        boolean last,
        long totalElements,
        int page,
        int size
) {
}
