package es.stilnovo.library.controller;

import es.stilnovo.library.dto.ValorationDTO;
import es.stilnovo.library.service.ValorationService;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import es.stilnovo.library.service.UserService;

import java.security.Principal;
import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/reviews") // Todas las URLs de la API empezarán así
public class ValorationRestController {

    @Autowired
    private ValorationService valorationService;

    @Autowired
    private UserService userService;

    // Obtener todas las valoraciones (Versión API)
    @GetMapping
    public List<ValorationDTO> getAllValorations() {
        return valorationService.findAll().stream()
                .map(ValorationDTO::new)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ValorationDTO getValoration(@PathVariable Long id) {
        return new ValorationDTO(valorationService.findById(id));
    }

    // Crear una valoración nueva
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