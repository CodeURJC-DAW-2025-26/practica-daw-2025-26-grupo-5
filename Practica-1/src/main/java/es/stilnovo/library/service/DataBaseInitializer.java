package es.stilnovo.library.service;

import java.io.IOException;
import java.net.URISyntaxException;
import jakarta.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import es.stilnovo.library.model.Image;
import es.stilnovo.library.model.Product;
import es.stilnovo.library.model.User;
import es.stilnovo.library.repository.UserRepository;

@Service
public class DataBaseInitializer {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ProductService productService; 

    @Autowired 
    private UserRepository userRepository;

    @Autowired
    private ImageService imageService;

    /**
     * Helper method to load an image from the classpath, convert it into a Blob 
     * via ImageService, and associate the resulting entity with a product.
     */
    private void setProductImage(Product product, String classpathResource) throws IOException {
        // Locate the physical file within the sample-images folder in resources
        Resource imageRes = new ClassPathResource("sample-images/images/" + classpathResource);
    
        // ImageService handles the conversion to Blob and persists it in the 'image' table
        Image createdImage = imageService.createImage(imageRes.getInputStream());
    
        // Link the persistent Image entity to the product's internal list
        product.addImagen(createdImage);
    }   

    @PostConstruct
    public void init() throws IOException, URISyntaxException {

        // 1. Define sample products for the Stilnovo marketplace
        Product product1 = new Product("Audi A3 Sporback", "cars", 42500, "Excellent condition, S-Line edition.", "active");
        Product product2 = new Product("iPhone 17 Pro", "tech", 1399, "Latest Apple smartphone with advanced AI features", "active");
        Product product3 = new Product("Dell XPS 15 Laptop", "tech", 1899, "High-performance Dell laptop with 4K display", "active");
        Product product4 = new Product("Leather Winter Coat", "fashion", 349, "Premium black leather coat for winter season", "active");
        Product product5 = new Product("White Dining Table", "home", 499, "Modern white table made of solid wood", "active");
        Product product6 = new Product("Modern LED Lamp", "home", 89, "Minimalist LED lamp with adjustable brightness", "active");
        Product product7 = new Product("Lexus RX 500h", "cars", 68500, "Luxury hybrid SUV with advanced safety features", "active");
        Product product8 = new Product("Italian Moka Coffee Maker", "home", 45, "Classic Italian stovetop coffee maker", "active");
        Product product9 = new Product("BMW M3 Competition", "cars", 96500, "High-performance sports sedan with twin-turbo engine", "active");
        Product product10 = new Product("Adidas", "fashion", 99, "A perfect shoes for daily use", "active");
        
        // 2. Associate specific images from /resources/sample-images/images/
        setProductImage(product1, "Audi-a3-1.png");
        setProductImage(product2, "Iphone-17-1.png");
        setProductImage(product3, "ordenador-dell-1.png");
        setProductImage(product4, "Abrigo-1.png");
        setProductImage(product5, "Mesa-Blanca-1.png");
        setProductImage(product6, "lampara-paja-1.png");
        setProductImage(product7, "lexus-1.png");
        setProductImage(product8, "cafetera-1.png");
        setProductImage(product9, "bmw-1.png");
        setProductImage(product10, "adidas-1.png");

        // 3. Persist all products into the MySQL database (Docker)
        productService.save(product1);
        productService.save(product2);
        productService.save(product3);
        productService.save(product4);
        productService.save(product5);
        productService.save(product6);
        productService.save(product7);
        productService.save(product8);
        productService.save(product9);
        productService.save(product10);

        // 4. Initialize sample users with encrypted passwords and roles
        userRepository.save(new User("user", passwordEncoder.encode("user"), "USER"));
        userRepository.save(new User("admin", passwordEncoder.encode("admin"), "USER", "ADMIN"));
    }
}
