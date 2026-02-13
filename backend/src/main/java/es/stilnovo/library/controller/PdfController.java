package es.stilnovo.library.controller;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.security.Principal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.text.DecimalFormat;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Image;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfPageEventHelper;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.draw.LineSeparator;
import com.lowagie.text.pdf.draw.VerticalPositionMark;
import com.lowagie.text.pdf.GrayColor;
import com.lowagie.text.pdf.ColumnText;

import es.stilnovo.library.model.Product;
import es.stilnovo.library.model.User;
import es.stilnovo.library.repository.ProductRepository;
import es.stilnovo.library.repository.UserRepository;

@Controller
public class PdfController {

    private static final DateTimeFormatter DATE_ONLY = DateTimeFormatter.ofPattern("dd-MM-yyyy");
    private static final DecimalFormat CURRENCY = new DecimalFormat("#,##0.00");

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @GetMapping("/pdf/statistics/{id}")
    public ResponseEntity<byte[]> exportStatisticsPdf(@PathVariable long id, Principal principal)
            throws DocumentException, IOException {
        User user = validateUser(id, principal);
        return buildStatisticsPdf(user);
    }

    @GetMapping("/pdf/shipping-label/{id}")
    public ResponseEntity<byte[]> exportShippingLabel(@PathVariable long id, Principal principal)
            throws DocumentException, IOException {
        User user = validateUser(id, principal);
        return buildShippingLabelPdf(user);
    }

    @GetMapping("/pdf/invoice/{id}")
    public ResponseEntity<byte[]> exportInvoice(@PathVariable long id, Principal principal)
            throws DocumentException, IOException {
        User user = validateUser(id, principal);
        return buildInvoicePdf(user);
    }

    private User validateUser(long id, Principal principal) {
        if (principal == null) {
            throw new IllegalStateException("User not authenticated");
        }

        User user = userRepository.findById(id).orElseThrow();
        if (!principal.getName().equals(user.getName())) {
            throw new IllegalStateException("User mismatch");
        }

        return user;
    }

