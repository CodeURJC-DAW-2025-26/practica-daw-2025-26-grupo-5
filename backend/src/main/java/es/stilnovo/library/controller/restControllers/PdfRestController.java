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

/**
 * API endpoints for PDF document generation and export.
 */
@RestController
@RequestMapping("/api/v1")
public class PdfRestController {

    @Autowired
    private PdfController pdfController;

    /**
     * Exports a transaction invoice in PDF format.
     * * @param transactionId ID of the target transaction.
     * @param principal Authenticated user session.
     * @return PDF file as byte array.
     */
    @GetMapping("/transactions/{transactionId}/invoice")
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
    @GetMapping("/transactions/{transactionId}/shipping-label")
    public ResponseEntity<byte[]> exportShippingLabel(@PathVariable long transactionId, Principal principal)
            throws DocumentException, IOException {
        return pdfController.exportShippingLabel(transactionId, principal);
    }

    /**
     * Exports a PDF report of the authenticated user's statistics.
     * * @param principal Authenticated user session.
     * @return PDF report as byte array.
     */
    @GetMapping("/users/me/statistics-report")
    public ResponseEntity<byte[]> exportStatistics(Principal principal) throws DocumentException, IOException {
        return pdfController.exportStatistics(principal);
    }
}