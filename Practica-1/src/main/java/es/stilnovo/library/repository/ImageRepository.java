package es.stilnovo.library.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import es.stilnovo.library.model.Image;

public interface ImageRepository extends JpaRepository<Image, Long> {

}