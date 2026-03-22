package es.stilnovo.library.controller.restControllers;

import java.io.IOException;
import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lowagie.text.DocumentException;

import es.stilnovo.library.controller.PdfController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * API endpoints for PDF document generation and export.
 */
@RestController
@RequestMapping("/api/v1")
@Tag(name = "PDF Export", description = "REST API for generating and exporting PDF documents (invoices, shipping labels, and statistics)")
public class PdfRestController {

    @Autowired
    private PdfController pdfController;

    /**
     * Exports a transaction invoice in PDF format.
     * * @param transactionId ID of the target transaction.
     * @param principal Authenticated user session.
     * @return PDF file as byte array.
     */
    @GetMapping(value = "/transactions/{transactionId}/invoice", produces = "application/pdf")
    @Operation(summary = "Export invoice PDF", description = "Exports a transaction invoice in PDF format")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Invoice PDF generated successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized user"),
        @ApiResponse(responseCode = "403", description = "Forbidden (user is not authorized to view this transaction)"),
        @ApiResponse(responseCode = "404", description = "Transaction not found"),
        @ApiResponse(responseCode = "500", description = "Error generating the PDF document")
    })
    public ResponseEntity<byte[]> exportInvoice(@PathVariable long transactionId, Principal principal)
            throws DocumentException, IOException {
        return pdfController.exportInvoice(transactionId, principal);
    }

    /**
     * Exports the shipping label for a transaction in PDF format.
     * * @param transactionId ID of the target transaction.
     * @param principal Authenticated user session.
     * @return PDF file as byte array.
     */
    @GetMapping(value = "/transactions/{transactionId}/shipping-label", produces = "application/pdf")
    @Operation(summary = "Export shipping label PDF", description = "Exports the shipping label for a transaction in PDF format")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Shipping label PDF generated successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized user"),
        @ApiResponse(responseCode = "403", description = "Forbidden (user is not authorized to view this transaction)"),
        @ApiResponse(responseCode = "404", description = "Transaction not found"),
        @ApiResponse(responseCode = "500", description = "Error generating the PDF document")
    })
    public ResponseEntity<byte[]> exportShippingLabel(@PathVariable long transactionId, Principal principal)
            throws DocumentException, IOException {
        return pdfController.exportShippingLabel(transactionId, principal);
    }

    /**
     * Exports a PDF report of the authenticated user's statistics.
     * * @param principal Authenticated user session.
     * @return PDF report as byte array.
     */
    @GetMapping(value = "/users/me/statistics-report", produces = "application/pdf")
    @Operation(summary = "Export user statistics report PDF", description = "Exports a PDF report of the authenticated user's statistics")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Statistics report PDF generated successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized user"),
        @ApiResponse(responseCode = "500", description = "Error generating the PDF document")
    })
    public ResponseEntity<byte[]> exportStatistics(Principal principal) throws DocumentException, IOException {
        return pdfController.exportStatistics(principal);
    }
}