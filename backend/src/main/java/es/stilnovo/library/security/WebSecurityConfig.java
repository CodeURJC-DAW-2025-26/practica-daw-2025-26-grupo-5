package es.stilnovo.library.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * WebSecurityConfig for Spring Security setup
 * Configures URL access rules, authentication, and CSRF protection
 */
@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

    @Autowired
    private CustomAuthenticationFailureHandler failureHandler;

    @Autowired
    RepositoryUserDetailsService userDetailsService;

    /**
     * Create BCrypt password encoder bean
     * @return PasswordEncoder configured with BCrypt
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Create authentication provider bean
     * Uses database-backed user details service and BCrypt password encoding
     * @return DaoAuthenticationProvider configured with user service and password encoder
     */
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    /**
     * Configure Spring Security filter chain
     * Defines authorization rules for public, user, and admin endpoints
     * @param http the HttpSecurity configuration object
     * @return SecurityFilterChain configured with access rules and login/logout
     * @throws Exception if configuration fails
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        // STEP 1: Register authentication provider
        http.authenticationProvider(authenticationProvider());

        // STEP 2: Configure authorization rules
        http
            .authorizeHttpRequests(authorize -> authorize

                // Public endpoints - no authentication required
                .requestMatchers("/", "/error").permitAll()
                .requestMatchers("/css/**", "/javascript/**", "/images/**", "/favicon.ico").permitAll()
                .requestMatchers("/banned").permitAll()
                .requestMatchers("/login-page", "/login-error", "/signup-page").permitAll()
                .requestMatchers("/product-images/**").permitAll()
                .requestMatchers("/info-product-page/**").permitAll()
                .requestMatchers("/about-page/**").permitAll()

                .requestMatchers("/user/me/profile-photo").permitAll()

                // Anonymous browsing allowed
                .requestMatchers("/load-more-products").permitAll()

                // User/Admin endpoints - requires authentication and proper role
                .requestMatchers(
                    "/payment-page/**",
                    "/contact-seller-page/**",
                    "/add-product-page/**",
                    "/edit-product-page/**",
                    "/sales-and-orders-page/**",
                    "/statistics-page/**",
                    "/user-page",
                    "/user-products-page",
                    "/user-setting-page",
                    "/favorite-products-page/**",
                    "/help-center-page/**",
                    "/pdf/**",
                    "/api/v1/notifications/**"
                ).hasAnyRole("USER", "ADMIN")

                // Admin only endpoints
                .requestMatchers("/admin/**").hasRole("ADMIN")

                // Everything else requires authentication
                .anyRequest().authenticated()
            )

            .formLogin(formLogin -> formLogin
                .loginPage("/login-page")
                .failureUrl("/login-error")
                .failureHandler(failureHandler)
                .defaultSuccessUrl("/", true)
                .permitAll()
            )
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/")
                .permitAll()
            );

        return http.build();
    }
}

