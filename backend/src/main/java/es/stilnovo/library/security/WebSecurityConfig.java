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

        http.authenticationProvider(authenticationProvider());

        http
            .authorizeHttpRequests(authorize -> authorize

                .requestMatchers("/", "/error").permitAll()
                .requestMatchers("/css/**", "/javascript/**", "/images/**", "/favicon.ico").permitAll()
                .requestMatchers("/banned").permitAll()
                .requestMatchers("/login-page", "/login-error", "/signup-page").permitAll()
                .requestMatchers("/product-images/**").permitAll()
                .requestMatchers("/info-product-page/**").permitAll()
                .requestMatchers("/about-page/**").permitAll()

                .requestMatchers("/user/me/profile-photo").permitAll()

                .requestMatchers("/load-more-products").permitAll()

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

                .requestMatchers("/admin/**").hasRole("ADMIN")

                .anyRequest().authenticated()
            )

            .formLogin(formLogin -> formLogin
                .loginPage("/login-page")
                .failureUrl("/login-error")
                .failureHandler(failureHandler)
                .defaultSuccessUrl("/")
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

