package es.stilnovo.library.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import es.stilnovo.library.model.Valoration;
import es.stilnovo.library.model.User;
import es.stilnovo.library.dto.ValorationDTO;
import es.stilnovo.library.dto.ValorationMapper;
import es.stilnovo.library.model.Transaction;

import es.stilnovo.library.repository.ValorationRepository;
import es.stilnovo.library.repository.UserRepository;
import es.stilnovo.library.repository.TransactionRepository;

/**
 * ValorationService: Manages user reviews and ratings
 * 
 * This service handles:
 * - Rating/review creation after completed transactions
 * - Pending reviews retrieval (transactions awaiting feedback)
 * - Seller rating calculation and aggregation
 * - Review persistence and management
 * 
 * Uses: ValorationRepository, UserRepository, TransactionRepository
 */
@Service
public class ValorationService {

    @Autowired
    private ValorationRepository valorationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private ValorationMapper valorationMapper;

    /**
     * Filters transactions that have been completed by the buyer but have no rating yet.
     * @param buyer The user whose pending reviews are being searched.
     * @return A list of transactions awaiting feedback.
     */
    @Transactional(readOnly = true)
    public List<Transaction> getPendingTransactions(User buyer) {
        // STEP 1: Fetch all transactions where user is the buyer
        List<Transaction> allOrders = transactionRepository.findByBuyerUserId(buyer.getUserId());
        
        // STEP 2: Filter out transactions that already have a rating
        // STEP 3: Return only unrated transactions (pending reviews)
        return allOrders.stream()
                .filter(trans -> !valorationRepository.existsByTransaction(trans))
                .collect(Collectors.toList());
    }

    /**
     * Gets count of pending valorations for a user
     */
    public int getPendingValorationCount(User buyer) {
        List<Transaction> pending = getPendingTransactions(buyer);
        return pending.size();
    }

