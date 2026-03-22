package es.stilnovo.library.service;

import java.util.List;

import es.stilnovo.library.model.Product;

/**
 * Record: Java 21+ feature that automatically generates:
 * - No-argument constructor
 * - Accessor methods (getters) for all fields
 * - toString() method with all fields
 * - equals() and hashCode() methods
 * 
 * This reduces boilerplate code significantly and ensures immutable data transfer.
 * Ideal for service layer return types and data aggregation.
 */
public record CatalogPageResult(
        List<Product> products,
        boolean last,
        long totalElements,
        int page,
        int size
) {
}
