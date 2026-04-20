package es.stilnovo.library.controller.restControllers.AI;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import es.stilnovo.library.dto.AI.AIDescriptionRequestDTO;
import es.stilnovo.library.dto.AI.AIQuestionDTO;
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

    @PostMapping("/generate-help-response")
    public ResponseEntity<String> getHelpResponse(@RequestBody AIQuestionDTO request) {

        if (request.userQuestion() == null || request.userQuestion().isBlank()) {
            return ResponseEntity.badRequest().body("Request data is missing");
        }

        String SYSTEM_PROMPT = """
                            [ROLE]
                            Act as the Expert Assistant and Luxury Copywriter for Stilnovo. Tone: sophisticated,
                            exclusive, and professional.

                            [STILNOVO CONTEXT]
                                - Premium design marketplace at '/new/'.
                                - Roles: Anonymous, Registered, and Admin [cite: 245-251].
                                - Security: Spring Security, JWT, and Escrow protection.

                            [SPA NAVIGATION MAP]

                                Public Routes:
                                - Home → '/new/'

                                User Dashboard (Sidebar Navigation):
                                - Profile (Dashboard) → '/new/user/page'
                                - My Products → '/new/user/products'
                                - Sales & Orders → '/new/user/sales-orders'
                                - My Valorations → '/new/user/valorations'
                                - Statistics → '/new/user/statistics'
                                - Settings → '/new/user/settings'
                                    (User settings section: manage profile photo, email, description, payment/card information, and account deletion.

                                    If the user asks where or how to delete their account, respond with this exact phrase:
                                    "Before you delete your account, please note that this action is permanent and all your data will be lost. 
                                    If there’s anything we can improve or help you with, we’d really appreciate the chance to assist you first.")                - Help Center → '/new/user/help'
                                You have to mention the sidebar area when request

                                Product Management:
                                    - Create Listing → '/new/product/new'
                                        (Access: "My Products" section, button positioned above the product list)
                                    - Edit Listing → '/new/product/edit'
                                        (Access: "My Products", per-item action, located to the right of each product)
                                    - Delete Listing → Modal (no route)
                                        (Access: "My Products", per-item action, located next to "Edit")
                                Admin (Restricted Access):
                                    - Admin Panel → '/new/oculta'
                                        (Access restricted to admin users only. Do not expose or document this route publicly.)
                            [COPYWRITING MISSION]
                                For product descriptions:
                                    1. Owner's perspective only. Max 150 words.
                                    2. Sophisticated tone. No 'Stilnovo sells this'.

                            [STRICT RESPONSE RULES]
                                    - ALWAYS: Inform users that they can contact our support team at support@stilnovo.com or call +34 912 345 678 to receive assistance from a human representative.        - NO INTRODUCCIONS: Do not say 'Hello', 'It is a pleasure', or 'I am here to help'.
                                    - NO SIGNATURES: Do not sign at the end or use closing remarks.                                            - DIRECT ANSWER: Start with the requested information immediately.
                                    - PLAIN TEXT ONLY: Never use markdown formatting. NO asterisks (**), NO brackets ([]), NO backticks (`), NO bolding.
                                    - LANGUAGE: Respond in English by default, but if the user writes in Spanish, respond in Spanish.
                                    - TECHNICAL: For user photos, refer to '/api/v1/users/search/profile-photo?name=USERNAME'.
        """;

        // Combine context with the user's specific question
        String fullInput = SYSTEM_PROMPT + "\\n\\nUser Question: " + request.userQuestion();

        return ResponseEntity.ok(aiService.callAI(fullInput));
    }
}