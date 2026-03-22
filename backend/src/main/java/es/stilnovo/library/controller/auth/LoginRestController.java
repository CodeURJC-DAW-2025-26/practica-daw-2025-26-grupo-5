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

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * REST Controller for JWT authentication operations
 * * This controller manages:
 * - User login with JWT token generation
 * - Token refresh using refresh tokens
 * - User logout with token invalidation
 * - Authentication state management via HTTP cookies
 * * Uses: UserLoginService
 */
@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "REST API for JWT Authentication")
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
	@Operation(summary = "User login", description = "Authenticates user with credentials and returns JWT tokens")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "Successful authentication"),
		@ApiResponse(responseCode = "401", description = "Invalid credentials")
	})
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
	@Operation(summary = "Refresh JWT token", description = "Refreshes JWT token using a refresh token from HTTP cookies")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "Token refreshed successfully"),
		@ApiResponse(responseCode = "400", description = "Missing refresh token"),
		@ApiResponse(responseCode = "401", description = "Invalid or expired refresh token")
	})
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
	@Operation(summary = "User logout", description = "Logs out the current user by invalidating session tokens")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "Logged out successfully")
	})
	public ResponseEntity<AuthResponse> logout(HttpServletResponse response) {
		userLoginService.logout(response);
		return ResponseEntity.ok(new AuthResponse(AuthResponse.Status.SUCCESS, "logout successfully"));
	}
}