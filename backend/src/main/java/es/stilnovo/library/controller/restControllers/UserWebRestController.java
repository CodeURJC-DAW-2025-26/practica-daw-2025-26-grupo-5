package es.stilnovo.library.controller.restControllers;

import java.io.IOException;
import java.security.Principal;
import java.sql.SQLException;
import java.util.Map;
import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.RequestPart;

import es.stilnovo.library.dto.ProductMapper;
import es.stilnovo.library.dto.TransactionMapper;
import es.stilnovo.library.dto.SellerProfileDTO;
import es.stilnovo.library.dto.UserDTO;
import es.stilnovo.library.dto.UserDashboardDataDTO;
import es.stilnovo.library.dto.UserMapper;
import es.stilnovo.library.dto.UserSettingsUpdateDTO;
import es.stilnovo.library.dto.UserStatisticsDataDTO;
import es.stilnovo.library.dto.ValorationDTO;
import es.stilnovo.library.dto.ValorationMapper;
import es.stilnovo.library.service.ContactSellerService;
import es.stilnovo.library.service.ProductService;
import es.stilnovo.library.service.UserService;
import es.stilnovo.library.service.ValorationService;
import es.stilnovo.library.dto.TransactionDashboardDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * REST Controller for user profile and seller management API operations.
 * 
 * Provides endpoints for:
 * - User registration and profile management
 * - Public user profile viewing (seller information with ratings)
 * - User profile picture and settings updates
 * - Seller dashboard and statistics retrieval
 * - Valoration (rating) listing for sellers
 * 
 * All responses return DTOs (no entity exposure). Authenticated endpoints
 * require valid JWT token.
 * Uses: UserService, ProductService, ContactSellerService, ValorationService
 * Mappers: UserMapper, ProductMapper, ValorationMapper
 */
@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "User Profiles", description = "REST API for managing user profiles, settings, dashboard data, and public seller profiles")
public class UserWebRestController {

        @Autowired
        private UserService userService;

        @Autowired
        private ProductService productService;

        @Autowired
        private ContactSellerService contactSellerService;

        @Autowired
        private ValorationService valorationService;

        @Autowired
        private UserMapper userMapper;

        @Autowired
        private ProductMapper productMapper;

        @Autowired
        private ValorationMapper valorationMapper;

        @Autowired
        private TransactionMapper transactionMapper;

        /**
         * This section refers to the current (principal) user.
         */

