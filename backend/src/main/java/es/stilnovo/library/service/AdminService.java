package es.stilnovo.library.service;

import java.io.IOException;
import java.util.List;

import org.hibernate.engine.jdbc.proxy.BlobProxy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import es.stilnovo.library.model.Product;
import es.stilnovo.library.model.Transaction;
import es.stilnovo.library.model.User;
import es.stilnovo.library.repository.InquiryRepository;
import es.stilnovo.library.repository.ProductRepository;
import es.stilnovo.library.repository.TransactionRepository;
import es.stilnovo.library.repository.UserInteractionRepository;
import es.stilnovo.library.repository.UserRepository;
import es.stilnovo.library.model.Image;
import es.stilnovo.library.model.Valoration;




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

    @Autowired
    private InquiryRepository inquiryRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserInteractionRepository interactionRepository;

        @Autowired
        private TransactionService transactionService;

        @Autowired
        private ValorationService valorationService;

        public record AdminPanelData(
            int numUsers,
            int numBanneds,
            List<User> users,
            List<Product> products,
            String memoryUsage
        ) {
        }

        public record AdminTransactionsData(
            int totalRevenue,
            int numTransactions,
            List<Transaction> globalTransactions
        ) {
        }

        public record AdminValorationsData(
            List<Valoration> globalValorations,
            int numValorations,
            double avgRating
        ) {
        }

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

    @Transactional(readOnly = true)
    public AdminPanelData getAdminPanelData() {
        List<User> dashboardUsers = userService.findAll().stream().limit(3).toList();
        List<Product> dashboardProducts = productRepository.findAll().stream().limit(3).toList();
        long usedMemory = (Runtime.getRuntime().totalMemory() - Runtime.getRuntime().freeMemory()) / (1024 * 1024);
        return new AdminPanelData(
                getNumTotalUsers(),
                getNumBanneds(),
                dashboardUsers,
                dashboardProducts,
                usedMemory + " MB");
    }

    @Transactional(readOnly = true)
    public Page<User> getUsersPage(Pageable pageable) {
        return toPage(userService.findAll(), pageable);
    }

    @Transactional(readOnly = true)
    public Page<Product> getInventoryPage(Pageable pageable) {
        List<Product> productsToDisplay = getAllProducts().stream()
                .filter(p -> !"Sold".equalsIgnoreCase(p.getStatus()))
                .toList();
        return toPage(productsToDisplay, pageable);
    }

    @Transactional(readOnly = true)
    public AdminTransactionsData getAdminTransactionsData() {
        return new AdminTransactionsData(
                transactionService.getTotalRevenue(),
                transactionService.getTotalNumOfTransactions(),
                transactionService.getAllTransactions());
    }

    @Transactional(readOnly = true)
    public Page<Transaction> getTransactionsPage(Pageable pageable) {
        return toPage(transactionService.getAllTransactions(), pageable);
    }

    @Transactional(readOnly = true)
    public AdminValorationsData getAdminValorationsData() {
        List<Valoration> valorations = valorationService.findAll();
        double avg = valorations.stream().mapToInt(Valoration::getStars).average().orElse(0.0);
        return new AdminValorationsData(valorations, valorations.size(), Math.round(avg * 10.0) / 10.0);
    }

    @Transactional
    public void deleteTransaction(Long id) {
        transactionService.deleteTransaction(id);
    }

    @Transactional
    public void deleteValoration(Long id) {
        valorationService.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Page<Valoration> getValorationsPage(Pageable pageable) {
        return toPage(valorationService.findAll(), pageable);
    }

    @Transactional
    public User toggleBanUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        user.setBanned(!user.isBanned());
        return userRepository.save(user);
    }

    @Transactional
    public User setBanStatus(Long id, boolean banned) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        user.setBanned(banned);
        return userRepository.save(user);
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
    
        if (updatedData.getPrice() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Price must be greater than 0");
        }
        existingProduct.setPrice(updatedData.getPrice());
    
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
        }
    
        // 4. Save the updated product back to the repository
        productRepository.save(existingProduct);
    }

    @Transactional
    public Product createProductAsAdmin(Long sellerId,
                                        String productName,
                                        String category,
                                        String description,
                                        double price,
                                        String location,
                                        String status,
                                        MultipartFile productPhoto) throws IOException {
        if (price <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Price must be greater than 0");
        }

        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Product newProduct = new Product(productName, category, price, description, status, seller, location);

        if (productPhoto != null && !productPhoto.isEmpty()) {
            Image img = imageService.createImage(productPhoto.getInputStream());
            newProduct.setImage(img);
        }

        return productRepository.save(newProduct);
    }

    @Transactional
    public void deleteProductAsAdmin(Long id) {
        // STEP 1: Find the product or throw 404 if it doesn't exist
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        // STEP 2: Clear child records (Inquiries and Interactions)
        // This removes all messages sent to the seller about this specific product
        inquiryRepository.deleteByProduct(product);

        // This removes all likes, views, or bookmarks associated with this product
        interactionRepository.deleteByProduct(product);

        // STEP 3: Handle Transactions (Sales history)
        // We search for transactions linked to this product
        List<Transaction> transactions = transactionRepository.findByProduct(product);
        if (!transactions.isEmpty()) {
            for (Transaction t : transactions) {
                // We unlink the product to maintain the financial history without the physical item
                t.setProduct(null); 
                transactionRepository.save(t);
            }
        }

        // STEP 4: Final deletion
        // Now that no Inquiries or Interactions point to this ID, SQL allows the deletion
        productRepository.delete(product);
    }

    private <T> Page<T> toPage(List<T> source, Pageable pageable) {
        if (pageable == null || pageable.isUnpaged()) {
            return new PageImpl<>(source);
        }

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), source.size());

        if (start >= source.size()) {
            return new PageImpl<>(List.of(), pageable, source.size());
        }

        return new PageImpl<>(source.subList(start, end), pageable, source.size());
    }

}

