package es.stilnovo.library.security;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import es.stilnovo.library.model.User;
import es.stilnovo.library.repository.UserRepository;

/**
 * RepositoryUserDetailsService for Spring Security user authentication
 * Loads user credentials from database and converts to Spring Security format
 */
@Service
public class RepositoryUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    /**
     * Load user details from database for authentication
     * Blocks banned users from gaining access
     * @param username the username to look up
     * @return UserDetails with credentials and authorities
     * @throws UsernameNotFoundException if user not found or is banned
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        // STEP 1: Query database for user by username
        User user = userRepository.findByName(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // STEP 2: Security gate - block banned users
        if (user.isBanned()) {
            throw new UsernameNotFoundException("User is banned");
        }

        // STEP 3: Convert user roles to Spring Security authorities
        List<GrantedAuthority> roles = new ArrayList<>();
        for (String role : user.getRoles()) {
            roles.add(new SimpleGrantedAuthority(role));
        }

        // STEP 4: Return UserDetails object for authentication
        return new org.springframework.security.core.userdetails.User(
                user.getName(),
                user.getEncodedPassword(),
                roles);
    }
}
