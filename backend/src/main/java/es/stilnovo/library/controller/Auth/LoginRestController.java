package es.stilnovo.library.controller.Auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import es.stilnovo.library.security.jwt.AuthResponse;
import es.stilnovo.library.security.jwt.LoginRequest;
import es.stilnovo.library.security.jwt.UserLoginService;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/v1/sessions")
public class LoginRestController {

	@Autowired
	private UserLoginService userLoginService;

	@PostMapping
	public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest loginRequest, HttpServletResponse response) {
		return userLoginService.login(response, loginRequest);
	}

	@PostMapping("/refresh")
	public ResponseEntity<AuthResponse> refresh(
			@CookieValue(name = "RefreshToken", required = false) String refreshToken,
			HttpServletResponse response) {
		if (refreshToken == null || refreshToken.isBlank()) {
			return ResponseEntity.ok(new AuthResponse(AuthResponse.Status.FAILURE, "Missing refresh token"));
		}
		return userLoginService.refresh(response, refreshToken);
	}

	@DeleteMapping("/current")
	public ResponseEntity<AuthResponse> logout(HttpServletResponse response) {
		userLoginService.logout(response);
		return ResponseEntity.ok(new AuthResponse(AuthResponse.Status.SUCCESS, "logout successfully"));
	}
}
