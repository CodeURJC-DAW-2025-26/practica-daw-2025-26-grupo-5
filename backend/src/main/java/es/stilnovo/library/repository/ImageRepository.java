package es.stilnovo.library.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import es.stilnovo.library.model.Image;

/**
 * ImageRepository interface for Image entity database operations
 * Provides CRUD operations for product and user images stored as BLOBs
 */
public interface ImageRepository extends JpaRepository<Image, Long> {

	@Query("SELECT p.image FROM ProductTable p WHERE p.id = :productId")
	Optional<Image> findByProductId(@Param("productId") Long productId);

}