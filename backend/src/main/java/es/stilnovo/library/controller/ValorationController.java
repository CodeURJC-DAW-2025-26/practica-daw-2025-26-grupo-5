package es.stilnovo.library.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import es.stilnovo.library.model.User;
import es.stilnovo.library.model.Transaction;
import es.stilnovo.library.service.ValorationService;
import es.stilnovo.library.service.UserService;

/**
 * ValorationController: Manages product reviews and seller ratings
 * 
 * This controller manages:
 * - Display pending reviews/ratings page
 * - Review submission (1-5 stars + comment)
 * - Review validation and persistence
 * - Seller rating calculation after review
 * - User valorations (ratings received) page
 * - Review history display
 * 
 * Uses: ValorationService, UserService
 */
@Controller
public class ValorationController {

    @Autowired
    private ValorationService valorationService;

    @Autowired
    private UserService userService;

    /**
     * Displays the central dashboard for user reviews.
     * Shows pending transactions and the history of submitted ratings.
     */
    @GetMapping("/user-valorations-page")
    public String showValorationDashboard(Model model, Principal principal) {
        // STEP 1: Get authenticated user from security principal
        User user = userService.getFullUserProfile(principal.getName());
        model.addAttribute("user", user);

        // STEP 2: Fetch all transactions awaiting buyer's review
        List<Transaction> pending = valorationService.getPendingTransactions(user);

        // STEP 3: Populate model with pending reviews and count for UI badges
        model.addAttribute("pendingValorations", pending);
        model.addAttribute("pendingCount", valorationService.getPendingValorationCount(user));

        // STEP 4: Fetch buyer's complete rating history
        model.addAttribute("myValorations", valorationService.getBuyerHistory(user));

        return "user-valorations-page";
    }

    /**
     * Processes the submission of a new product review.
     * Redirects back to the dashboard upon successful persistence.
     */
    @PostMapping("/submit-valoration")
    public String submitValoration(Principal principal,
            @RequestParam long transactionId,
            @RequestParam int stars,
            @RequestParam String comment) {
        // STEP 1: Get the authenticated user (buyer) from session
        User buyer = userService.getFullUserProfile(principal.getName());

        // STEP 2: Delegate validation, persistence, and rating calculation to service
        valorationService.saveAndUpdateSellerRating(transactionId, stars, comment, buyer);

        // STEP 3: Redirect to dashboard without exposing internal IDs in URL
        return "redirect:/user-valorations-page";
    }

    /**
     * Handles the deletion of a specific review.
     * Uses @PathVariable to identify the resource, following REST conventions.
     */
    @PostMapping("/valoration/delete/{id}")
    public String deleteValoration(@PathVariable long id, Principal principal) {
        // STEP 1: Get the authenticated user performing the deletion
        User user = userService.getFullUserProfile(principal.getName());

        // STEP 2: Call service to delete the review (includes ownership validation)
        valorationService.deleteValoration(id, user);

        // STEP 3: Redirect back to dashboard
        return "redirect:/user-valorations-page";
    }

    /**
     * Processes the update request for a specific valoration.
     * Uses @PathVariable for the ID and @RequestParam for the form data.
     */
    @PostMapping("/valoration/edit/{id}")
    public String editValoration(@PathVariable long id,
            @RequestParam int stars,
            @RequestParam String comment,
            Principal principal) {

        // 1. Identify the user through the Security Context
        User user = userService.getFullUserProfile(principal.getName());

        // 2. Delegate the update logic to the Service Layer
        valorationService.updateValoration(id, stars, comment, user);

        // 3. Success redirect to the dashboard
        return "redirect:/user-valorations-page";
    }
}