package es.stilnovo.library.dto;

import java.util.List;
import es.stilnovo.library.model.User;
import es.stilnovo.library.model.Valoration;
import es.stilnovo.library.model.Product;

/**
 * Contains raw data for rendering a seller profile page, including entity models.
 * 
 * @param seller The seller user entity
 * @param sellerValorations List of valuations (ratings) received by the seller
 * @param sellerProducts List of products listed by the seller
 * @param itemsCount Total count of items sold by the seller
 * @param fullStars Average rating rounded to nearest integer
 * @param owner Boolean indicating if the current user is viewing their own profile
 */
public record SellerProfilePageDataDTO(
        User seller,
        List<Valoration> sellerValorations,
        List<Product> sellerProducts,
        int itemsCount,
        int fullStars,
        boolean owner
) {
}