package es.stilnovo.library.controller.restControllers.AI;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import es.stilnovo.library.dto.AI.AIDescriptionRequestDTO;
import es.stilnovo.library.service.AI.AIService;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/v1/ai")
public class AIRestController {

    @Autowired
    private AIService aiService;

    @PostMapping("/generate-description")

    public ResponseEntity<String> generateDescription(@RequestBody AIDescriptionRequestDTO request) {

        // Security validation
        if (request.productName() == null || request.basicInfo() == null) {
            return ResponseEntity.badRequest().body("Faltan datos en la petición");
        }

        String prompt = "Actúa como un copywriter experto en artículos de lujo para un marketplace premium (estilo Wallapop de alta gama). "
                +
                "Tu objetivo es redactar la descripción de un producto para que un vendedor particular lo anuncie en la plataforma Stilnovo de forma irresistible. "
                +
                "Producto: " + request.productName() + ". " +
                "Información básica: " + request.basicInfo() + ". " +
                "REGLAS: " +
                "1. Usa un tono sofisticado, exclusivo y profesional. " +
                "2. La longitud máxima debe ser de 150 palabras (máximo 1000 caracteres). " +
                "3. No digas que Stilnovo vende el producto; redáctalo desde la perspectiva del dueño del artículo. " +
                "4. Responde ÚNICAMENTE con el texto de la descripción en ESPAÑOL.";

        return ResponseEntity.ok(aiService.callAI(prompt));
    }
}