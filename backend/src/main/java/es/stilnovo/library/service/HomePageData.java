package es.stilnovo.library.service;

import java.util.List;

import es.stilnovo.library.model.Product;
import es.stilnovo.library.model.User;

public record HomePageData(
        List<Product> products,
        List<Product> recommendedProducts,
        User user,
        boolean logged,
        boolean admin,
        String query,
        boolean searching,
        boolean last,
        int nextOffset
) {
}
