package es.stilnovo.library.service;

import java.io.IOException;

import org.hibernate.engine.jdbc.proxy.BlobProxy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import es.stilnovo.library.model.Product;
import es.stilnovo.library.model.User;
import es.stilnovo.library.repository.ProductRepository;
import es.stilnovo.library.repository.UserRepository;
import java.util.List;
import es.stilnovo.library.model.Image;




/**
 * AdminService: Manages administrative operations
 * 
 * This service handles:
 * - User deletion and account removal
 * - User banning/unbanning
 * - System statistics (total users, banned users count)
 * - Admin panel data preparation
 * 
 * Uses: UserRepository, UserService
 */
@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService; 

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ImageService imageService;

    @Transactional
    public void deleteUser(Long userId) {
        // Delegate all responsability to userService
        userService.deleteUserById(userId);
    }

    @Transactional(readOnly = true)
    public int getNumBanneds() {
        return userRepository.countByBanned(true);
    }

    @Transactional(readOnly = true)
    public int getNumTotalUsers(){
        return (int) userRepository.count();
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @Transactional
    public void updateUserAsAdmin(Long id,
                                MultipartFile newProfilePhoto,
                                String email,
                                String cardNumber,
                                String cardCvv,
                                String cardExpiringDate,
                                String description) throws IOException {
        // STEP 1: Fetch the user to be updated from database
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // STEP 2: Update profile photo if admin provided a new one
        if (newProfilePhoto != null && !newProfilePhoto.isEmpty()) {
            user.setProfileImage(BlobProxy.generateProxy(
                    newProfilePhoto.getInputStream(),
                    newProfilePhoto.getSize()
            ));
        }

        // STEP 3: Conditionally update billing and profile fields (only if not blank)
        if (email != null && !email.trim().isEmpty()) user.setEmail(email);
        if (cardNumber != null && !cardNumber.trim().isEmpty()) user.setCardNumber(cardNumber);
        if (cardCvv != null && !cardCvv.trim().isEmpty()) user.setCardCvv(cardCvv);
        if (cardExpiringDate != null && !cardExpiringDate.trim().isEmpty()) user.setCardExpiringDate(cardExpiringDate);
        if (description != null && !description.trim().isEmpty()) user.setUserDescription(description);

        // STEP 4: Persist updated user to database
        userRepository.save(user);
    }

    @Transactional
    public void updateProductAsAdmin(long id, Product updatedData, MultipartFile imageFile) throws IOException {
    
        // 1. Retrieve the existing product from the database
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
    
        // 2. Update fields only if new data is provided and not blank (prevents accidental deletion)
        if (updatedData.getName() != null && !updatedData.getName().isBlank()) {
            existingProduct.setName(updatedData.getName());
        }
    
        // Update price only if it's a valid positive value
        if (updatedData.getPrice() > 0) {
            existingProduct.setPrice(updatedData.getPrice());
        }
    
        if (updatedData.getDescription() != null && !updatedData.getDescription().isBlank()) {
            existingProduct.setDescription(updatedData.getDescription());
        }
    
        if (updatedData.getCategory() != null && !updatedData.getCategory().isBlank()) {
            existingProduct.setCategory(updatedData.getCategory());
        }
    
        if (updatedData.getLocation() != null && !updatedData.getLocation().isBlank()) {
            existingProduct.setLocation(updatedData.getLocation());
        }
    
        if (updatedData.getStatus() != null && !updatedData.getStatus().isBlank()) {
            existingProduct.setStatus(updatedData.getStatus());
        }
    
        // 3. Handle image update only if a new file was actually uploaded
        if (imageFile != null && !imageFile.isEmpty()) {
            // Create new image blob and link it to the existing product
            Image newImage = imageService.createImage(imageFile.getInputStream());
            existingProduct.setImage(newImage);
            newImage.setProduct(existingProduct);
        }
    
        // 4. Save the updated product back to the repository
        productRepository.save(existingProduct);
    }

    @Transactional
    public void deleteProductAsAdmin(Long id) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        productRepository.delete(product);
    }

}

