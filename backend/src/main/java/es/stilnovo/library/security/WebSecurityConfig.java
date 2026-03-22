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
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import es.stilnovo.library.security.jwt.JwtRequestFilter;
import es.stilnovo.library.security.jwt.JwtTokenProvider;
import es.stilnovo.library.security.jwt.UnauthorizedHandlerJwt;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.config.Customizer;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

        @Autowired
        private JwtTokenProvider jwtTokenProvider;

        @Autowired
        private UnauthorizedHandlerJwt unauthorizedHandlerJwt;

        @Autowired
        private CustomAuthenticationFailureHandler failureHandler;

        @Autowired
        private RepositoryUserDetailsService userDetailsService;

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
                return authConfig.getAuthenticationManager();
        }

        @Bean
        public DaoAuthenticationProvider authenticationProvider() {
                DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
                authProvider.setPasswordEncoder(passwordEncoder());
                return authProvider;
        }

        /**
         * API SECURITY CONFIGURATION (REST - STATLESS)
         */
        @Bean
        @Order(1)
        public SecurityFilterChain apiFilterChain(HttpSecurity http) throws Exception {

                http.authenticationProvider(authenticationProvider());
                http.cors(Customizer.withDefaults());

                http.securityMatcher("/api/v1/**")
                                .exceptionHandling(handling -> handling
                                                // 401 (Unauthorized)
                                                .authenticationEntryPoint(unauthorizedHandlerJwt)
                                                // 403 (Forbidden)
                                                .accessDeniedHandler((request, response, accessDeniedException) -> {
                                                        response.setContentType("application/json");
                                                        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                                                        response.getWriter().write(
                                                                        "{\"status\": 403, \"message\": \"Endpoint error: Forbidden access\"}");
                                                }));

                http.authorizeHttpRequests(authorize -> authorize
                                // Public API Endpoints
                                .requestMatchers("/api/v1/auth/**", "/api/v1/sessions/**").permitAll()
                                .requestMatchers(HttpMethod.POST, "/api/v1/users").permitAll()
                                .requestMatchers(HttpMethod.GET,
                                                "/api/v1/catalog/**",
                                                "/api/v1/products/**",
                                                "/api/v1/images/**")
                                .permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/v1/users/*/profile").permitAll()

                                // Private API Endpoints
                                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                                .anyRequest().hasAnyRole("USER", "ADMIN"));

                // REST Security best practices
                http.formLogin(form -> form.disable());
                http.csrf(csrf -> csrf.disable());
                http.httpBasic(basic -> basic.disable());
                http.sessionManagement(mgmt -> mgmt.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

                // Add the JWT Filter from the professor's structure
                http.addFilterBefore(new JwtRequestFilter(userDetailsService, jwtTokenProvider),
                                UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        /**
         * WEB SECURITY CONFIGURATION (MUSTACHE - STATEFUL)
         */
        @Bean
        @Order(2)
        public SecurityFilterChain webFilterChain(HttpSecurity http) throws Exception {

                http.authenticationProvider(authenticationProvider());
                http.cors(Customizer.withDefaults());
                http
                                .authorizeHttpRequests(authorize -> authorize
                                                // Public Web Pages
                                                .requestMatchers("/", "/error", "/banned").permitAll()
                                                .requestMatchers("/css/**", "/javascript/**", "/images/**",
                                                                "/favicon.ico")
                                                .permitAll()
                                                .requestMatchers("/login-page", "/login-error", "/signup-page")
                                                .permitAll()
                                                .requestMatchers("/product-images/**", "/info-product-page/**",
                                                                "/about-page/**")
                                                .permitAll()
                                                .requestMatchers("/user/me/profile-photo", "/load-more-products")
                                                .permitAll()

                                                // OpenAPI / Swagger Documentation
                                                .requestMatchers("/v3/api-docs*/**").permitAll()
                                                .requestMatchers("/swagger-ui.html").permitAll()
                                                .requestMatchers("/swagger-ui/**").permitAll()

                                                // Private Web Pages
                                                .requestMatchers("/admin/**").hasRole("ADMIN")
                                                .anyRequest().hasAnyRole("USER", "ADMIN"))
                                .formLogin(form -> form
                                                .loginPage("/login-page")
                                                .failureUrl("/login-error")
                                                .failureHandler(failureHandler)
                                                .defaultSuccessUrl("/", true)
                                                .permitAll())
                                .logout(logout -> logout
                                                .logoutUrl("/logout")
                                                .logoutSuccessUrl("/")
                                                .permitAll());

                return http.build();
        }

        /**
         * Global CORS configuration for security filters.
         * This is for api-docs.html (for documentation only)
         */
        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();

                // Allows requests from any origin for documentation tools
                configuration.setAllowedOriginPatterns(List.of("*"));
                configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Cache-Control"));
                configuration.setAllowCredentials(true);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }
}