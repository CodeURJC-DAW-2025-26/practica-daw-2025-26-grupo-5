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

@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

	@Autowired
	RepositoryUserDetailsService userDetailsService;

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public DaoAuthenticationProvider authenticationProvider() {
		DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
		authProvider.setPasswordEncoder(passwordEncoder());

		return authProvider;
	}

	@Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http.authenticationProvider(authenticationProvider());

        http
            .authorizeHttpRequests(authorize -> authorize
                // PUBLIC PAGES: Essential for the index to load correctly
                .requestMatchers("/", "/error").permitAll() 
                .requestMatchers("/css/**", "/js/**", "/images/**", "/favicon.ico").permitAll()
                
                // AUTHENTICATION PAGES: Login and Signup flows
                .requestMatchers("/login-page", "/login-error-page").permitAll()
                .requestMatchers("/signup-page", "/signup-error-page").permitAll()
                
				.requestMatchers("/product-images/**").permitAll()
                // PRODUCT VIEWS: Public access to the marketplace and details
                .requestMatchers("/info-product-page/**").permitAll()
                .requestMatchers("/about-page/**").permitAll()

                // PRIVATE PAGES: Restricted to registered users or admins
				.requestMatchers("/payment-page/**").hasAnyRole("USER", "ADMIN")
				.requestMatchers("/contact-seller-page/**").hasAnyRole("USER", "ADMIN")
                .requestMatchers("/add-product-page/**").hasAnyRole("USER", "ADMIN")
                .requestMatchers("/edit-product-page/**").hasAnyRole("USER", "ADMIN")
				.requestMatchers("/sales-and-orders-page/**").hasAnyRole("USER", "ADMIN")
				.requestMatchers("/statistics-page/**").hasAnyRole("USER", "ADMIN")
				.requestMatchers("/user-page/**").hasAnyRole("USER", "ADMIN")
				.requestMatchers("/user-products-page/**").hasAnyRole("USER", "ADMIN")
				.requestMatchers("/user-setting-page/**").hasAnyRole("USER", "ADMIN")
				.requestMatchers("/favorite-products-page/**").hasAnyRole("USER", "ADMIN")
				.requestMatchers("/help-center-page/**").hasAnyRole("USER", "ADMIN")
				.requestMatchers("/admin-panel-page/**").hasAnyRole("USER", "ADMIN")
				.requestMatchers("/admin-global-invent-page/**").hasAnyRole("USER", "ADMIN")
				.requestMatchers("/admin-global-transac-page/**").hasAnyRole("USER", "ADMIN")
				.requestMatchers("/admin-user-managment-page/**").hasAnyRole("USER", "ADMIN")
				
                .anyRequest().authenticated()
            )
            .formLogin(formLogin -> formLogin
                .loginPage("/login-page")
                .failureUrl("/login-error-page")
                .defaultSuccessUrl("/")
                .permitAll())
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/")
                .permitAll());

        return http.build();
    }
}
