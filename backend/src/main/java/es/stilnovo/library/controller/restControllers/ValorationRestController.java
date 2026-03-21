package es.stilnovo.library.controller.restControllers;

import es.stilnovo.library.dto.PagedResponse;
import es.stilnovo.library.dto.ValorationDTO;
import es.stilnovo.library.dto.ValorationMapper;
import es.stilnovo.library.service.ValorationService;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import es.stilnovo.library.service.UserService;

import java.security.Principal;
import java.net.URI;

@RestController
@RequestMapping("/api/v1/valorations")
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
     *         metadata.
     */
    @GetMapping
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
     *         data.
     */
    @GetMapping("/{id}")
    public ValorationDTO getValoration(@PathVariable Long id) {
        return valorationMapper.toDTO(valorationService.findById(id));
    }

    /**
     * Submits a new valoration for a completed transaction.
     * The buyer identity is automatically resolved from the security context.
     *
     * @param dto       The valoration data including stars, comment, and
     *                  transactionId.
     * @param principal The security context of the authenticated buyer.
     * @return ResponseEntity with 201 Created status, the URI of the new resource,
     *         and the ValorationDTO.
     */
    @PostMapping
    public ResponseEntity<ValorationDTO> createValoration(@RequestBody ValorationDTO dto, Principal principal) {
        // 1. Resolve buyer from current session
        var buyer = userService.findByName(principal.getName()).orElseThrow();

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
     * Deletes a valoration by its ID.
     * Only the author of the valoration or an admin can delete it.
     *
     * @param id        The ID of the valoration to delete.
     * @param principal The security context of the authenticated user.
     * @return ResponseEntity with 204 No Content status on success.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteValoration(@PathVariable Long id, Principal principal) {
        // 1. Resolve the authenticated user
        var currentUser = userService.findByName(principal.getName()).orElseThrow();

        // 2. Call service to delete (security checks are done inside the service)
        valorationService.deleteValoration(id, currentUser);

        // 3. Return 204 No Content
        return ResponseEntity.noContent().build();
    }
}