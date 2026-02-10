package es.stilnovo.library.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import es.stilnovo.library.model.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {

}