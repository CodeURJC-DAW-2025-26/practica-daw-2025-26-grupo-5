package es.stilnovo.library.service;

import java.io.IOException;
import java.net.URISyntaxException;
import java.sql.Blob;

import org.springframework.boot.CommandLineRunner;

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

/**
 * DataBaseInitializer service
 * Automatically populates database with sample data on application startup
 */
@Service
public class DataBaseInitializer implements CommandLineRunner {

        @Autowired
        private PasswordEncoder passwordEncoder;

        @Autowired
        private ProductService productService;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private ImageService imageService;

        /**
         * Helper method to load an image from classpath, convert to Blob, and associate
         * with product
         * 
         * @param product           the product to attach the image to
         * @param classpathResource the resource path to the image file
         * @throws IOException if image read fails
         */
        private void setProductImage(Product product, String classpathResource) throws IOException {
                Resource imageRes = new ClassPathResource("sample-images/images/" + classpathResource);
                Image createdImage = imageService.createImage(imageRes.getInputStream());
                product.setImage(createdImage);
        }

        @Override
        public void run(String... args) throws IOException, URISyntaxException {
                // Always recreate test users for development (comment out if production)
                // if (userRepository.count() > 0) {
                //         return; // Database already has data, skip sample data loading
                // }
                
                // FOR DEVELOPMENT: Always reset test data
                if (userRepository.count() > 0) {
                        userRepository.deleteAll(); // Clear existing users
                }

                // STEP 1: Load default profile images for users and admin
                Resource defaultUserImage = new ClassPathResource("static/images/no-profile-picture.png");
                byte[] userImageBytes = defaultUserImage.getInputStream().readAllBytes();
                Blob photoUserBlob = BlobProxy.generateProxy(userImageBytes);

                Resource defaultAdminImage = new ClassPathResource("static/images/admin-profile-picture.png");
                byte[] adminImageBytes = defaultAdminImage.getInputStream().readAllBytes();
                Blob photoAdminBlob = BlobProxy.generateProxy(adminImageBytes);

                // STEP 2: Create default user and admin accounts with sample data
                User user1 = new User("user1", passwordEncoder.encode("user123"), "user1@stilnovo.es", photoUserBlob,
                                0.0,
                                "1234 5678 9012 3456", "123", "09/27", 0, 0, 0, "I am user1 in Stilnovo", "ROLE_USER");
                User user2 = new User("user2", passwordEncoder.encode("user123"), "user2@stilnovo.es", photoUserBlob,
                                0.0,
                                "9876 5432 1098 7654", "789", "11/28", 0, 0, 0, "I am user2 in Stilnovo", "ROLE_USER");
                User admin = new User("admin", passwordEncoder.encode("admin123"), "admin@stilnovo.es", photoAdminBlob,
                                0.0,
                                "3456 7890 1234 5678", "456", "07/26", 0, 0, 0,
                                "I am the administrator of the Stilnovo Ecosystem",
                                "ROLE_USER", "ROLE_ADMIN");

                // STEP 3: Persist users to database
                userRepository.save(user1);
                userRepository.save(user2);
                userRepository.save(admin);

                // STEP 4: Create 10 sample products in various categories
                Product product1 = new Product("Audi A3 Sportback", "cars", 42500,
                                "Audi A3 Sportback in excellent condition, S-Line edition, featuring sporty finishes, a well-maintained interior, and a perfect balance between comfort, performance, and premium design.",
                                "Active", user1, "Mostoles, Madrid");
                Product product2 = new Product("iPhone 17 Pro", "tech", 1399,
                                "The latest Apple smartphone, equipped with advanced AI-powered features, a next-generation professional camera system, and outstanding performance for everyday and professional use.",
                                "Active", user1, "Calle de Velazquez 45, 28001 Madrid");
                Product product3 = new Product("Dell XPS 15 Laptop", "tech", 1899,
                                "High-performance Dell XPS 15 laptop with a stunning 4K display, elegant design, and powerful hardware ideal for demanding tasks such as editing, development, and creative work.",
                                "Active", user2, "Calle de Alcala 120, 28009 Madrid");
                Product product4 = new Product("Leather Winter Coat", "fashion", 349,
                                "Premium black leather winter coat designed to deliver elegance, durability, and excellent protection against cold weather during the winter season.",
                                "Active", user1, "Avenida de America 23, 28002 Madrid");
                Product product5 = new Product("White Dining Table", "home", 499,
                                "Modern white dining table made of solid wood, combining durability and style, perfect for adding brightness and sophistication to any dining space.",
                                "Active", admin, "Mostoles, Madrid");
                Product product6 = new Product("Modern LED Lamp", "home", 89,
                                "Modern minimalist LED lamp with adjustable brightness, ideal for creating a comfortable and functional atmosphere in living or working spaces.",
                                "Active", user2, "Mostoles, Madrid");
                Product product7 = new Product("Lexus RX 500h", "cars", 68500,
                                "Luxury Lexus RX 500h hybrid SUV featuring advanced technology, premium materials, exceptional comfort, and state-of-the-art safety systems.",
                                "Active", user1, "Mostoles, Madrid");
                Product product8 = new Product("Italian Moka Coffee Maker", "home", 45,
                                "Classic Italian stovetop moka coffee maker, crafted for rich and authentic espresso-style coffee, combining traditional design with reliable performance.",
                                "Active", user1, "Mostoles, Madrid");
                Product product9 = new Product("BMW M3 Competition", "cars", 96500,
                                "High-performance BMW M3 Competition sports sedan with a twin-turbo engine, aggressive styling, and precision engineering for an exhilarating driving experience.",
                                "Active", user1, "Mostoles, Madrid");
                Product product10 = new Product("Adidas Campus", "fashion", 99,
                                "Adidas Campus sneakers designed for everyday wear, offering a timeless design, comfortable fit, and durable materials suitable for daily use.",
                                "Active", user2, "Mostoles, Madrid");

                // STEP 5: Associate product images from classpath resources
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

                // STEP 6: Persist all products to database
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
