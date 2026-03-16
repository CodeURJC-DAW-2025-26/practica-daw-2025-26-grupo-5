package es.stilnovo.library.service;

import es.stilnovo.library.model.Product;
import es.stilnovo.library.model.User;

public record CheckoutData(
        Product product,
        User buyer
) {
}
