package es.stilnovo.library.controller;

import es.stilnovo.library.dto.ValorationDTO;
import es.stilnovo.library.service.ValorationService;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/valorations") // Todas las URLs de la API empezarán así
public class ValorationRestController {

    @Autowired
    private ValorationService valorationService;

    // Obtener todas las valoraciones (Versión API)
    @GetMapping("/")
    public List<ValorationDTO> getAllValorations() {
        return valorationService.findAll().stream()
                .map(ValorationDTO::new)
                .collect(Collectors.toList());
    }

    // Crear una valoración nueva
    @PostMapping("/")
    public ResponseEntity<ValorationDTO> createValoration(@RequestBody ValorationDTO dto, Principal principal) {
        // Aquí llamarías a tu servicio pasando los datos del DTO
        // El servicio sigue haciendo la lógica pesada de base de datos
        // Devolvemos 201 Created
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }
}