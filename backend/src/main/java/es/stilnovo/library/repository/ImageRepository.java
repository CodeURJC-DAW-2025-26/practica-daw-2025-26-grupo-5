package es.stilnovo.library.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import es.stilnovo.library.model.Image;

/**
 * ImageRepository interface for Image entity database operations
 * Provides CRUD operations for product and user images stored as BLOBs
 */
public interface ImageRepository extends JpaRepository<Image, Long> {

	List<Image> findByProductIdOrderByIdAsc(Long productId);

}