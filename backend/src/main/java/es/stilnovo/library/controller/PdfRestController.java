package es.stilnovo.library.controller;

import java.io.IOException;
import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lowagie.text.DocumentException;

@RestController
@RequestMapping("/api/v1/pdfs")
public class PdfRestController {

	@Autowired
	private PdfController pdfController;

	@GetMapping("/invoice/{transactionId}")
	public ResponseEntity<byte[]> exportInvoice(@PathVariable long transactionId, Principal principal)
			throws DocumentException, IOException {
		return pdfController.exportInvoice(transactionId, principal);
	}

	@GetMapping("/shipping-label/{transactionId}")
	public ResponseEntity<byte[]> exportShippingLabel(@PathVariable long transactionId, Principal principal)
			throws DocumentException, IOException {
		return pdfController.exportShippingLabel(transactionId, principal);
	}

	@GetMapping("/statistics")
	public ResponseEntity<byte[]> exportStatistics(Principal principal) throws DocumentException, IOException {
		return pdfController.exportStatistics(principal);
	}
}
