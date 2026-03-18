package es.stilnovo.library.controller;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.security.Principal;
import java.time.format.DateTimeFormatter;
import java.util.UUID;
import java.text.DecimalFormat;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.lowagie.text.pdf.draw.LineSeparator;

import es.stilnovo.library.model.Transaction;
import es.stilnovo.library.service.TransactionService;
import es.stilnovo.library.service.UserService;

/** Controller for generating and serving PDF invoices/receipts for transactions */
@Controller
public class PdfController {

    // Identity constants based on Stilnovo Visual Identity [cite: 39-42]
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
    private static final DecimalFormat CURRENCY = new DecimalFormat("#,##0.00");
    private static final Color BRAND_BLUE = new Color(47, 108, 237); // Stilnovo #2f6ced [cite: 39]
    private static final Color BRAND_LIGHT = new Color(236, 241, 254);
    private static final Color DANGER_RED = new Color(220, 53, 69);

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private UserService userService;

    /**
     * Build an ultra-detailed invoice with professional breakdown. 
     */
    @GetMapping("/pdf/invoice/{transactionId}")
    public ResponseEntity<byte[]> exportInvoice(@PathVariable long transactionId, Principal principal)
            throws DocumentException, IOException {
        
        // Use service layer for data access and security validation
        Transaction t = transactionService.getTransactionForInvolvedUser(transactionId, principal.getName());
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 45, 45, 45, 45);
        PdfWriter.getInstance(doc, out);
        doc.open();

        addBrandHeader(doc, "STILNOVO PURCHASE INVOICE", loadLogoBytes());

        // Parties Data (Buyer/Seller blocks) [cite: 139-147]
        PdfPTable parties = new PdfPTable(2);
        parties.setWidthPercentage(100);
        parties.setSpacingBefore(15f);
        parties.addCell(infoBox("BILLED TO (Buyer)", t.getBuyer().getName() + "\nEmail: " + t.getBuyer().getEmail()));
        parties.addCell(infoBox("SOLD BY (Seller)", t.getSeller().getName() + "\nSeller Card ID: STN-" + t.getSeller().getUserId()));
        doc.add(parties);

