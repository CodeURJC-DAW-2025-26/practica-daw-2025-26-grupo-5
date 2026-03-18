package es.stilnovo.library.controller;

import java.sql.SQLException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.server.ResponseStatusException;

import es.stilnovo.library.model.Image;
import es.stilnovo.library.model.Product;
import es.stilnovo.library.service.ProductService;

/** Controller for serving product images */
@Controller
public class ImageController {

    @Autowired
    private ProductService productService;

    @GetMapping("/product-images/{productId}")
    public ResponseEntity<Object> getProductImage(@PathVariable long productId) throws SQLException {
        
        Product product = productService.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        Image img = product.getImage();

        if (img != null && img.getImageFile() != null) {
            Resource file = new InputStreamResource(img.getImageFile().getBinaryStream());

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, "image/jpeg")
                    .contentLength(img.getImageFile().length())
                    .body(file);
        }
        
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/product-images/{productId}/{imageId}")
    public ResponseEntity<Object> getProductGalleryImage(@PathVariable long productId, @PathVariable long imageId) throws SQLException {
        Product product = productService.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        Image img = product.getImage();

        if (img == null || img.getId() == null || !img.getId().equals(imageId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }

        if (img.getImageFile() == null) {
            return ResponseEntity.notFound().build();
        }

        Resource file = new InputStreamResource(img.getImageFile().getBinaryStream());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "image/jpeg")
                .contentLength(img.getImageFile().length())
                .body(file);
    }

    
}