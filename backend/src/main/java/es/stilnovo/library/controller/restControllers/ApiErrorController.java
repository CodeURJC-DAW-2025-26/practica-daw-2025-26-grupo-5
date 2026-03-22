package es.stilnovo.library.controller.restControllers;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.boot.webmvc.error.ErrorController;
import org.springframework.http.ResponseEntity;
import java.util.Map;

/**
 * Custom error controller to handle both REST API errors and Web application errors.
 * This implementation overrides the default Spring Boot BasicErrorController.
 */
@Controller
public class ApiErrorController implements ErrorController {

    /**
     * Main error handling method.
     * Routes the error to a JSON response if it comes from the API, 
     * or to an HTML view if it comes from the web interface.
     */
    @RequestMapping("/error")
    public Object handleError(HttpServletRequest request, Model model) {
        // Retrieve error status code and the original request URI
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        String path = (String) request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI);

        // CASE 1: The request belongs to the REST API (/api/v1/**)
        if (path != null && path.startsWith("/api/v1")) {
            int statusCode = (status != null) ? Integer.parseInt(status.toString()) : 500;
            
            // Return a JSON response with the mandatory "Endpoint error:" prefix for grading
            return ResponseEntity
                .status(statusCode)
                .body(Map.of(
                    "status", statusCode,
                    "message", "Endpoint error: " + getErrorMessage(statusCode)
                ));
        }

        // CASE 2: The request belongs to the Web interface
        String errorCode = "Unknown Error";
        if (status != null) {
            errorCode = status.toString();
        }

        // Add attributes to the model for the Mustache error template (error.html)
        model.addAttribute("status", status != null ? (Integer) status : 500); // Prevents Mustache 'status' missing error
        model.addAttribute("error-code", errorCode);
        model.addAttribute("error-text", getErrorMessage(status != null ? Integer.parseInt(status.toString()) : 0));

        return "error"; // Resolves to src/main/resources/templates/error.html
    }

    /**
     * Helper method to provide consistent error descriptions across the application.
     */
    private String getErrorMessage(int statusCode) {
        return switch (statusCode) {
            case 400 -> "The request sent is invalid.";
            case 401 -> "Unauthorized access. Valid credentials or token required.";
            case 403 -> "Forbidden. You do not have the required role.";
            case 404 -> "The requested resource was not found.";
            case 500 -> "Internal server error. We are working to fix it.";
            default -> "An unexpected error has occurred.";
        };
    }
}