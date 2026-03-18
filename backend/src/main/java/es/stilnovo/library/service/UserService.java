package es.stilnovo.library.service;

import java.io.IOException;
import java.util.Optional;
import java.util.TreeMap;
import java.util.stream.Collectors;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.hibernate.engine.jdbc.proxy.BlobProxy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import es.stilnovo.library.model.User;
import es.stilnovo.library.model.UserInteraction;
import es.stilnovo.library.model.Valoration;
import es.stilnovo.library.repository.InquiryRepository;
import es.stilnovo.library.repository.ProductRepository;
import es.stilnovo.library.repository.TransactionRepository;
import es.stilnovo.library.repository.UserInteractionRepository;
import es.stilnovo.library.repository.UserRepository;
import es.stilnovo.library.repository.ValorationRepository;

import org.springframework.core.io.Resource;

import es.stilnovo.library.model.Inquiry;
import es.stilnovo.library.model.Product;
import es.stilnovo.library.model.Transaction;
import org.springframework.transaction.annotation.Transactional;

import es.stilnovo.library.dto.UserDashboardDataDTO;
import es.stilnovo.library.dto.SellerProfilePageDataDTO;
import es.stilnovo.library.dto.UserStatisticsDataDTO;
/**
 * UserService: Manages all user-related operations
 * 
 * This service handles:
 * - User account CRUD operations (create, read, update, delete)
 * - User authentication and profile management
 * - User financial data (balance, revenue, ratings)
 * - User search by name, email, or ID
 * - Rating calculations for sellers
 * 
 * Uses: UserRepository, TransactionRepository, ValorationRepository
 */
@Service
public class UserService {


    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserInteractionRepository interactionRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private InquiryRepository inquiryRepository;

    @Autowired
    private InquiryService inquiryService;

    /** Saves or updates a user in the database */
    public void save(User user) {
        userRepository.save(user);
    }

