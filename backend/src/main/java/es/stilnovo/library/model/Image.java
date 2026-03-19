package es.stilnovo.library.model;

import java.sql.Blob;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;

/**
 * Image: Stores product images as binary data
 * 
 * This entity manages:
 * - Binary image files (BLOB format)
 * - Image metadata (ID only)
 *
 * Note: Product owns the relationship as a single @OneToOne image.
 * Used by: ImageService, ProductService
 */
@Entity(name = "ImageTable")
public class Image {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    /** The image file stored as binary data */
    @Lob
    private Blob imageFile;

    public Image() {
    }

    public Image(Blob imageFile) {
        this.imageFile = imageFile;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Blob getImageFile() {
        return imageFile;
    }

    public void setImageFile(Blob imageFile) {
        this.imageFile = imageFile;
    }

    @Override
    public String toString() {
        return "Image [id=" + id + "]";
    }
}