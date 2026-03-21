package es.stilnovo.library.controller.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import es.stilnovo.library.security.jwt.AuthResponse;
import es.stilnovo.library.security.jwt.LoginRequest;
import es.stilnovo.library.security.jwt.UserLoginService;
import jakarta.servlet.http.HttpServletResponse;

/**
 * REST Controller for JWT authentication operations
 * 
 * This controller manages:
 * - User login with JWT token generation
 * - Token refresh using refresh tokens
 * - User logout with token invalidation
 * - Authentication state management via HTTP cookies
 * 
 * Uses: UserLoginService
 */
@RestController
@RequestMapping("/api/v1/auth")
public class LoginRestController {

	@Autowired
	private UserLoginService userLoginService;

	/**
	 * Authenticates user with credentials and returns JWT tokens
	 * @param loginRequest Contains username and password
	 * @param response HTTP response to set authentication cookies
	 * @return AuthResponse with JWT token and auth status
	 */
	@PostMapping("/login")
	public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest loginRequest, HttpServletResponse response) {
		return userLoginService.login(response, loginRequest);
	}

	/**
	 * Refreshes JWT token using a refresh token
	 * @param refreshToken The refresh token from HTTP cookies
	 * @param response HTTP response to set new authentication cookie
	 * @return AuthResponse with new JWT token
	 */
	@PostMapping("/refresh")
	public ResponseEntity<AuthResponse> refresh(
			@CookieValue(name = "RefreshToken", required = false) String refreshToken,
			HttpServletResponse response) {
		if (refreshToken == null || refreshToken.isBlank()) {
			return ResponseEntity.badRequest().body((new AuthResponse(AuthResponse.Status.FAILURE, "Missing refresh token")));
		}
		return userLoginService.refresh(response, refreshToken);
	}

	/**
	 * Logs out the current user by invalidating session tokens
	 * @param response HTTP response to clear authentication cookies
	 * @return AuthResponse with logout success status
	 */
	@PostMapping("/logout")
	public ResponseEntity<AuthResponse> logout(HttpServletResponse response) {
		userLoginService.logout(response);
		return ResponseEntity.ok(new AuthResponse(AuthResponse.Status.SUCCESS, "logout successfully"));
	}
}