    /**
     * Creates a new valoration and updates the seller's global rating in one transaction.
     * This ensures data consistency between reviews and displayed scores.
     * * @param transactionId The ID of the transaction being rated.
     * @param stars Score from 1 to 5.
     * @param comment Qualitative feedback from the buyer.
     * @param buyer The user submitting the review.
     */
    @Transactional
    public void saveAndUpdateSellerRating(long transactionId, int stars, String comment, User buyer) {
        // STEP 1: Fetch transaction and validate it exists
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));

        // STEP 2: Security check - buyer can only rate their own purchases
        if (!transaction.getBuyer().getUserId().equals(buyer.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only rate your own purchases");
        }

        // STEP 3: Prevent duplicate ratings - a transaction can only be rated once
        if (valorationRepository.existsByTransaction(transaction)) {
            throw new IllegalStateException("This transaction has already been rated");
        }
        
        // STEP 4: Create and persist the new review
        Valoration valoration = new Valoration(transaction, stars, comment);
        valorationRepository.save(valoration);

        // STEP 5: Update seller's average rating and review count
        updateSellerStats(transaction.getSeller());
    }

    /**
     * Creates and persists a new valoration for a completed transaction.
     * Returns the managed entity so callers can build a Location header.
     */
    @Transactional
    public Valoration createValoration(long transactionId, int stars, String comment, User buyer) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));

        if (!transaction.getBuyer().getUserId().equals(buyer.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only rate your own purchases");
        }

        if (valorationRepository.existsByTransaction(transaction)) {
            throw new IllegalStateException("This transaction has already been rated");
        }

        Valoration valoration = valorationRepository.save(new Valoration(transaction, stars, comment));
        updateSellerStats(transaction.getSeller());
        return valoration;
    }

    @Transactional(readOnly = true)
    public Valoration findById(Long id) {
        return valorationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Valoration not found"));
    }

    /**
     * Re-calculates the average rating and total review count for a seller.
     */
    private void updateSellerStats(User seller) {
        List<Valoration> valorations = valorationRepository.findBySeller(seller);
        
        double average = valorations.stream()
                .mapToDouble(Valoration::getStars)
                .average()
                .orElse(0.0);
        
        seller.setRating(average);
        seller.setNumRatings(valorations.size());
        
        userRepository.save(seller);
    }

    /**
     * Returns all reviews submitted by a specific user.
     */
    public List<Valoration> getBuyerHistory(User buyer) {
        return valorationRepository.findByBuyer(buyer);
    }

    /**
     * Permanently removes a valoration from the database.
     * This operation triggers a recalculation of the seller's overall rating.
     * * @param id The unique identifier of the valoration to delete.
     * @param currentUser The authenticated user requesting the deletion.
     */
    @Transactional
    public void deleteValoration(long id, User currentUser) {
        // 1. Find the valoration or throw 404
        Valoration valoration = valorationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Valoration not found"));

        // 2. Security Check: Only the author (buyer) can delete their review
        if (!valoration.getBuyer().getUserId().equals(currentUser.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own reviews");
        }

        // 3. Keep a reference to the seller before deletion to update their stats
        User seller = valoration.getSeller();

        // 4. Perform deletion
        valorationRepository.delete(valoration);

        // 5. Atomic Update: Recalculate seller's rating and count
        updateSellerStats(seller);
    }

    /**
     * Updates an existing valoration's score and feedback.
     * After the update, it triggers a recalculation of the seller's average rating.
     * * @param id The ID of the valoration to edit.
     * @param stars The new star rating (1-5).
     * @param comment The updated text feedback.
     * @param currentUser The authenticated user (must be the author of the review).
     */
    @Transactional
    public void updateValoration(long id, int stars, String comment, User currentUser) {
        // 1. Fetch the existing valoration or throw 404
        Valoration valoration = valorationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Valoration not found"));

        // 2. Security Check: Ensure only the original buyer can edit the review
        if (!valoration.getBuyer().getUserId().equals(currentUser.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to edit this review");
        }

        // 3. Update the fields in the managed entity
        valoration.setStars(stars);
        valoration.setComment(comment);
        
        // Save is implicit due to @Transactional, but calling it for clarity
        valorationRepository.save(valoration);

        // 4. Critical Step: Recalculate the seller's global score
        // Since the stars have changed, the average must be updated immediately.
        updateSellerStats(valoration.getSeller());
    }

    /**
     * Retrieves all valorations from the database.
     * Used by the Admin Global Valorations panel.
     * * @return A list of all persisted valorations.
     */
    @Transactional(readOnly = true)
    public List<Valoration> findAll() {
        return valorationRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Page<Valoration> findAll(Pageable pageable) {
        return valorationRepository.findAll(pageable);
    }

    /**
     * Calculates the global average rating across all valorations in the system.
     * This is used for admin dashboard statistics.
     * @return Average rating from 0 to 5 (or 0.0 if no valorations exist)
     */
    @Transactional(readOnly = true)
    public double getGlobalAverageRating() {
        List<Valoration> allValorations = valorationRepository.findAll();
        if (allValorations.isEmpty()) {
            return 0.0;
        }
        return allValorations.stream()
                .mapToDouble(Valoration::getStars)
                .average()
                .orElse(0.0);
    }

    /**
     * Deletes a valoration by its ID (Admin version).
     * This method disconnects the review from users and triggers an 
     * atomic update of the seller's statistics (average rating and count).
     *
     * @param id The unique identifier of the valoration to be removed.
     * @throws ResponseStatusException 404 if the valoration is not found.
     */
    @Transactional
    public void deleteById(Long id) {
        // 1. Find the valoration or throw 404
        Valoration valoration = valorationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Valoration not found"));

        // 2. Keep reference to the seller before deletion
        User seller = valoration.getSeller();

        // 3. Clear references in User entities to ensure consistency
        if (seller != null) {
            seller.getValorations().remove(valoration);
        }

        // 4. Perform the hard delete from the repository
        valorationRepository.delete(valoration);

        // 5. CRITICAL: Recalculate seller stats using the existing helper
        // This updates the 'rating' and 'numRatings' fields in the user_table
        if (seller != null) {
            updateSellerStats(seller);
        }
    }

    /**
     * Fetches paginated ratings submitted BY the user to other sellers.
     */
    public Page<ValorationDTO> getMyGivenValorations(String username, Pageable pageable) {
        // 1. We search the repository using the new method by buyer
        Page<Valoration> valorations = valorationRepository.findByBuyerName(username, pageable);
        
        // 2. We map to DTO so as not to return entities
        return valorations.map(valorationMapper::toDTO);
    }
}