        @GetMapping("/me")
        @Operation(summary = "Get current user profile", description = "Retrieves the full profile of the currently authenticated user")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "User profile retrieved successfully"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized user")
        })
        public UserDTO getCurrentUser(Principal principal) {
                return userMapper.toDTO(userService.getFullUserProfile(principal.getName()));
        }

        @DeleteMapping("/me")
        @Operation(summary = "Delete my account", description = "Deletes the authenticated user's account and associated data")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "204", description = "Account deleted successfully"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized user")
        })
        public ResponseEntity<Void> deleteMyAccount(Principal principal) {
                userService.deleteUserSelf(principal.getName());
                return ResponseEntity.noContent().build();
        }

        @GetMapping(value = "/me/profile-photo", produces = MediaType.IMAGE_PNG_VALUE)
        @Operation(summary = "Get my profile photo", description = "Retrieves the profile photo of the authenticated user")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Profile photo retrieved successfully"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized user"),
                        @ApiResponse(responseCode = "404", description = "Profile photo not found")
        })
        public ResponseEntity<Resource> getMyProfilePhoto(Principal principal) throws SQLException {
                Resource myImage = userService.getProfilePhotoResourceByUsername(principal.getName());
                return ResponseEntity.ok()
                                .contentType(MediaType.IMAGE_PNG)
                                .body(myImage);
        }

        @PutMapping(value = "/me/profile-photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        @Operation(summary = "Update my profile photo", description = "Uploads and updates the profile photo for the authenticated user")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Profile photo updated successfully"),
                        @ApiResponse(responseCode = "400", description = "Invalid file or processing error"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized user")
        })
        public ResponseEntity<UserDTO> updateMyProfilePhoto(Principal principal,
                        @RequestPart("image") MultipartFile file)
                        throws IOException {
                String nameToModify = principal.getName();
                userService.updateProfilePhotoByUsername(nameToModify, file);
                UserDTO updatedUser = userMapper.toDTO(userService.getFullUserProfile(nameToModify));
                return ResponseEntity.ok(updatedUser);
        }

        /**
         * Deletes the profile photo of the authenticated user, restoring the default
         * avatar.
         * 
         * @param principal The security context of the authenticated user.
         * @return ResponseEntity with 204 No Content status on success.
         */
        @DeleteMapping("/me/profile-photo")
        @Operation(summary = "Delete my profile photo", description = "Deletes the profile photo of the authenticated user, restoring the default avatar")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "204", description = "Profile photo deleted successfully"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized user")
        })
        public ResponseEntity<Void> deleteMyProfilePhoto(Principal principal) {
                // Remove the custom profile photo from the database
                userService.deleteProfilePhotoByUsername(principal.getName());
                return ResponseEntity.noContent().build();
        }

        @PatchMapping(value = "/me/profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        @Operation(summary = "Update my settings", description = "Updates the settings and profile information of the authenticated user")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Settings updated successfully"),
                        @ApiResponse(responseCode = "400", description = "Invalid input data"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized user")
        })
        public UserDTO updateMySettings(@ModelAttribute UserSettingsUpdateDTO request, Principal principal)
                        throws IOException {
                userService.updateUserSettings(
                                principal.getName(),
                                request.getNewProfilePhoto(),
                                request.getNewEmail(),
                                request.getNewCardNumber(),
                                request.getNewCardCvv(),
                                request.getNewCardExpiringDate(),
                                request.getNewDescription());

                return userMapper.toDTO(userService.getFullUserProfile(principal.getName()));
        }

        @GetMapping("/me/dashboard")
        @Operation(summary = "Get dashboard data", description = "Retrieves dashboard overview statistics for the authenticated user")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Dashboard data retrieved successfully"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized user")
        })
        public ResponseEntity<Map<String, Object>> getDashboardData(Principal principal) {
                var dashboardData = userService.getUserDashboardData(principal.getName());
                Map<String, Object> response = new HashMap<>();

                // 1. Safe basic data (converted to DTO)
                response.put("user", userMapper.toDTO(dashboardData.user()));
                response.put("totalRevenue", dashboardData.user().getTotalRevenue());
                response.put("balance", dashboardData.user().getBalance());

                // 2. Data arrays for the charts
                response.put("chartLabels", dashboardData.chartLabels());
                response.put("chartValues", dashboardData.chartValues());
                response.put("revenueLabels", dashboardData.revenueLabels());
                response.put("revenueValues", dashboardData.revenueValues());
                response.put("barLabels", dashboardData.barLabels());
                response.put("visitsByCategory", dashboardData.visitsData());
                response.put("interestByCategory", dashboardData.interestData());

                // 3. Converting transactions to DTOs
                if (dashboardData.userSales() != null) {
                        response.put("salesCount", transactionMapper.toDTOs(dashboardData.userSales()));
                } else {
                        response.put("salesCount", java.util.List.of());
                }
                return ResponseEntity.ok(response);
        }

        @GetMapping("/me/transactions")
        @Operation(summary = "Get my transactions summary", description = "Retrieves sales and orders transaction dashboard data for the authenticated user")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Transactions data retrieved successfully"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized user")
        })
        public ResponseEntity<TransactionDashboardDTO> getMyTransactions(Principal principal,
                        @RequestParam(required = false) Long transactionId) {

                TransactionDashboardDTO dashboardData = userService.getSalesAndOrdersDashboardDTO(principal.getName(),
                                transactionId);

                return ResponseEntity.ok(dashboardData);
        }

        /**
         * GET /api/v1/users/me/valorations
         * Retrieves a paginated list of ratings for the authenticated user.
         */
        @GetMapping("/me/valorations")
        @Operation(summary = "Get my sent valorations", description = "Retrieves a paginated list of ratings/valorations given by the authenticated user")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Valorations retrieved successfully"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized user")
        })
        public ResponseEntity<Page<ValorationDTO>> getMySentValorations(
                        Principal principal,
                        Pageable pageable) {

                // my valorations
                Page<ValorationDTO> valorations = valorationService.getMyGivenValorations(principal.getName(),
                                pageable);

                return ResponseEntity.ok(valorations);
        }

        @GetMapping("/me/statistics")
        @Operation(summary = "Get my statistics", description = "Retrieves advanced statistics data for the authenticated user")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Statistics retrieved successfully"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized user")
        })
        public ResponseEntity<UserStatisticsDataDTO> getStatistics(Principal principal) {
                var statisticsData = userService.getUserStatisticsData(principal.getName());
                return ResponseEntity.ok(statisticsData);
        }

        /**
         * This section refers to other users (sellers).
         */

        @GetMapping("/{id}/profile")
        @Operation(summary = "Get seller profile", description = "Retrieves the public profile of a specific seller by their ID")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Seller profile retrieved successfully"),
                        @ApiResponse(responseCode = "404", description = "User not found")
        })
        public SellerProfileDTO getSellerProfile(@PathVariable long id, Principal principal) {
                var seller = userService.getPublicProfileById(id);
                boolean owner = principal != null && principal.getName().equals(seller.getName());
                return new SellerProfileDTO(
                                userMapper.toDTO(seller),
                                productMapper.toDTOs(seller.getProducts()),
                                valorationMapper.toDTOs(seller.getValorations()),
                                productService.calculateFullStars(seller),
                                owner);
        }

        @GetMapping(value = "/{id}/profile-photo", produces = MediaType.IMAGE_PNG_VALUE)
        @Operation(summary = "Get public profile photo", description = "Retrieves the public profile photo of a specific user by ID")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Profile photo retrieved successfully"),
                        @ApiResponse(responseCode = "404", description = "User or photo not found")
        })
        public ResponseEntity<Resource> getPublicProfilePhoto(@PathVariable Long id) throws SQLException {
                Resource image = userService.getProfilePhotoResourceById(id);
                return ResponseEntity.ok()
                                .contentType(MediaType.IMAGE_PNG)
                                .body(image);
        }

        @GetMapping(value = "/search/profile-photo", produces = MediaType.IMAGE_PNG_VALUE)
        @Operation(summary = "Get public profile photo by name", description = "Retrieves the public profile photo of a specific user using their display name as a query parameter")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Profile photo retrieved successfully"),
                        @ApiResponse(responseCode = "404", description = "User or photo not found"),
                        @ApiResponse(responseCode = "500", description = "Internal server error processing the image stream")
        })
        public ResponseEntity<Resource> getProfilePhotoByName(@RequestParam(name = "name") String name) {
                try {
                        Resource resource = userService.getProfilePhotoResourceByUsername(name);

                        return ResponseEntity.ok()
                                        .contentType(MediaType.IMAGE_PNG)
                                        .body(resource);

                } catch (SQLException e) {
                        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error reading image data",
                                        e);
                }
        }

        @GetMapping("/{id}/contact-info")
        @Operation(summary = "Get contact information", description = "Retrieves contact information layout for communicating with a specific seller")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Contact information retrieved successfully"),
                        @ApiResponse(responseCode = "400", description = "Bad request (e.g., trying to contact oneself)"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized user"),
                        @ApiResponse(responseCode = "404", description = "User or product not found")
        })
        public ResponseEntity<Map<String, Object>> getContactInfo(@PathVariable int id, Principal principal) {
                try {
                        var pageData = contactSellerService.getContactSellerPageData(id, principal.getName());

                        Map<String, Object> responseData = Map.of(
                                        "product", productMapper.toDTO(pageData.product()),
                                        "seller", userMapper.toDTO(pageData.seller()),
                                        "buyerName", pageData.buyerName(),
                                        "buyerEmail", pageData.buyerEmail());

                        return ResponseEntity.ok(responseData);

                } catch (IllegalStateException exception) {
                        return ResponseEntity.badRequest().body(Map.of("error", "You cannot self order a product"));
                }
        }
}