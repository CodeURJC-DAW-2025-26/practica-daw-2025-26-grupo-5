package es.stilnovo.library.controller.restControllers;

import java.security.Principal;
import java.net.URI;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
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
import jakarta.validation.Valid;
import es.stilnovo.library.dto.PagedResponse;
import es.stilnovo.library.dto.InquiryUpdateRequestDTO;

/**
 * REST Controller for buyer-to-seller inquiries
 * Provides endpoints for creating and retrieving product inquiries
 */
@RestController
@RequestMapping("/api/v1/inquiries")
public class NotificationRestController {

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
	 * Updates an existing inquiry (e.g., updating its status or message).
	 * Security: Only authorized users (the owner) can perform this action.
	 *
	 * @param id The ID of the inquiry to update.
	 * @param request The DTO containing the updated fields.
	 * @param principal The security context of the authenticated user.
	 * @return ResponseEntity with 200 OK and the updated InquiryDTO.
	 */
	@PutMapping("/{id}")
	public ResponseEntity<InquiryDTO> updateInquiry(
			@PathVariable Long id,
			@Valid @RequestBody InquiryUpdateRequestDTO request,
			Principal principal) {

		// The service will verify ownership and perform the update
		var updatedInquiry = inquiryService.updateInquiry(id, request);
		
		return ResponseEntity.ok(inquiryMapper.toDTO(updatedInquiry));
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
	public ResponseEntity<Void> deleteInquiry(
			@PathVariable Long id) {
		var inquiryToDelete = inquiryService.findById(id);
		// The service will verify ownership before deleting
		inquiryService.deleteInquiry(inquiryToDelete);
		
		return ResponseEntity.noContent().build();
	}
}
