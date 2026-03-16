package es.stilnovo.library.service;

import java.io.IOException;
import java.io.InputStream;
import java.sql.SQLException;
import java.util.List;

import javax.sql.rowset.serial.SerialBlob;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import es.stilnovo.library.model.Image;
import es.stilnovo.library.model.Product;
import es.stilnovo.library.repository.ImageRepository;

/**
 * ImageService: Handles product image storage and retrieval
 * 
 * This service handles:
 * - Image file upload and validation
 * - Image format conversion to BLOB (binary data)
 * - Image retrieval by ID
 * - Image association with products
 * 
 * Uses: ImageRepository
 */
@Service
public class ImageService {

    @Autowired
    private ImageRepository imageRepository;

    public Image getImage(long id) {
        return imageRepository.findById(id).orElseThrow();
    }

    public List<Image> getProductImages(long productId) {
        return imageRepository.findByProductIdOrderByIdAsc(productId);
    }

    public Image createImage(InputStream inputStream) throws IOException {
        // STEP 1: Create new Image entity
        Image image = new Image();

        try {
            // STEP 2: Read binary data from input stream
            // STEP 3: Convert bytes to SerialBlob (database-compatible format)
            image.setImageFile(new SerialBlob(inputStream.readAllBytes()));
        } catch (Exception e) {
            throw new IOException("Failed to create image", e);
        }

        // STEP 4: Return image (not yet persisted, caller should save)
        return image;
    }

    public Resource getImageFile(long id) throws SQLException {
        // STEP 1: Fetch image from database by ID
        Image image = imageRepository.findById(id).orElseThrow();

        // STEP 2: Check if image blob exists
        if (image.getImageFile() != null) {
            // STEP 3: Convert blob to stream resource for HTTP response
            return new InputStreamResource(image.getImageFile().getBinaryStream());
        } else {
            throw new RuntimeException("Image file not found");
        }
    }

    public Image replaceImageFile(long id, InputStream inputStream) throws IOException {

        Image image = imageRepository.findById(id).orElseThrow();

        try {
            image.setImageFile(new SerialBlob(inputStream.readAllBytes()));
        } catch (Exception e) {
            throw new IOException("Failed to create image", e);
        }

        imageRepository.save(image);
        
        return image;
    }

    public Image deleteImage(long id) {
        Image image = imageRepository.findById(id).orElseThrow();
        imageRepository.deleteById(id);
        return image;
    }

    public void setProduct(Product product, Image image) {
        image.setProduct(product);
    }
}


