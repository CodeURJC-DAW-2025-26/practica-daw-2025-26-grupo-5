package es.stilnovo.library.service;

import java.util.List;

import es.stilnovo.library.model.Product;
import es.stilnovo.library.model.User;

/**
 * Record: Java 21+ feature that automatically generates:
 * - No-argument constructor
 * - Accessor methods (getters) for all fields
 * - toString() method with all fields
 * - equals() and hashCode() methods
 * 
 * This eliminates hundreds of lines of boilerplate code and ensures immutable data structures.
 * Perfect for service return types aggregating multiple data sources.
 */
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
