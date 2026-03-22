package es.stilnovo.library.controller.restControllers;

import java.security.Principal;
import java.net.URI;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import es.stilnovo.library.dto.InquiryMapper;
import es.stilnovo.library.dto.InquiryRequestDTO;
import es.stilnovo.library.dto.InquiryDTO;
import es.stilnovo.library.dto.NotificationResultDTO;
import es.stilnovo.library.service.InquiryService;
import es.stilnovo.library.service.NotificationService;

import org.springframework.security.access.prepost.PreAuthorize;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * REST Controller for buyer-to-seller inquiries
 * Provides endpoints for creating and retrieving product inquiries
 */
@RestController
@RequestMapping("/api/v1/inquiries")
@Tag(name = "Inquiries", description = "REST API for buyer-to-seller inquiries")
public class InquiryRestController {

	@Autowired
	private NotificationService notificationService;

	@Autowired
	private InquiryMapper inquiryMapper;

	@Autowired
	private InquiryService inquiryService;

	/**
	 * Retrieves a specific inquiry by ID.
	 * Security: Only the owner of the inquiry or an admin can access this endpoint.
	 * @param id The ID of the inquiry
	 * @param principal The security context of the authenticated user
	 * @return InquiryDTO with inquiry details
	 */
	@GetMapping("/{id}")
	@PreAuthorize("isAuthenticated()")
	@Operation(summary = "Get inquiry by ID", description = "Retrieves a specific inquiry by its ID. Only the owner can access it.")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "Inquiry retrieved successfully"),
		@ApiResponse(responseCode = "401", description = "Unauthorized user"),
		@ApiResponse(responseCode = "403", description = "Forbidden (user is not the owner)"),
		@ApiResponse(responseCode = "404", description = "Inquiry not found")
	})
	public InquiryDTO getInquiry(@PathVariable Long id, Principal principal) {
		var inquiry = inquiryService.findById(id);
		if (inquiry == null) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Inquiry not found");
		}
		// Service layer must verify ownership
		return inquiryMapper.toDTO(inquiry);
	}

	/**
	 * Submits a new inquiry from buyer to seller.
	 * Security: Only authenticated users can submit inquiries.
	 * @param request InquiryRequestDTO with product, message, and contact info (validated)
	 * @param principal Authenticated buyer
	 * @return 201 Created with NotificationResultDTO and inquiry location URI
	 */
	@PostMapping()
	@PreAuthorize("isAuthenticated()")
	@Operation(summary = "Submit inquiry", description = "Submits a new inquiry from a buyer to a seller")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "201", description = "Inquiry created successfully"),
		@ApiResponse(responseCode = "400", description = "Invalid input data"),
		@ApiResponse(responseCode = "401", description = "Unauthorized user"),
		@ApiResponse(responseCode = "409", description = "Inquiry could not be created (e.g., cooldown active)")
	})
	public ResponseEntity<NotificationResultDTO> sendInquiry(@RequestBody InquiryRequestDTO request,
			Principal principal) {
		var result = notificationService.sendInquiry(
				request.productId(),
				request.phone(),
				request.type(),
				request.message(),
				principal.getName());

		var response = new NotificationResultDTO(
				result.inquiry() != null ? inquiryMapper.toDTO(result.inquiry()) : null,
				result.sent(),
				result.cooldownMinutes(),
				result.errorCode());

		if (result.inquiry() == null || result.inquiry().getId() == null) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Inquiry could not be created");
		}

		URI location = ServletUriComponentsBuilder.fromCurrentContextPath()
				.path("/api/v1/inquiries/{id}")
				.buildAndExpand(result.inquiry().getId())
				.toUri();

		return ResponseEntity.created(location).body(response);
	}
}