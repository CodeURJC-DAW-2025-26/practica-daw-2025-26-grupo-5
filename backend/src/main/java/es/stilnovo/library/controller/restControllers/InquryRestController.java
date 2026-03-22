package es.stilnovo.library.controller.restControllers;

import java.security.Principal;
import java.net.URI;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;

import es.stilnovo.library.dto.InquiryMapper;
import es.stilnovo.library.dto.InquiryRequestDTO;
import es.stilnovo.library.dto.InquiryDTO;
import es.stilnovo.library.dto.NotificationResultDTO;
import es.stilnovo.library.service.InquiryService;
import es.stilnovo.library.service.NotificationService;
import es.stilnovo.library.dto.PagedResponse;

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
public class InquryRestController {

	@Autowired
	private NotificationService notificationService;

	@Autowired
	private InquiryMapper inquiryMapper;

	@Autowired
	private InquiryService inquiryService;

	/**
	 * Retrieves a specific inquiry by ID
	 * @param id The ID of the inquiry
	 * @return InquiryDTO with inquiry details
	 */
	@GetMapping("/{id}")
	@Operation(summary = "Get inquiry by ID", description = "Retrieves a specific inquiry by its ID")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "Inquiry retrieved successfully"),
		@ApiResponse(responseCode = "401", description = "Unauthorized user"),
		@ApiResponse(responseCode = "404", description = "Inquiry not found")
	})
	public InquiryDTO getInquiry(@PathVariable Long id) {
		return inquiryMapper.toDTO(inquiryService.findById(id));
	}

	/**
	 * Submits a new inquiry from buyer to seller
	 * @param request InquiryRequestDTO with product, message, and contact info
	 * @param principal Authenticated buyer
	 * @return 201 Created with NotificationResultDTO and inquiry location URI
	 */
	@PostMapping()
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

	/**
	 * Retrieves a paginated list of inquiries for the authenticated user.
	 * Spring automatically maps the "?page=0&size=10" query parameters 
	 * into the Pageable object.
	 * * @param principal The security context of the authenticated user.
	 * @param pageable  Pagination and sorting parameters.
	 * @return A paginated response containing a list of InquiryDTOs.
	 */
	@GetMapping
	@Operation(summary = "List user inquiries", description = "Retrieves a paginated list of inquiries for the authenticated user")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "Inquiries retrieved successfully"),
		@ApiResponse(responseCode = "401", description = "Unauthorized user")
	})
	public PagedResponse<InquiryDTO> listInquiries(
			Principal principal,
			@PageableDefault(size = 10) Pageable pageable) {

		// 1. Fetch the paginated entities from the service using the current username
		var page = inquiryService.getUserInquiries(principal.getName(), pageable);

		// 2. Map the results to DTOs and wrap them in the PagedResponse record
		return new PagedResponse<>(
				inquiryMapper.toDTOs(page.getContent()),
				page.getNumber(),
				page.getSize(),
				page.getTotalElements(),
				page.isLast()
		);
	}

	/**
	 * Deletes a specific inquiry by its ID.
	 * Security: The service layer must verify that the user requesting the 
	 * deletion is the actual owner of the inquiry.
	 *
	 * @param id The ID of the inquiry to delete.
	 * @param principal The security context of the authenticated user.
	 * @return ResponseEntity with 204 No Content status.
	 */
	@DeleteMapping("/{id}")
	@Operation(summary = "Delete inquiry", description = "Deletes a specific inquiry by its ID. The requesting user must be the owner.")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "204", description = "Inquiry deleted successfully"),
		@ApiResponse(responseCode = "401", description = "Unauthorized user"),
		@ApiResponse(responseCode = "403", description = "Forbidden (user is not the owner)"),
		@ApiResponse(responseCode = "404", description = "Inquiry not found")
	})
	public ResponseEntity<Void> deleteInquiry(
			@PathVariable Long id) {
		var inquiryToDelete = inquiryService.findById(id);
		// The service will verify ownership before deleting
		inquiryService.deleteInquiry(inquiryToDelete);
		
		return ResponseEntity.noContent().build();
	}
}