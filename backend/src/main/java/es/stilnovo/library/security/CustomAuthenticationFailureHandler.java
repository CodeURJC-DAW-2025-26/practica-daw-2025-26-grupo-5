package es.stilnovo.library.security;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import es.stilnovo.library.model.User;
import es.stilnovo.library.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * CustomAuthenticationFailureHandler for login attempt failures
 * Checks if user is banned before redirecting to appropriate error page
 */
@Component
public class CustomAuthenticationFailureHandler implements AuthenticationFailureHandler {

    @Autowired
    private UserRepository userRepository;

    /**
     * Handle authentication failure by redirecting to appropriate page
     * Banned users go to /banned, others to /login-error
     * @param request the HTTP request
     * @param response the HTTP response
     * @param exception the authentication exception
     * @throws IOException if response write fails
     * @throws ServletException if servlet operation fails
     */
    @Override
    public void onAuthenticationFailure(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception)
            throws IOException, ServletException {

        String username = request.getParameter("username");

        if (username != null) {
            User user = userRepository.findByName(username).orElse(null);

            if (user != null && user.isBanned()) {
                response.sendRedirect("/banned");
                return;
            }
        }

        response.sendRedirect("/login-error");
    }
}

