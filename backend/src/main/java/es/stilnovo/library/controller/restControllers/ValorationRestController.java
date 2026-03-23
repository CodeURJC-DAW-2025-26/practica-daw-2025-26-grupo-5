package es.stilnovo.library.controller.restControllers;

import java.net.URI;
import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import es.stilnovo.library.dto.PagedResponse;
import es.stilnovo.library.dto.ValorationDTO;
import es.stilnovo.library.dto.ValorationMapper;
import es.stilnovo.library.service.UserService;
import es.stilnovo.library.service.ValorationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1/valorations")
@Tag(name = "Valorations", description = "REST API for managing user reviews and ratings (valorations) for transactions")
public class ValorationRestController {

    @Autowired
    private ValorationService valorationService;

    @Autowired
    private UserService userService;

    @Autowired
    private ValorationMapper valorationMapper;

    /**
     * Retrieves a paginated list of all valorations in the system.
     * Use this for administrative views or global feedback lists.
     *
     * @param pageable Pagination and sorting information (default size: 10).
     * @return PagedResponse containing a list of ValorationDTOs and paging
     * metadata.
     */
    @GetMapping
    @Operation(summary = "Get all valorations", description = "Retrieves a paginated list of all valorations in the system")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Valorations retrieved successfully")
    })
    public PagedResponse<ValorationDTO> getAllValorations(@PageableDefault(size = 10) Pageable pageable) {
        var page = valorationService.findAll(pageable);
        return new PagedResponse<>(valorationMapper.toDTOs(page.getContent()),
                page.getNumber(), page.getSize(), page.getTotalElements(), page.isLast());
    }

    /**
     * Retrieves the details of a specific valoration by its unique identifier.
     *
     * @param id The ID of the valoration to retrieve.
     * @return ValorationDTO containing the feedback, stars, and associated user
     * data.
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get a valoration by ID", description = "Retrieves the details of a specific valoration by its unique identifier")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Valoration retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Valoration not found")
    })
    public ValorationDTO getValoration(@PathVariable Long id) {
        return valorationMapper.toDTO(valorationService.findById(id));
    }

    /**
     * Submits a new valoration for a completed transaction.
     * The buyer identity is automatically resolved from the security context.
     *
     * @param dto       The valoration data including stars, comment, and
     * transactionId.
     * @param principal The security context of the authenticated buyer.
     * @return ResponseEntity with 201 Created status, the URI of the new resource,
     * and the ValorationDTO.
     */
    @PostMapping
    @Operation(summary = "Create a valoration", description = "Submits a new valoration for a completed transaction")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Valoration created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized user"),
        @ApiResponse(responseCode = "404", description = "Transaction not found")
    })
    public ResponseEntity<ValorationDTO> createValoration(@RequestBody ValorationDTO dto, Principal principal) {
        // 1. Resolve buyer from current session
        var buyer = userService.findByName(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found: " + principal.getName()));

        // 2. Create the valoration via service layer
        var created = valorationService.createValoration(dto.transactionId(), dto.stars(), dto.comment(), buyer);

        // 3. Construct the URI for the newly created valoration
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.getId())
                .toUri();

        return ResponseEntity.created(location).body(new ValorationDTO(created));
    }

    /**
     * Updates an existing valoration (review).
     *
     * @param id        The ID of the valoration to update.
     * @param dto       The updated valoration data (stars and comment).
     * @param principal The security context of the authenticated user.
     * @return ResponseEntity containing the updated ValorationDTO.
     */
    @PatchMapping("/{id}")
    @Operation(summary = "Update a valoration", description = "Updates an existing valoration (stars and comment)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Valoration updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized user"),
        @ApiResponse(responseCode = "403", description = "Forbidden (not the author)"),
        @ApiResponse(responseCode = "404", description = "Valoration not found")
    })
    public ResponseEntity<ValorationDTO> updateValoration(
            @PathVariable Long id,
            @RequestBody ValorationDTO dto,
            Principal principal) {

        
        var currentUser = userService.findByName(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found: " + principal.getName()));

        
        valorationService.updateValoration(id, dto.stars(), dto.comment(), currentUser);

        
        var updated = valorationService.findById(id);

        return ResponseEntity.ok(valorationMapper.toDTO(updated));
    }

    /**
     * Deletes a valoration by its ID.
     * Only the author of the valoration or an admin can delete it.
     *
     * @param id        The ID of the valoration to delete.
     * @param principal The security context of the authenticated user.
     * @return ResponseEntity with 204 No Content status on success.
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a valoration", description = "Deletes a valoration by its ID. Only the author or an admin can delete it.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Valoration deleted successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized user"),
        @ApiResponse(responseCode = "403", description = "Forbidden (user is not the author nor an admin)"),
        @ApiResponse(responseCode = "404", description = "Valoration not found")
    })
    public ResponseEntity<Void> deleteValoration(@PathVariable Long id, Principal principal) {
        // 1. Resolve the authenticated user
        var currentUser = userService.findByName(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found: " + principal.getName()));

        // 2. Call service to delete (security checks are done inside the service)
        valorationService.deleteValoration(id, currentUser);

        // 3. Return 204 No Content
        return ResponseEntity.noContent().build();
    }
}