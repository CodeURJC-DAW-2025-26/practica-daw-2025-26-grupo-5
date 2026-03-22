package es.stilnovo.library.service;

import es.stilnovo.library.model.Product;
import es.stilnovo.library.model.User;

/**
 * Record: Java 21+ feature that automatically generates:
 * - No-argument constructor
 * - Accessor methods (getters) for all fields
 * - toString() method with all fields
 * - equals() and hashCode() methods
 * 
 * Used in service layer to safely transfer checkout details between Payment and Checkout services.
 * Ensures immutable data handling during transaction processing.
 */
public record CheckoutData(
        Product product,
        User buyer
) {
}