    private ResponseEntity<byte[]> buildStatisticsPdf(User user) throws DocumentException, IOException {
        List<Product> products = productRepository.findBySeller(user);
        double totalValue = products.stream().mapToDouble(Product::getPrice).sum();
        double avgPrice = products.isEmpty() ? 0.0 : totalValue / products.size();
        Map<String, Integer> categoryCounts = new HashMap<>();
        Map<String, Double> categoryTotals = new HashMap<>();

        for (Product product : products) {
            String category = product.getCategory() == null ? "Uncategorized" : product.getCategory();
            categoryCounts.put(category, categoryCounts.getOrDefault(category, 0) + 1);
            categoryTotals.put(category, categoryTotals.getOrDefault(category, 0.0) + product.getPrice());
        }

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        Document document = new Document();
        byte[] logoBytes = loadLogoBytes();
        PdfWriter writer = PdfWriter.getInstance(document, outputStream);
        writer.setPageEvent(new PdfPageDecorator());
        document.open();

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20);
        Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
        Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 11);
        Font mutedFont = FontFactory.getFont(FontFactory.HELVETICA, 9, new GrayColor(0.4f));

        addHeader(document, "Stilnovo Statistics Report", logoBytes);
        addKeyValueLine(document, "User: ", user.getName(), bodyFont);
        addKeyValueLine(document, "Email: ", user.getEmail(), bodyFont);
        addKeyValueLine(document, "Generated at: ", LocalDate.now().format(DATE_ONLY), mutedFont);
        document.add(new Paragraph(" "));
        document.add(new LineSeparator());

        document.add(new Paragraph("Overview", sectionFont));
        PdfPTable overview = new PdfPTable(2);
        overview.setWidthPercentage(100);
        overview.setSpacingBefore(8f);
        overview.setSpacingAfter(12f);
        overview.addCell(labelCell("Total Listings"));
        overview.addCell(valueCell(String.valueOf(products.size())));
        overview.addCell(labelCell("Total Inventory Value"));
        overview.addCell(valueCell(formatCurrency(totalValue)));
        overview.addCell(labelCell("Average Price"));
        overview.addCell(valueCell(formatCurrency(avgPrice)));
        overview.addCell(labelCell("User Rating"));
        overview.addCell(valueCell(user.getRating() == null ? "N/A" : String.valueOf(user.getRating())));
        document.add(overview);

        document.add(new Paragraph("Sales by Category", sectionFont));
        PdfPTable categories = new PdfPTable(3);
        categories.setWidthPercentage(100);
        categories.setSpacingBefore(8f);
        categories.setSpacingAfter(12f);
        categories.addCell(headerCell("Category"));
        categories.addCell(headerCell("Listings"));
        categories.addCell(headerCell("Value"));
        for (Map.Entry<String, Integer> entry : categoryCounts.entrySet()) {
            String category = entry.getKey();
            categories.addCell(valueCell(category));
            categories.addCell(valueCell(String.valueOf(entry.getValue())));
            categories.addCell(valueCell(formatCurrency(categoryTotals.get(category))));
        }
        if (categoryCounts.isEmpty()) {
            PdfPCell empty = new PdfPCell(new Phrase("No listings yet", bodyFont));
            empty.setColspan(3);
            empty.setPadding(6f);
            categories.addCell(empty);
        }
        document.add(categories);

        document.add(new Paragraph("Latest Listings", sectionFont));
        PdfPTable listings = new PdfPTable(4);
        listings.setWidthPercentage(100);
        listings.setSpacingBefore(8f);
        listings.addCell(headerCell("Name"));
        listings.addCell(headerCell("Category"));
        listings.addCell(headerCell("Status"));
        listings.addCell(headerCell("Price"));

        products.stream()
                .sorted(Comparator.comparing(Product::getId).reversed())
                .limit(8)
                .forEach(product -> {
                    listings.addCell(valueCell(product.getName()));
                    listings.addCell(valueCell(product.getCategory()));
                    listings.addCell(valueCell(product.getStatus()));
                    listings.addCell(valueCell(formatCurrency(product.getPrice())));
                });
        if (products.isEmpty()) {
            PdfPCell empty = new PdfPCell(new Phrase("No listings available", bodyFont));
            empty.setColspan(4);
            empty.setPadding(6f);
            listings.addCell(empty);
        }
        document.add(listings);

        document.add(new Paragraph(" "));
        Paragraph thankYou = new Paragraph("Thanks for using Stilnovo.", mutedFont);
        thankYou.setAlignment(Element.ALIGN_CENTER);
        document.add(thankYou);

        document.close();

        return pdfResponse(outputStream, "statistics.pdf");
    }

    private ResponseEntity<byte[]> buildInvoicePdf(User user) throws DocumentException, IOException {
        List<Product> products = productRepository.findBySeller(user);
        double subtotal = products.stream().mapToDouble(Product::getPrice).sum();
        double serviceFee = subtotal * 0.05;
        double total = subtotal + serviceFee;

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        Document document = new Document();
        byte[] logoBytes = loadLogoBytes();
        PdfWriter writer = PdfWriter.getInstance(document, outputStream);
        writer.setPageEvent(new PdfPageDecorator());
        document.open();

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20);
        Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
        Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 11);
        Font mutedFont = FontFactory.getFont(FontFactory.HELVETICA, 9, new GrayColor(0.4f));

        addHeader(document, "Stilnovo Invoice", logoBytes);
        Paragraph meta = new Paragraph();
        meta.add(new Phrase("Invoice ID: ", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11)));
        meta.add(new Phrase(buildReference("INV"), bodyFont));
        meta.add(new VerticalPositionMark());
        meta.add(new Phrase(" Date: ", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11)));
        meta.add(new Phrase(LocalDate.now().format(DATE_ONLY), bodyFont));
        document.add(meta);
        addKeyValueLine(document, "Billed to: ", user.getName() + " (" + user.getEmail() + ")", bodyFont);
        addKeyValueLine(document, "Status: ", "Pending Payment", mutedFont);
        document.add(new Paragraph(" "));
        document.add(new LineSeparator());

        document.add(new Paragraph("Line Items", sectionFont));
        PdfPTable items = new PdfPTable(4);
        items.setWidthPercentage(100);
        items.setSpacingBefore(8f);
        items.setSpacingAfter(12f);
        items.addCell(headerCell("Product"));
        items.addCell(headerCell("Category"));
        items.addCell(headerCell("Status"));
        items.addCell(headerCell("Price"));
        products.stream().limit(10).forEach(product -> {
            items.addCell(valueCell(product.getName()));
            items.addCell(valueCell(product.getCategory()));
            items.addCell(valueCell(product.getStatus()));
            items.addCell(valueCell(formatCurrency(product.getPrice())));
        });
        if (products.isEmpty()) {
            PdfPCell empty = new PdfPCell(new Phrase("No products available", bodyFont));
            empty.setColspan(4);
            empty.setPadding(6f);
            items.addCell(empty);
        }
        document.add(items);

        PdfPTable totals = new PdfPTable(2);
        totals.setWidthPercentage(50);
        totals.setHorizontalAlignment(Element.ALIGN_RIGHT);
        totals.addCell(labelCell("Subtotal"));
        totals.addCell(valueCell(formatCurrency(subtotal)));
        totals.addCell(labelCell("Service Fee (5%)"));
        totals.addCell(valueCell(formatCurrency(serviceFee)));
        totals.addCell(labelCell("Total"));
        totals.addCell(valueCell(formatCurrency(total)));
        document.add(totals);

        document.add(new Paragraph(" "));
        Paragraph thankYou = new Paragraph("Thanks for using Stilnovo.", mutedFont);
        thankYou.setAlignment(Element.ALIGN_CENTER);
        document.add(thankYou);

        document.close();

        return pdfResponse(outputStream, "invoice.pdf");
    }

    private ResponseEntity<byte[]> buildShippingLabelPdf(User user) throws DocumentException, IOException {
        List<Product> products = productRepository.findBySeller(user);

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        Document document = new Document();
        byte[] logoBytes = loadLogoBytes();
        PdfWriter writer = PdfWriter.getInstance(document, outputStream);
        writer.setPageEvent(new PdfPageDecorator());
        document.open();

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20);
        Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
        Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 11);
        Font mutedFont = FontFactory.getFont(FontFactory.HELVETICA, 9, new GrayColor(0.4f));

        addHeader(document, "Stilnovo Shipping Label", logoBytes);
        addKeyValueLine(document, "Label ID: ", buildReference("LBL"), bodyFont);
        addKeyValueLine(document, "Generated at: ", LocalDate.now().format(DATE_ONLY), mutedFont);
        document.add(new Paragraph(" "));
        document.add(new LineSeparator());

        document.add(new Paragraph("Ship From", sectionFont));
        document.add(new Paragraph("Stilnovo Logistics", bodyFont));
        document.add(new Paragraph("Warehouse 7, Market Avenue", bodyFont));
        document.add(new Paragraph("Madrid, ES 28001", bodyFont));

        document.add(new Paragraph("Ship To", sectionFont));
        document.add(new Paragraph(user.getName(), bodyFont));
        document.add(new Paragraph(user.getEmail(), bodyFont));
        document.add(new Paragraph("Address not provided", bodyFont));

        document.add(new Paragraph("Contents", sectionFont));
        PdfPTable contents = new PdfPTable(3);
        contents.setWidthPercentage(100);
        contents.setSpacingBefore(8f);
        contents.addCell(headerCell("Item"));
        contents.addCell(headerCell("Category"));
        contents.addCell(headerCell("Declared Value"));
        products.stream().limit(5).forEach(product -> {
            contents.addCell(valueCell(product.getName()));
            contents.addCell(valueCell(product.getCategory()));
            contents.addCell(valueCell(formatCurrency(product.getPrice())));
        });
        if (products.isEmpty()) {
            PdfPCell empty = new PdfPCell(new Phrase("No items listed", bodyFont));
            empty.setColspan(3);
            empty.setPadding(6f);
            contents.addCell(empty);
        }
        document.add(contents);

        document.add(new Paragraph("Handling Instructions", sectionFont));
        document.add(new Paragraph("Keep upright. Handle with care. Signature required.", bodyFont));

        document.add(new Paragraph(" "));
        Paragraph thankYou = new Paragraph("Thanks for using Stilnovo.", mutedFont);
        thankYou.setAlignment(Element.ALIGN_CENTER);
        document.add(thankYou);

        document.close();

        return pdfResponse(outputStream, "shipping-label.pdf");
    }

    private void addHeader(Document document, String title, byte[] logoBytes) throws DocumentException {
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);

        PdfPTable headerTable = new PdfPTable(2);
        headerTable.setWidthPercentage(100);
        headerTable.setSpacingAfter(8f);
        headerTable.setWidths(new float[] { 4f, 1f });

        PdfPCell titleCell = new PdfPCell(new Phrase(title, titleFont));
        titleCell.setBorder(Rectangle.NO_BORDER);
        titleCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        titleCell.setHorizontalAlignment(Element.ALIGN_LEFT);
        headerTable.addCell(titleCell);

        PdfPCell brandCell = new PdfPCell();
        brandCell.setBorder(Rectangle.NO_BORDER);
        brandCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        brandCell.setVerticalAlignment(Element.ALIGN_MIDDLE);

        PdfPTable brandTable = new PdfPTable(2);
        brandTable.setWidths(new float[] { 1f, 2f });
        brandTable.setWidthPercentage(100);

        PdfPCell logoCell = new PdfPCell();
        logoCell.setBorder(Rectangle.NO_BORDER);
        if (logoBytes != null) {
            try {
                Image logo = Image.getInstance(logoBytes);
                logo.scaleToFit(36, 36);
                logoCell.addElement(logo);
            } catch (Exception ignored) {
                // If logo fails, keep the cell empty.
            }
        }

        Font brandFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11);
        PdfPCell brandText = new PdfPCell(new Phrase("Stilnovo", brandFont));
        brandText.setBorder(Rectangle.NO_BORDER);
        brandText.setVerticalAlignment(Element.ALIGN_MIDDLE);
        brandText.setHorizontalAlignment(Element.ALIGN_RIGHT);

        brandTable.addCell(logoCell);
        brandTable.addCell(brandText);
        brandCell.addElement(brandTable);

        headerTable.addCell(brandCell);

        document.add(headerTable);
    }

    private byte[] loadLogoBytes() {
        try (InputStream stream = Thread.currentThread().getContextClassLoader()
                .getResourceAsStream("static/images/logo.png")) {
            if (stream == null) {
                return null;
            }
            return stream.readAllBytes();
        } catch (IOException ex) {
            return null;
        }
    }

    private void addKeyValueLine(Document document, String label, String value, Font valueFont)
            throws DocumentException {
        Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, valueFont.getSize());
        Paragraph line = new Paragraph();
        line.add(new Phrase(label, labelFont));
        line.add(new Phrase(value == null ? "-" : value, valueFont));
        document.add(line);
    }

    private PdfPCell headerCell(String text) {
        Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, GrayColor.GRAYBLACK);
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(6f);
        cell.setBackgroundColor(new GrayColor(0.93f));
        return cell;
    }

    private PdfPCell labelCell(String text) {
        Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(6f);
        cell.setBackgroundColor(new GrayColor(0.97f));
        return cell;
    }

    private PdfPCell valueCell(String text) {
        Font font = FontFactory.getFont(FontFactory.HELVETICA, 10);
        PdfPCell cell = new PdfPCell(new Phrase(text == null ? "-" : text, font));
        cell.setPadding(6f);
        return cell;
    }

    private String formatCurrency(double amount) {
        return CURRENCY.format(amount) + " EUR";
    }

    private String buildReference(String prefix) {
        String token = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return prefix + "-" + token;
    }

    private ResponseEntity<byte[]> pdfResponse(ByteArrayOutputStream outputStream, String filename) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(outputStream.toByteArray());
    }

    private static class PdfPageDecorator extends PdfPageEventHelper {

        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            PdfContentByte canvas = writer.getDirectContent();
            Rectangle page = document.getPageSize();
            addPageNumber(canvas, page, writer.getPageNumber());
        }

        private void addPageNumber(PdfContentByte canvas, Rectangle page, int pageNumber) {
            Font pageFont = FontFactory.getFont(FontFactory.HELVETICA, 9, GrayColor.GRAYBLACK);
            Phrase text = new Phrase("Page " + pageNumber, pageFont);
            ColumnText.showTextAligned(canvas, Element.ALIGN_CENTER, text, page.getWidth() / 2,
                    page.getBottom() + 20, 0);
        }
    }
}
