package es.stilnovo.library.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import es.stilnovo.library.model.Product;
import es.stilnovo.library.model.User;
import es.stilnovo.library.repository.ProductRepository;

@Service
public class ProductService {

    @Autowired
    private ProductRepository repository;

    public Optional<Product> findById(long id) {
        return repository.findById(id);
    }
    
    public boolean exist(long id) {
        return repository.existsById(id);
    }

    public List<Product> findAll() {
        return repository.findAll();
    }

    public void save(Product product) {
        repository.save(product);
    }

    public void delete(long id) {
        repository.deleteById(id);
    }

    public long getProductCount(User seller) {
        // Returns the total count of items for sale from this specific curator
        return repository.countBySeller(seller);
    }

    // Logic to either return all products or filter them by name
    public List<Product> findByQuery(String query) {
        if (query == null || query.isEmpty()) {
            return repository.findAll();
        }
        // Make sure this method exists in your ProductRepository!
        return repository.findByNameContainingIgnoreCase(query);
    }

}