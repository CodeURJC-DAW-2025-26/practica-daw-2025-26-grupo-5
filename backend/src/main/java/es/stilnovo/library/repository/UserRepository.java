package es.stilnovo.library.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import es.stilnovo.library.model.User;

/**
 * UserRepository interface for User entity database operations
 * Provides CRUD operations and queries for user management and authentication
 */
public interface UserRepository extends JpaRepository<User, Long> {
    
    /**
     * Find user by username (login identifier)
     * @param name the username
     * @return user if found, empty otherwise
     */
    Optional<User> findByName(String name);

    /**
     * Find user by email address
     * @param email the email
     * @return user if found, empty otherwise
     */
    Optional<User> findByEmail(String email);

    /**
     * Count users by banned status
     * @param banned true to count banned users, false for active users
     * @return number of users with this status
     */
    int countByBanned(boolean banned);

    /**
     * Check if a user exists by their username
     * @param username the username to check
     * @return true if a user with the username exists, false otherwise
     */
    boolean existsByName(String name);

    /**
     * Check if a user exists by their email address
     * @param email the email to check
     * @return true if a user with the email exists, false otherwise
     */
    boolean existsByEmail(String email);
}