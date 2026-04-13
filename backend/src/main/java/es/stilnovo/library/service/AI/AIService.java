package es.stilnovo.library.service.AI;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import org.springframework.web.client.HttpClientErrorException;
import java.util.Map;
import java.util.List;

@Service
public class AIService {

    @Value("${google.ai.api.key:}")
    private String apiKey;

    private final String API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=";

    @SuppressWarnings("rawtypes")
    public String callAI(String prompt) {

        if (apiKey == null || apiKey.trim().isEmpty()) {
            return "AI Service is disabled. Please configure a valid API key (check readme documentation). You can put a normal description here as always.";
        }

        RestTemplate restTemplate = new RestTemplate();
        String url = API_URL + apiKey;

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", prompt)))));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            @SuppressWarnings("unchecked")
            Map<String, Object> body = (Map<String, Object>) response.getBody();

            if (body != null && body.containsKey("candidates")) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
                @SuppressWarnings("unchecked")
                Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                return (String) parts.get(0).get("text");
            }
            return "No se ha podido generar la descripción.";

        } catch (HttpClientErrorException e) {
            if (e.getStatusCode() == HttpStatus.TOO_MANY_REQUESTS) {
                // Log the quota issue for the developer
                System.err.println("AI QUOTA EXCEEDED: Limit of 20 requests reached.");
                return "The AI assistant is tired and has reached its daily limit. Please try again tomorrow.";
            }
            System.err.println("GOOGLE API ERROR: " + e.getResponseBodyAsString());
            return "The AI service is currently unavailable (" + e.getStatusCode() + ").";

        } catch (Exception e) {
            e.printStackTrace();
            return "Error interno al generar descripción.";
        }
    }
}