package es.stilnovo.library.controller.restControllers;

import java.security.Principal;
import java.net.URI;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
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

/**
 * REST Controller for buyer-to-seller inquiries
 * Provides endpoints for creating and retrieving product inquiries
 */
@RestController
@RequestMapping("/api/v1/notifications")
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
	@GetMapping("/inquiries/{id}")
	public InquiryDTO getInquiry(@PathVariable Long id) {
		return inquiryMapper.toDTO(inquiryService.findById(id));
	}

	/**
	 * Submits a new inquiry from buyer to seller
	 * @param request InquiryRequestDTO with product, message, and contact info
	 * @param principal Authenticated buyer
	 * @return 201 Created with NotificationResultDTO and inquiry location URI
	 */
	@PostMapping("/inquiries")
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
				.path("/api/v1/notifications/inquiries/{id}")
				.buildAndExpand(result.inquiry().getId())
				.toUri();

		return ResponseEntity.created(location).body(response);
	}
}
