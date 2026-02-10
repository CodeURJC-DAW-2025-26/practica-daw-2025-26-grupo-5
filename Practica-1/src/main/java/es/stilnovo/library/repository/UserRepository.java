package es.stilnovo.library.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import es.stilnovo.library.model.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByName(String name);

}
