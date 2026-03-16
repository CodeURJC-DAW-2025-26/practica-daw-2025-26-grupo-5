package es.stilnovo.library.controller;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
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

	@PostMapping
	public ResponseEntity<UserDTO> signup(@RequestBody SignupRequestDTO request) throws IOException {
		var created = userMapper.toDTO(signupService.registerUser(
				null,
				request.username(),
				request.email(),
				request.password(),
				request.confirmPassword()));

		URI location = ServletUriComponentsBuilder.fromCurrentContextPath()
				.path("/api/v1/users/{id}/profile")
				.buildAndExpand(created.id())
				.toUri();

		return ResponseEntity.status(HttpStatus.CREATED).location(location).body(created);
	}
}
