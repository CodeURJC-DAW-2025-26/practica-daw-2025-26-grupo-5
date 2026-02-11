package es.stilnovo.library.service;

import java.io.IOException;
import java.net.URISyntaxException;
import java.sql.Blob;

import jakarta.annotation.PostConstruct;

import org.hibernate.engine.jdbc.proxy.BlobProxy;
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

        Resource defaultUserImage = new ClassPathResource("static/images/no-profile-picture.png");
        Blob photoUserBlob = BlobProxy.generateProxy(defaultUserImage.getInputStream(), defaultUserImage.contentLength());

        Resource defaultAdminImage = new ClassPathResource("static/images/admin-profile-picture.png");
        Blob photoAdminBlob = BlobProxy.generateProxy(defaultAdminImage.getInputStream(), defaultAdminImage.contentLength());

        // 1. Initialize sample users with encrypted passwords and roles
        User user = new User("user", passwordEncoder.encode("user"), "user@stilnovo.es", photoUserBlob, 4.7,"ROLE_USER");
        User admin = new User("admin", passwordEncoder.encode("admin"), "admin@stilnovo.es", photoAdminBlob, 5.0,"ROLE_USER", "ROLE_ADMIN");

        userRepository.save(user);
        userRepository.save(admin);
        
        // 2. Define sample products for the Stilnovo marketplace
        Product product1 = new Product("Audi A3 Sportback", "cars", 42500, "Audi A3 Sportback in excellent condition, S-Line edition, featuring sporty finishes, a well-maintained interior, and a perfect balance between comfort, performance, and premium design.", "active", user, "Mostoles, Madrid");
        Product product2 = new Product("iPhone 17 Pro", "tech", 1399, "The latest Apple smartphone, equipped with advanced AI-powered features, a next-generation professional camera system, and outstanding performance for everyday and professional use.", "active", user, "Mostoles, Madrid");
        Product product3 = new Product("Dell XPS 15 Laptop", "tech", 1899, "High-performance Dell XPS 15 laptop with a stunning 4K display, elegant design, and powerful hardware ideal for demanding tasks such as editing, development, and creative work.", "active", user, "Mostoles, Madrid");
        Product product4 = new Product("Leather Winter Coat", "fashion", 349, "Premium black leather winter coat designed to deliver elegance, durability, and excellent protection against cold weather during the winter season.", "active", user, "Mostoles, Madrid");
        Product product5 = new Product("White Dining Table", "home", 499, "Modern white dining table made of solid wood, combining durability and style, perfect for adding brightness and sophistication to any dining space.", "active", admin, "Mostoles, Madrid");
        Product product6 = new Product("Modern LED Lamp", "home", 89, "Modern minimalist LED lamp with adjustable brightness, ideal for creating a comfortable and functional atmosphere in living or working spaces.", "active", user, "Mostoles, Madrid");
        Product product7 = new Product("Lexus RX 500h", "cars", 68500, "Luxury Lexus RX 500h hybrid SUV featuring advanced technology, premium materials, exceptional comfort, and state-of-the-art safety systems.", "active", user, "Mostoles, Madrid");
        Product product8 = new Product("Italian Moka Coffee Maker", "home", 45, "Classic Italian stovetop moka coffee maker, crafted for rich and authentic espresso-style coffee, combining traditional design with reliable performance.", "active", user, "Mostoles, Madrid");
        Product product9 = new Product("BMW M3 Competition", "cars", 96500, "High-performance BMW M3 Competition sports sedan with a twin-turbo engine, aggressive styling, and precision engineering for an exhilarating driving experience.", "active", user, "Mostoles, Madrid");
        Product product10 = new Product("Adidas Campus", "fashion", 99, "Adidas Campus sneakers designed for everyday wear, offering a timeless design, comfortable fit, and durable materials suitable for daily use.", "active", user, "Mostoles, Madrid");
        
        // 3. Associate specific images from /resources/sample-images/images/
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

        // 4. Persist all products into the MySQL database (Docker)
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

    }
}