        // Technical Metadata
        doc.add(new Paragraph("\nTRANSACTION DATA", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, BRAND_BLUE)));
        doc.add(new Paragraph("Internal Reference: " + UUID.randomUUID().toString().toUpperCase(), FontFactory.getFont(FontFactory.HELVETICA, 8)));
        doc.add(new Paragraph("Completion Date: " + t.getCreatedAt().format(DATE_FORMATTER), FontFactory.getFont(FontFactory.HELVETICA, 8)));
        
        // Product Line Item [cite: 148-150]
        PdfPTable table = new PdfPTable(new float[]{4, 1, 1});
        table.setWidthPercentage(100);
        table.setSpacingBefore(20f);
        table.addCell(headerCell("Product Description"));
        table.addCell(headerCell("VAT %"));
        table.addCell(headerCell("Total"));
        table.addCell(valueCell(t.getProduct().getName() + "\nREF_ID: " + t.getProduct().getId()));
        table.addCell(valueCell("21%"));
        table.addCell(valueCell(formatCurrency(t.getFinalPrice())));
        doc.add(table);

        // Financial Breakdown (VAT, Fees) - delegated to service
        TransactionService.InvoiceBreakdown breakdown = transactionService.calculateInvoiceBreakdown(t.getFinalPrice());

        PdfPTable totals = new PdfPTable(2);
        totals.setWidthPercentage(45);
        totals.setHorizontalAlignment(Element.ALIGN_RIGHT);
        totals.addCell(summaryLabel("Net Subtotal:")); totals.addCell(summaryValue(formatCurrency(breakdown.base())));
        totals.addCell(summaryLabel("Stilnovo Fee:")); totals.addCell(summaryValue(formatCurrency(breakdown.fees())));
        totals.addCell(summaryLabel("Applicable VAT (21%):")); totals.addCell(summaryValue(formatCurrency(breakdown.vat())));
        
        PdfPCell totalLab = summaryLabel("TOTAL PAID:"); 
        totalLab.setBackgroundColor(BRAND_BLUE); 
        totalLab.setPhrase(new Phrase("TOTAL PAID:", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE)));
        totals.addCell(totalLab);
        
        PdfPCell totalVal = summaryValue(formatCurrency(breakdown.total())); 
        totalVal.setBackgroundColor(BRAND_BLUE); 
        totalVal.setPhrase(new Phrase(formatCurrency(breakdown.total()), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Color.WHITE)));
        totals.addCell(totalVal);
        doc.add(totals);

        addFooter(doc, "This document serves as proof of purchase within the Stilnovo ecosystem.");
        doc.close();
        
        return pdfResponse(out, "Invoice_STN_" + t.getTransactionId() + ".pdf");
    }

    /**
     * Build shipping label with fragile warnings and logistics data. [cite: 159-181]
     */
    @GetMapping("/pdf/shipping-label/{transactionId}")
    public ResponseEntity<byte[]> exportShippingLabel(@PathVariable long transactionId, Principal principal)
            throws DocumentException, IOException {
        
        // Use service layer for data access and security validation (seller only)
        Transaction t = transactionService.getTransactionForSeller(transactionId, principal.getName());
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(new Rectangle(420, 595), 30, 30, 30, 30);
        PdfWriter.getInstance(doc, out);
        doc.open();

        addBrandHeader(doc, "STILNOVO LOGISTICS LABEL", loadLogoBytes());

        // Address blocks 
        PdfPTable grid = new PdfPTable(1);
        grid.setWidthPercentage(100);
        grid.addCell(infoBox("SENDER (Seller Info)", t.getSeller().getName() + "\n" + t.getSeller().getEmail()));
        
        PdfPCell receiver = new PdfPCell();
        receiver.setPadding(15f);
        receiver.setBorderWidth(2f);
        receiver.setBorderColor(BRAND_BLUE);
        receiver.addElement(new Paragraph("SHIP TO (Customer)", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, BRAND_BLUE)));
        receiver.addElement(new Paragraph(t.getBuyer().getName(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14)));
        receiver.addElement(new Paragraph(t.getProduct().getLocation(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12)));
        grid.addCell(receiver);
        doc.add(grid);

        // Logistics details 
        doc.add(new Paragraph("\nLOGISTICS INFO", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, BRAND_BLUE)));
        addKeyValueLine(doc, "Tracking ID: ", "STN-TRK-" + UUID.randomUUID().toString().substring(0,8).toUpperCase(), 9);
        addKeyValueLine(doc, "Package Weight: ", "1.450 KG", 9);

        // QR Code 
        byte[] qr = loadQrBytes();
        if (qr != null) {
            Image img = Image.getInstance(qr);
            img.scaleToFit(100, 100);
            img.setAlignment(Element.ALIGN_CENTER);
            doc.add(img);
            Paragraph p = new Paragraph("SCAN TO VERIFY RECEIPT", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, Color.GRAY));
            p.setAlignment(Element.ALIGN_CENTER);
            doc.add(p);
        }

        // --- WARNING FRIKADA (Corrected Styles) ---
        PdfPTable warning = new PdfPTable(1);
        warning.setWidthPercentage(100);
        warning.setSpacingBefore(15f);
        
        PdfPCell warnCell = new PdfPCell(new Phrase("FRAGILE: HANDLE WITH CARE - HIGH VALUE DESIGN ITEM", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE)));
        warnCell.setBackgroundColor(DANGER_RED);
        warnCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        warnCell.setPadding(10f);
        warnCell.setBorder(Rectangle.NO_BORDER);
        
        warning.addCell(warnCell);
        doc.add(warning);

        doc.close();
        return pdfResponse(out, "Shipping_Label_ST_" + t.getTransactionId() + ".pdf");
    }

    // --- UTILITIES ---

    private void addBrandHeader(Document doc, String title, byte[] logo) throws DocumentException {
        PdfPTable h = new PdfPTable(2);
        h.setWidthPercentage(100);
        h.setWidths(new float[]{4, 1});
        PdfPCell t = new PdfPCell(new Phrase(title, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, BRAND_BLUE)));
        t.setBorder(Rectangle.NO_BORDER);
        t.setVerticalAlignment(Element.ALIGN_MIDDLE);
        h.addCell(t);
        PdfPCell l = new PdfPCell();
        l.setBorder(Rectangle.NO_BORDER);
        if (logo != null) { try { Image i = Image.getInstance(logo); i.scaleToFit(45, 45); l.addElement(i); } catch (Exception e) {} }
        h.addCell(l);
        doc.add(h);
        doc.add(new LineSeparator(1.5f, 100, BRAND_BLUE, Element.ALIGN_CENTER, -2));
    }

    private PdfPCell infoBox(String title, String content) {
        PdfPCell c = new PdfPCell();
        c.setPadding(10f);
        c.setBackgroundColor(BRAND_LIGHT);
        c.setBorderColor(Color.WHITE);
        c.setBorderWidth(3f);
        c.addElement(new Paragraph(title, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, BRAND_BLUE)));
        c.addElement(new Paragraph(content, FontFactory.getFont(FontFactory.HELVETICA, 9, Color.DARK_GRAY)));
        return c;
    }

    /**
     * Export user statistics as a professional PDF document.
     * Uses Principal for secure authentication - no ID parameters needed.
     */
    @GetMapping("/pdf/statistics")
    public ResponseEntity<byte[]> exportStatistics(Principal principal) throws DocumentException, IOException {
        
        // Use service layer for data access and security validation
        java.util.List<Transaction> transactions = transactionService.getSellerTransactions(principal.getName());
        
        // Calculate statistics
        double totalSales = transactions.stream()
            .mapToDouble(Transaction::getFinalPrice)
            .sum();
        
        int itemsSold = transactions.size();
        
        double avgRating = userService.getAverageRatingForSeller(principal.getName());
        
        // Calculate Inventory Value (sum of all products)
        double inventoryValue = userService.calculateInventoryValue(principal.getName());
        
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 45, 45, 45, 45);
        PdfWriter.getInstance(doc, out);
        doc.open();

        // Add professional header
        addBrandHeader(doc, "STILNOVO STATISTICS REPORT", loadLogoBytes());

        // Statistics Summary Section
        doc.add(new Paragraph("\nPERFORMANCE OVERVIEW", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, BRAND_BLUE)));
        doc.add(new Paragraph(""));
        
        PdfPTable stats = new PdfPTable(4);
        stats.setWidthPercentage(100);
        stats.setSpacingBefore(10f);
        stats.setSpacingAfter(20f);
        
        stats.addCell(headerCell("Total Sales"));
        stats.addCell(headerCell("Items Sold"));
        stats.addCell(headerCell("Inventory Value"));
        stats.addCell(headerCell("Avg. Rating"));
        
        stats.addCell(valueCell(formatCurrency(totalSales)));
        stats.addCell(valueCell(String.valueOf(itemsSold)));
        stats.addCell(valueCell(formatCurrency(inventoryValue)));
        stats.addCell(valueCell(avgRating + " ⭐"));
        
        doc.add(stats);
        
        // Transaction Details
        if (!transactions.isEmpty()) {
            doc.add(new Paragraph("\nRECENT TRANSACTIONS", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, BRAND_BLUE)));
            
            PdfPTable tTable = new PdfPTable(new float[]{2, 2, 2, 1});
            tTable.setWidthPercentage(100);
            tTable.setSpacingBefore(10f);
            
            tTable.addCell(headerCell("Product"));
            tTable.addCell(headerCell("Buyer"));
            tTable.addCell(headerCell("Amount"));
            tTable.addCell(headerCell("Date"));
            
            transactions.stream().limit(15).forEach(t -> {
                tTable.addCell(valueCell(t.getProduct().getName()));
                tTable.addCell(valueCell(t.getBuyer().getName()));
                tTable.addCell(valueCell(formatCurrency(t.getFinalPrice())));
                tTable.addCell(valueCell(t.getCreatedAt() != null ? t.getCreatedAt().format(DATE_FORMATTER) : "N/A"));
            });
            
            doc.add(tTable);
        }
        
        // Footer
        addFooter(doc, "Statistics Report Generated by Stilnovo Marketplace");
        doc.close();
        
        return pdfResponse(out, "Stilnovo_Statistics_Report.pdf");
    }

    // (Keep previous helper methods like pdfResponse, loadLogoBytes, formatCurrency)
    
    private void addFooter(Document doc, String note) throws DocumentException {
        doc.add(new Paragraph("\n"));
        Paragraph f = new Paragraph(note + "\nDigital Document protected by Stilnovo Security Layer.", FontFactory.getFont(FontFactory.HELVETICA, 8, Color.GRAY));
        f.setAlignment(Element.ALIGN_CENTER);
        doc.add(f);
    }

    private PdfPCell headerCell(String text) {
        PdfPCell c = new PdfPCell(new Phrase(text, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE)));
        c.setBackgroundColor(BRAND_BLUE);
        c.setPadding(6f);
        c.setBorderColor(Color.WHITE);
        return c;
    }

    private PdfPCell valueCell(String text) {
        PdfPCell c = new PdfPCell(new Phrase(text, FontFactory.getFont(FontFactory.HELVETICA, 9)));
        c.setPadding(6f);
        c.setBorderColor(new GrayColor(0.92f));
        return c;
    }

    private PdfPCell summaryLabel(String text) {
        PdfPCell c = new PdfPCell(new Phrase(text, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9)));
        c.setBorder(Rectangle.NO_BORDER);
        c.setPadding(4f);
        return c;
    }

    private PdfPCell summaryValue(String text) {
        PdfPCell c = new PdfPCell(new Phrase(text, FontFactory.getFont(FontFactory.HELVETICA, 9)));
        c.setBorder(Rectangle.NO_BORDER);
        c.setPadding(4f);
        c.setHorizontalAlignment(Element.ALIGN_RIGHT);
        return c;
    }

    private byte[] loadLogoBytes() { try (InputStream s = Thread.currentThread().getContextClassLoader().getResourceAsStream("static/images/logo.png")) { return (s != null) ? s.readAllBytes() : null; } catch (IOException e) { return null; } }
    private byte[] loadQrBytes() { try (InputStream s = Thread.currentThread().getContextClassLoader().getResourceAsStream("static/images/qr-stilnovo.png")) { return (s != null) ? s.readAllBytes() : null; } catch (IOException e) { return null; } }
    private String formatCurrency(double a) { return "$" + CURRENCY.format(a); }
    private ResponseEntity<byte[]> pdfResponse(ByteArrayOutputStream os, String n) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + n + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(os.toByteArray());
    }
    private void addKeyValueLine(Document doc, String l, String v, float s) throws DocumentException {
        Paragraph p = new Paragraph();
        p.add(new Phrase(l, FontFactory.getFont(FontFactory.HELVETICA_BOLD, s)));
        p.add(new Phrase(v, FontFactory.getFont(FontFactory.HELVETICA, s)));
        doc.add(p);
    }
}