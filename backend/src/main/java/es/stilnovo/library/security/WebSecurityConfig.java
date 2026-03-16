package es.stilnovo.library.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

    @Autowired
    private CustomAuthenticationFailureHandler failureHandler;

    @Autowired
    private RepositoryUserDetailsService userDetailsService;

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

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    /**
     * API Security Configuration (Stateless)
     */
    @Bean
    @Order(1)
    public SecurityFilterChain apiFilterChain(HttpSecurity http) throws Exception {
        http.securityMatcher("/api/v1/**");

        http.csrf(csrf -> csrf.disable()); // APIs are typically stateless

        http.authorizeHttpRequests(auth -> auth
            // Public API
            .requestMatchers("/api/v1/sessions/**").permitAll()
            .requestMatchers(HttpMethod.POST, "/api/v1/users").permitAll()
            .requestMatchers(HttpMethod.GET,
                    "/api/v1/catalog/**",
                    "/api/v1/products",
                    "/api/v1/products/*",
                    "/api/v1/products/*/summary",
                    "/api/v1/products/recommendations",
                    "/api/v1/products/*/images",
                    "/api/v1/images/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/users/*/profile").permitAll()
            
            // Protected API
            .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
            .anyRequest().hasAnyRole("USER", "ADMIN")
        );

        // No session for API
        http.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        // Return 401 instead of redirecting to login-page
        http.exceptionHandling(e -> e.authenticationEntryPoint((request, response, authException) -> {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
        }));

        return http.build();
    }

    /**
     * Web Security Configuration (Stateful)
     */
    @Bean
    public SecurityFilterChain webFilterChain(HttpSecurity http) throws Exception {
        http.authenticationProvider(authenticationProvider());

        http.authorizeHttpRequests(auth -> auth
            // Public Web
            .requestMatchers("/", "/error", "/banned").permitAll()
            .requestMatchers("/css/**", "/javascript/**", "/images/**", "/favicon.ico").permitAll()
            .requestMatchers("/login-page", "/login-error", "/signup-page").permitAll()
            .requestMatchers("/product-images/**", "/info-product-page/**", "/about-page/**").permitAll()
            .requestMatchers("/user/me/profile-photo", "/load-more-products").permitAll()

            // Protected Web
            .requestMatchers("/admin/**").hasRole("ADMIN")
            .anyRequest().hasAnyRole("USER", "ADMIN")
        );

        http.formLogin(form -> form
            .loginPage("/login-page")
            .failureUrl("/login-error")
            .failureHandler(failureHandler)
            .defaultSuccessUrl("/", true)
            .permitAll()
        );

        http.logout(logout -> logout
            .logoutUrl("/logout")
            .logoutSuccessUrl("/")
            .permitAll()
        );

        return http.build();
    }
}
