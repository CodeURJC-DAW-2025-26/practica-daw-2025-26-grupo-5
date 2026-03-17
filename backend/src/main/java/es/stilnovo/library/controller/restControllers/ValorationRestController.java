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
@RequestMapping("/api/v1/reviews") // Todas las URLs de la API empezarán así
public class ValorationRestController {

    @Autowired
    private ValorationService valorationService;

    @Autowired
    private UserService userService;

    @Autowired
    private ValorationMapper valorationMapper;

    @GetMapping
    public PagedResponse<ValorationDTO> getAllValorations(@PageableDefault(size = 10) Pageable pageable) {
        var page = valorationService.findAll(pageable);
        return new PagedResponse<>(valorationMapper.toDTOs(page.getContent()),
                page.getNumber(), page.getSize(), page.getTotalElements(), page.isLast());
    }

    @GetMapping("/{id}")
    public ValorationDTO getValoration(@PathVariable Long id) {
        return valorationMapper.toDTO(valorationService.findById(id));
    }

    // Create a new valoration
    @PostMapping
    public ResponseEntity<ValorationDTO> createValoration(@RequestBody ValorationDTO dto, Principal principal) {
        var buyer = userService.findByName(principal.getName()).orElseThrow();
        var created = valorationService.createValoration(dto.transactionId(), dto.stars(), dto.comment(), buyer);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.getId())
                .toUri();
        return ResponseEntity.created(location).body(new ValorationDTO(created));
    }
}