    public Optional<User> findByName(String name) {
        return userRepository.findByName(name);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> findById(long id) {
        return userRepository.findById(id);
    }
    
    public List<User> findAll() {
        return userRepository.findAll();
    }
    
    public boolean existsUser(String name) {
        return userRepository.findByName(name).isPresent();
    }

    public boolean existsEmail(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private ValorationRepository valorationRepository;

    /**
     * Calculates the average rating received by a seller.
     */
    @Transactional(readOnly = true)
    public double getAverageRatingForSeller(String username) {
        // STEP 1: Query for seller by username
        User seller = userRepository.findByName(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // STEP 2: Fetch all ratings/reviews for this seller
        java.util.List<Valoration> valorations = valorationRepository.findBySeller(seller);
        
        // STEP 3: Handle case where seller has no ratings yet
        if (valorations.isEmpty()) {
            return 0.0;
        }
        
        // STEP 4: Calculate and return average star rating
        return valorations.stream()
                .mapToInt(Valoration::getStars)
                .average()
                .orElse(0.0);
    }

    /**
     * Updates the profile settings and billing information for the authenticated user.
     * This method handles optional profile picture uploads and performs partial updates.
     * * @param username The name of the authenticated user from the Security Context.
     * @param newProfilePhoto Optional MultipartFile containing the new avatar.
     * @param email New email address (if provided).
     * @param cardNumber New credit card number for billing.
     * @param cardCvv New CVV security code.
     * @param cardExpiringDate New expiration date (MM/YY).
     * @param description New profile description.
     * @throws IOException If there is an error processing the image stream.
     */
    @Transactional
    public void updateUserSettings(String username, MultipartFile newProfilePhoto, String email, 
                                String cardNumber, String cardCvv, String cardExpiringDate, 
                                String description) throws IOException {

        // 1. Domain Logic: Fetch the managed entity from the database
        User user = userRepository.findByName(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // 2. Image Processing: Update profile photo if a new one is provided
        if (newProfilePhoto != null && !newProfilePhoto.isEmpty()) {
            user.setProfileImage(BlobProxy.generateProxy(
                newProfilePhoto.getInputStream(), 
                newProfilePhoto.getSize()
            )); 
        }

        // 3. Conditional Updates: Only update fields that are not empty
        if (email != null && !email.trim().isEmpty()) user.setEmail(email);
        if (cardNumber != null && !cardNumber.trim().isEmpty()) user.setCardNumber(cardNumber);
        if (cardCvv != null && !cardCvv.trim().isEmpty()) user.setCardCvv(cardCvv);
        if (cardExpiringDate != null && !cardExpiringDate.trim().isEmpty()) user.setCardExpiringDate(cardExpiringDate);
        if (description != null && !description.trim().isEmpty()) user.setUserDescription(description);

        // 4. Persistence: The @Transactional annotation will automatically flush changes to the DB
        userRepository.save(user);
    }

    /**
     * Core method to perform a secure deletion of a user by their ID.
     * This handles all database constraints and security checks.
     *
     * @param userId The ID of the user to be deleted.
     * @throws ResponseStatusException 403 if the user is an admin.
     * @throws ResponseStatusException 404 if the user is not found.
     */
    @Transactional
    public void deleteUserById(Long userId) {
        // 1. Fetch user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // 2. Security check
        if (user.getRoles().contains("ROLE_ADMIN")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot delete an administrator.");
        }

        // 3. CLEAN INQUIRIES
        // A. Delete inquiries where this user is the BUYER
        List<Inquiry> sentInquiries = inquiryRepository.findByBuyer(user);
        for (Inquiry inq : sentInquiries) {
            inquiryService.deleteInquiry(inq);
        }

        // B. Delete inquiries where this user is the SELLER (via their products)
        if (user.getProducts() != null && !user.getProducts().isEmpty()) {
            List<Inquiry> receivedInquiries = inquiryRepository.findByProductIn(user.getProducts());
            for (Inquiry inq : receivedInquiries) {
                inquiryService.deleteInquiry(inq);
            }
        }

        // 4. Clean Transactions and Interactions
        List<Transaction> userTransactions = transactionRepository.findByBuyerOrSeller(user, user);
        if (!userTransactions.isEmpty()) {
            valorationRepository.deleteByTransactionIn(userTransactions);
            transactionRepository.deleteAll(userTransactions);
        }

        interactionRepository.deleteByUser(user);
        interactionRepository.deleteByProductSeller(user);

        // 5. FINAL STEP: Delete User
        // Now there are no Inquiries pointing to this user or their products
        userRepository.delete(user);
    }

    /**
     * Deletes the currently authenticated user based on their username.
     * @param username The username of the user performing self-deletion.
     */
    @Transactional
    public void deleteUserSelf(String username) {
        User user = userRepository.findByName(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        // We reuse the logic by calling the ID-based method
        deleteUserById(user.getUserId());
    }

    /**
     * Retrieves the full profile of the authenticated user.
     * This is used to populate settings and profile views with complete JPA entity data.
     * @param username The unique identity string from the Principal object.
     * @return The complete User entity including billing and profile details.
     */
    public User getFullUserProfile(String username) {
        // We fetch the full entity to ensure fields like email, description, and balance are available 
        return userRepository.findByName(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User profile not found"));
    }
    
    /**
     * Retrieves the profile photo of a user as a Resource using their username.
     * This method is @Transactional to allow the Blob binary stream to be read from the database.
     * * @param username The unique name of the user whose photo is requested.
     * @return A Resource containing the image bytes or a default "no-profile-picture" placeholder.
     * @throws SQLException If there's an error reading the Blob stream from the database.
     */
    @Transactional(readOnly = true)
    public Resource getProfilePhotoResourceByUsername(String username) throws SQLException {
        User user = userRepository.findByName(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        return getResourceFromUser(user);
    }

    /**
     * Fetches the profile photo resource using the internal User ID.
     * Ideal for public profiles where the internal identifier is used in the URL.
     * * @param id The internal database ID of the user.
     * @return A Resource containing the image bytes or a default "no-profile-picture" placeholder.
     * @throws SQLException If there's an error reading the Blob stream from the database.
     */
    @Transactional(readOnly = true)
    public Resource getProfilePhotoResourceById(Long id) throws SQLException {
        User user = userRepository.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        return getResourceFromUser(user);
    }

    /**
     * Internal helper to convert a User's profile image Blob into a Spring Resource.
     * If the image is null, it provides a consistent fallback to the default avatar.
     * * @param user The managed User entity.
     * @return A streamable InputStreamResource or a ClassPathResource for the fallback.
     * @throws SQLException If the Blob binary stream cannot be accessed.
     */
    private Resource getResourceFromUser(User user) throws SQLException {
        if (user.getProfileImage() != null) {
            return new InputStreamResource(user.getProfileImage().getBinaryStream());
        }

        // FALLBACK: Uniform path for users without a profile picture
        return new ClassPathResource("static/images/no-profile-picture.png");
    }

    /**
     * Retrieves a user's public profile data by their unique ID.
     *
     * @param id The database ID of the user.
     * @return The User entity if found.
     * @throws ResponseStatusException 404 if the user does not exist.
     */
    public User getPublicProfileById(long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Seller not found"));
    }

    public SellerProfilePageDataDTO getSellerProfilePageData(long id, String viewerUsername) {
        User seller = getPublicProfileById(id);
        boolean owner = viewerUsername != null && viewerUsername.equals(seller.getName());
        return new SellerProfilePageDataDTO(
                seller,
                seller.getValorations(),
                seller.getProducts(),
                seller.getProducts().size(),
                (int) Math.floor(seller.getRating()),
                owner);
    }

    /**
     * Processes and aggregates all sales and orders data for the authenticated user.
     * It dynamically checks if each purchase has been rated to update the UI buttons.
     * * @param username The name of the authenticated user from the Security Context.
     * @param transactionId Optional ID of the transaction to display in the detail view.
     * @return A Map containing lists of transactions and UI state flags.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getSalesAndOrdersDashboard(String username, Long transactionId) {
        Map<String, Object> data = new HashMap<>();
        
        // 1. Context: Fetch the user and their specific history
        User user = userRepository.findByName(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        List<Transaction> sales = transactionRepository.findBySellerUserId(user.getUserId());
        List<Transaction> orders = transactionRepository.findByBuyerUserId(user.getUserId());

        // 2. DYNAMIC UI CHECK: Check if each order already has a valoration
        // This is the key to making {{#rated}} work in your Mustache template.
        for (Transaction t : orders) {
            t.setRated(valorationRepository.existsByTransaction(t));
        }

        // 3. Detail View Logic: Determine which transaction is currently selected
        Transaction selected = null;
        if (transactionId != null) {
            selected = transactionRepository.findById(transactionId)
                    .filter(t -> t.getSeller().getName().equals(username) || t.getBuyer().getName().equals(username))
                    .orElse(null);
        }
        
        // Default to the most recent sale if no specific transaction is selected
        if (selected == null && !sales.isEmpty()) {
            selected = sales.get(0);
        }

        // 4. Populate Model Data for Mustache
        data.put("sales", sales);
        data.put("orders", orders);
        data.put("selectedTransaction", selected);
        data.put("hasSales", !sales.isEmpty());
        data.put("hasOrders", !orders.isEmpty());
        data.put("shippingAddress", (selected != null) ? selected.getProduct().getLocation() : "No shipping data available");

        return data;
    } 

        public UserDashboardDataDTO getUserDashboardData(String username) {
            User user = getFullUserProfile(username);
            List<Transaction> sales = transactionRepository.findBySellerUserId(user.getUserId());
            Map<String, Long> salesByCategory = getSalesByCategory(sales);
            List<String> monthLabels = getMonthLabels();
            List<Double> monthlyRevenues = getRevenueByMonth(sales);
            BarChartData chartData = getBarChartData(user);
            List<String> barLabels = chartData.labels();
            List<Long> visitsData = barLabels.stream()
                .map(cat -> chartData.visitsByCategory().getOrDefault(cat, 0L))
                .toList();
            List<Long> interestData = barLabels.stream()
                .map(cat -> chartData.interestByCategory().getOrDefault(cat, 0L))
                .toList();

            return new UserDashboardDataDTO(
                user,
                getFormattedDate(),
                sales,
                toJson(salesByCategory.keySet()),
                toJson(salesByCategory.values()),
                toJson(monthLabels),
                toJson(monthlyRevenues),
                toJson(barLabels),
                toJson(visitsData),
                toJson(interestData));
        }

        @Transactional(readOnly = true)
        public UserStatisticsDataDTO getUserStatisticsData(String username) {
            UserDashboardDataDTO dashboardData = getUserDashboardData(username);
            List<Transaction> transactions = transactionRepository.findBySellerUserId(dashboardData.user().getUserId());
            double totalSales = transactions.stream().mapToDouble(Transaction::getFinalPrice).sum();
            double avgRating = getAverageRatingForSeller(username);

            return new UserStatisticsDataDTO(
                dashboardData.user(),
                String.format("%.2f", totalSales),
                transactions.size(),
                String.format("%.1f", avgRating),
                String.format("%.2f", calculateInventoryValue(username)),
                dashboardData.date(),
                dashboardData.chartLabels(),
                dashboardData.chartValues(),
                dashboardData.revenueLabels(),
                dashboardData.revenueValues(),
                dashboardData.barLabels(),
                dashboardData.visitsData(),
                dashboardData.interestData());
        }

    public double calculateInventoryValue(String username) {
        // 1. Find the user
        User seller = userRepository.findByName(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // 2. Calculate the total sum of prices
        return seller.getProducts().stream()
                .mapToDouble(Product::getPrice)
                .sum();
    }

    public String getFormattedDate() {
        LocalDate actualDate = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy", Locale.ENGLISH);
        String formattedDate = actualDate.format(formatter);
        return formattedDate;
    }

    @Transactional(readOnly = true)
    public List<Product> getSales(String username) {

        return productRepository.findBySellerNameAndStatus(username, "Sold");
    }

    public Map<String, Long> getSalesByCategory(List<Transaction> transactions) {
        return transactions.stream()
            .collect(Collectors.groupingBy(
                t -> t.getProduct().getCategory(), 
                Collectors.counting()  
            ));
    }
    
    public List<String> getMonthLabels() {
        return List.of("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
    }

    public List<Double> getRevenueByMonth(List<Transaction> transactions) {
        Map<Integer, Double> revenueByMonth = new TreeMap<>(); 
        for (int i = 1; i <= 12; i++) revenueByMonth.put(i, 0.0);

        for (Transaction t : transactions) {
            if (t.getCreatedAt() != null) {
                int month = t.getCreatedAt().getMonthValue();
                revenueByMonth.put(month, revenueByMonth.get(month) + t.getFinalPrice());
            }
        }

        return new ArrayList<>(revenueByMonth.values());
    }

    private record BarChartData(
        List<String> labels,
        Map<String, Long> visitsByCategory,
        Map<String, Long> interestByCategory
    ) {}

    public BarChartData getBarChartData(User user) {
        List<UserInteraction> sellerInteractions = interactionRepository.findByProductSeller(user);
        Map<String, Long> visitsByCategory = new HashMap<>();
        Map<String, Long> interestByCategory = new HashMap<>();
        Set<String> allCategories = new HashSet<>();

        for (UserInteraction interaction : sellerInteractions) {
            String category = interaction.getProduct().getCategory();
            allCategories.add(category);
            
            // If it's a VIEW, it counts as a visit; if it's a LIKE or BUY, it counts as interest
            if (interaction.getType() == UserInteraction.InteractionType.VIEW) {
                visitsByCategory.put(category, visitsByCategory.getOrDefault(category, 0L) + 1);
            } else {
                interestByCategory.put(category, interestByCategory.getOrDefault(category, 0L) + 1);
            }
        }
        List<String> barLabels = new ArrayList<>(allCategories);
        return new BarChartData(barLabels, visitsByCategory, interestByCategory);

    }

    public boolean usernameExists(String username) {
        return userRepository.existsByName(username);
    }

    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    private String toJson(Object value) {
        try {
            return new ObjectMapper().writeValueAsString(value);
        } catch (Exception exception) {
            return "[]";
        }
    }
}