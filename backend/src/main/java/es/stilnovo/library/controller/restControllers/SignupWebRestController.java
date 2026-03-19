package es.stilnovo.library.controller.restControllers;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

import es.stilnovo.library.dto.SignupRequestDTO;
import es.stilnovo.library.dto.UserDTO;
import es.stilnovo.library.dto.UserMapper;
import es.stilnovo.library.service.SignupService;

@RestController
@RequestMapping("/api/v1/users")
public class SignupWebRestController {

	@Autowired
	private SignupService signupService;

	@Autowired
	private UserMapper userMapper;

	/**
	 * Registers a new user in the system.
	 * This endpoint supports multipart/form-data to allow profile picture uploads.
	 * Use @ModelAttribute instead of @RequestBody to handle form fields and files
	 * simultaneously.
	 *
	 * @param request        DTO containing the user registration data (username,
	 *                       email, password, etc.).
	 * @param profilePicture The optional profile image file sent from the client.
	 * @return 201 Created status with the new UserDTO and the profile location URI.
	 * @throws IOException If image processing fails during registration.
	 */
	@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<UserDTO> signup(
			@ModelAttribute SignupRequestDTO request,
			@RequestParam(required = false) MultipartFile profilePicture) throws IOException {

		// 1. Register the user passing the multipart file instead of null
		var created = userMapper.toDTO(signupService.registerUser(
				profilePicture,
				request.username(),
				request.email(),
				request.password(),
				request.confirmPassword()));

		// 2. Build the Location header pointing to the new user profile
		URI location = ServletUriComponentsBuilder.fromCurrentContextPath()
				.path("/api/v1/users/{id}/profile")
				.buildAndExpand(created.id())
				.toUri();

		return ResponseEntity.created(location).body(created);
	}
}
