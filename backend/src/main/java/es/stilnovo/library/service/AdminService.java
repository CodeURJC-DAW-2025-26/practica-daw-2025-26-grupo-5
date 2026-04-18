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
            String memoryUsage,
            int totalProductCount,
            double totalRevenue) {
    }

    public record AdminTransactionsData(
            double totalRevenue,
            int numTransactions,
            List<Transaction> globalTransactions) {
    }

    public record AdminValorationsData(
            List<Valoration> globalValorations,
            int numValorations,
            double avgRating) {
    }

    /**
     * Deletes a user account completely from the system.
     * Cascade delete: removes all user products, transactions, valorations, and interactions.
     * Transactional: all-or-nothing operation to maintain database integrity.
     */
    @Transactional
    public void deleteUser(Long userId) {
        // Delegate to userService which handles cascade deletion of related entities
        userService.deleteUserById(userId);
    }

    @Transactional(readOnly = true)
    public int getNumBanneds() {
        return userRepository.countByBanned(true);
    }

    @Transactional(readOnly = true)
    public int getNumTotalUsers() {
        return (int) userRepository.count();
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    /**
     * Prepares admin dashboard data: system statistics and preview samples.
     * Shows overview of users, products, and system resources.
     * 
     * Active Listings: Products that can be purchased (status="Active", seller not banned)
     * Products: Total products in DB including all statuses (Active, Inactive, Banned, Hidden, Sold)
     */
    @Transactional(readOnly = true)
    public AdminPanelData getAdminPanelData() {
        // Fetch recent users (limited to 3) for dashboard widget
        List<User> dashboardUsers = userService.findAll().stream().limit(3).toList();
        
        // ACTIVE LISTINGS = products ready for sale (Active status, seller not banned)
        List<Product> activeListings = getAllProducts().stream()
                .filter(p -> "Active".equalsIgnoreCase(p.getStatus()))
                .filter(p -> !p.getSeller().isBanned())
                .toList();
        
        // PRODUCTS = ALL products in database (Active, Inactive, Banned, Hidden, Sold)
        // This is the total historical count of products ever created
        List<Product> allProducts = getAllProducts();
        
        // Display active listings as preview on dashboard
        int totalProducts = (int) allProducts.size();
        int activeListingsCount = (int) activeListings.size();
        
        // Calculate total revenue from completed transactions
        double totalRevenue = transactionService.getTotalRevenue();
        // Calculate JVM memory usage: (total - free) = used memory in MB
        long usedMemory = (Runtime.getRuntime().totalMemory() - Runtime.getRuntime().freeMemory()) / (1024 * 1024);
        return new AdminPanelData(
                getNumTotalUsers(),
                getNumBanneds(),
                dashboardUsers,
                activeListings,
                usedMemory + " MB",
                totalProducts,
                totalRevenue);
    }

    @Transactional(readOnly = true)
    public Page<User> getUsersPage(Pageable pageable) {
        return toPage(userService.findAll(), pageable);
    }

    /**
     * Retrieves paginated inventory view of ALL products.
     * Includes products with any status: Active, Inactive, Banned, Hidden, Sold.
     * This is the complete product catalog for admin audit and management.
     */
    @Transactional(readOnly = true)
    public Page<Product> getInventoryPage(Pageable pageable) {
        // Return ALL products including Sold status for complete inventory management
        List<Product> allProducts = getAllProducts();
        // Convert list to Page object with pagination info (size, number, etc)
        return toPage(allProducts, pageable);
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
            String name,
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
                    newProfilePhoto.getSize()));
        }

        // STEP 3: Conditionally update billing and profile fields (only if not blank)
        if (name != null && !name.trim().isEmpty())
            user.setName(name);
        if (email != null && !email.trim().isEmpty())
            user.setEmail(email);
        if (cardNumber != null && !cardNumber.trim().isEmpty())
            user.setCardNumber(cardNumber);
        if (cardCvv != null && !cardCvv.trim().isEmpty())
            user.setCardCvv(cardCvv);
        if (cardExpiringDate != null && !cardExpiringDate.trim().isEmpty())
            user.setCardExpiringDate(cardExpiringDate);
        if (description != null && !description.trim().isEmpty())
            user.setDescription(description);

        // STEP 4: Persist updated user to database
        userRepository.save(user);
    }

    @Transactional
    public void updateProductAsAdmin(long id,
                                     Long sellerId,
                                     String name,
                                     String category,
                                     Double price,
                                     String description,
                                     String location,
                                     String status,
                                     MultipartFile imageFile) throws IOException {

        // 1. Retrieve the existing product from the database
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        // 2. Update seller if provided
        if (sellerId != null) {
            User newSeller = userRepository.findById(sellerId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Seller not found"));
            existingProduct.setSeller(newSeller);
        }

        // 3. Update fields only if new data is provided and not blank (prevents
        // accidental deletion)
        if (name != null && !name.isBlank()) {
            existingProduct.setName(name);
        }

        // We only check if price is valid if it's actually provided
        if (price != null) {
            if (price <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Price must be greater than 0");
            }
            existingProduct.setPrice(price);
        }

        if (description != null && !description.isBlank()) {
            existingProduct.setDescription(description);
        }

        if (category != null && !category.isBlank()) {
            existingProduct.setCategory(category);
        }

        if (location != null && !location.isBlank()) {
            existingProduct.setLocation(location);
        }

        if (status != null && !status.isBlank()) {
            existingProduct.setStatus(status);
        }

        // 4. Handle image update only if a new file was actually uploaded
        if (imageFile != null && !imageFile.isEmpty()) {
            // Create new image blob and link it to the existing product
            Image newImage = imageService.createImage(imageFile.getInputStream());
            existingProduct.setImage(newImage);
        }

        // 5. Save the updated product back to the repository
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
                // We unlink the product to maintain the financial history without the physical
                // item
                t.setProduct(null);
                transactionRepository.save(t);
            }
        }

        // STEP 4: Final deletion
        // Now that no Inquiries or Interactions point to this ID, SQL allows the
        // deletion
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
