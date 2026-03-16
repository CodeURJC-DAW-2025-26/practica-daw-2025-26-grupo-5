package es.stilnovo.library.dto;

import java.util.List;
import es.stilnovo.library.model.User;
import es.stilnovo.library.model.Valoration;
import es.stilnovo.library.model.Product;
import es.stilnovo.library.model.Transaction;

public record SellerProfilePageDataDTO(
        User seller,
        List<Valoration> sellerValorations,
        List<Product> sellerProducts,
        int itemsCount,
        int fullStars,
        boolean owner
) {
}