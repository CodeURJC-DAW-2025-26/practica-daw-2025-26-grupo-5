package es.stilnovo.library.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import es.stilnovo.library.model.Product;
import es.stilnovo.library.model.User;

public interface ProductRepository extends JpaRepository<Product, Long> {
    // Spring generates the SQL automatically: SELECT * FROM Product WHERE user_id = ?
    List<Product> findBySeller(User seller);

    // Efficiently counts only the number of products associated with this seller
    long countBySeller(User seller);

    // Finds products whose name contains the query string, ignoring case
    List<Product> findByNameContainingIgnoreCase(String name);
    
}