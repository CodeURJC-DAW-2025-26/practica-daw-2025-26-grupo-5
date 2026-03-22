package es.stilnovo.library.controller.restControllers;

import java.security.Principal;
import java.net.URI;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import es.stilnovo.library.dto.CheckoutDTO;
import es.stilnovo.library.dto.PagedResponse;
import es.stilnovo.library.dto.ProductMapper;
import es.stilnovo.library.dto.TransactionCreateRequestDTO;
import es.stilnovo.library.dto.TransactionDTO;
import es.stilnovo.library.dto.TransactionMapper;
import es.stilnovo.library.dto.TransactionUpdateRequestDTO;
import es.stilnovo.library.dto.UserMapper;
import es.stilnovo.library.model.Transaction;
import es.stilnovo.library.service.PaymentService;
import es.stilnovo.library.service.TransactionService;
import jakarta.validation.Valid;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1/transactions")
@Tag(name = "Transactions", description = "REST API for managing purchases, sales, and checkout operations")
public class TransactionRestController {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private TransactionMapper transactionMapper;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private ProductMapper productMapper;

    @Autowired
    private UserMapper userMapper;

    /**
     * Processes and confirms a **new product purchase**.
     * The buyer identity is resolved from the security context, and the transaction
     * is created based on the provided product ID.
     *
     * @param request   DTO containing the target product ID for the purchase.
     * @param principal The security context of the authenticated buyer.
     * @return ResponseEntity with 201 Created status, the URI location of the new
     * transaction, and the confirmed TransactionDTO.
     */
    @PostMapping
    @Operation(summary = "Create a transaction", description = "Processes and confirms a new product purchase")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Transaction created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized user"),
        @ApiResponse(responseCode = "404", description = "Product not found"),
        @ApiResponse(responseCode = "409", description = "Conflict (e.g., insufficient balance or product already sold)")
    })
    public ResponseEntity<TransactionDTO> createTransaction(@Valid @RequestBody TransactionCreateRequestDTO request,
            Principal principal) {
        // 1. Confirm the purchase via service (handles balance checks and inventory)
        var created = transactionService.confirmPurchase(request.productId(), principal.getName());

        // 2. Build the resource location URI using the new transaction ID
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.getTransactionId())
                .toUri();

        return ResponseEntity.created(location).body(transactionMapper.toDTO(created));
    }

    /**
     * Retrieves the details of a specific transaction by its ID.
     * Access is restricted: the service layer ensures the authenticated user is
     * either the buyer or the seller involved in this specific transaction.
     *
     * @param id        The unique identifier of the transaction.
     * @param principal The security context of the user requesting the data.
     * @return TransactionDTO containing the full deal details (price, date,
     * participants).
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get transaction details", description = "Retrieves the details of a specific transaction by its ID. Access is restricted to the buyer or seller.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Transaction details retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized user"),
        @ApiResponse(responseCode = "403", description = "Forbidden (user is not involved in this transaction)"),
        @ApiResponse(responseCode = "404", description = "Transaction not found")
    })
    public TransactionDTO getTransaction(@PathVariable long id, Principal principal) {
        return transactionMapper.toDTO(transactionService.getTransactionForInvolvedUser(id, principal.getName()));
    }

    /**
     * Retrieves a paginated list of all sales (transactions as a seller)
     * for the authenticated user.
     *
     * @param principal The security context of the authenticated seller.
     * @param pageable  Pagination and sorting parameters (page, size, sort).
     * @return PagedResponse containing a list of TransactionDTOs representing
     * sales.
     */
    @GetMapping("/sales")
    @Operation(summary = "Get seller transactions", description = "Retrieves a paginated list of all sales for the authenticated user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Sales retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized user")
    })
    public PagedResponse<TransactionDTO> getSellerTransactions(Principal principal,
            @PageableDefault(size = 10) Pageable pageable) {

        var page = transactionService.getSellerTransactions(principal.getName(), pageable);

        return new PagedResponse<>(transactionMapper.toDTOs(page.getContent()),
                page.getNumber(), page.getSize(), page.getTotalElements(), page.isLast());
    }

    /**
     * Prepares the checkout summary for a potential purchase.
     * Security: Only authenticated buyers can retrieve checkout information.
     * This endpoint aggregates the product details and the authenticated
     * buyer's profile data to facilitate the final review step.
     *
     * @param id        The unique identifier of the product to be purchased.
     * @param principal The security context of the authenticated user (guaranteed to be non-null).
     * @return CheckoutDTO containing the product details and the buyer's information.
     * Note: This is a read-only preview and does not execute the transaction.
     */
    @GetMapping("/{id}/checkout")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get checkout summary", description = "Prepares the checkout summary for a potential purchase. Only authenticated users can access.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Checkout summary retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized user"),
        @ApiResponse(responseCode = "404", description = "Product not found")
    })
    public CheckoutDTO getCheckout(@PathVariable long id, Principal principal) {
        // 1. Prepare checkout data through the payment service
        // Resolves the buyer's name from the Principal for a personalized summary
        // Principal is guaranteed by Spring Security, no null check needed
        var checkoutData = paymentService.prepareCheckout(id, principal.getName());

        // 2. Map domain objects to DTOs for the final response
        return new CheckoutDTO(
                productMapper.toDTO(checkoutData.product()),
                userMapper.toDTO(checkoutData.buyer()));
    }
    
    /**
     * Updates an existing transaction.
     * * @param id The unique identifier of the transaction to update.
     * @param request The DTO containing the updated fields.
     * @param principal The security context of the authenticated user.
     * @return ResponseEntity with 200 OK and the updated TransactionDTO.
     */
    @PutMapping("/{id}")
    @Operation(summary = "Update transaction", description = "Updates an existing transaction")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Transaction updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized user"),
        @ApiResponse(responseCode = "403", description = "Forbidden (user lacks permissions to update)"),
        @ApiResponse(responseCode = "404", description = "Transaction not found")
    })
    public ResponseEntity<TransactionDTO> updateTransaction(
            @PathVariable long id,
            @Valid @RequestBody TransactionUpdateRequestDTO request,
            Principal principal) {
        
        Transaction updatedTransaction = transactionService.updateTransaction(id, request, principal.getName());
        
        return ResponseEntity.ok(transactionMapper.toDTO(updatedTransaction));
    }

    /**
     * Deletes a specific transaction by its ID.
     * * @param id The unique identifier of the transaction to delete.
     * @param principal The security context of the authenticated user.
     * @return ResponseEntity with 204 No Content status, standard for successful deletions.
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete transaction", description = "Deletes a specific transaction by its ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Transaction deleted successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized user"),
        @ApiResponse(responseCode = "403", description = "Forbidden (user lacks permissions to delete)"),
        @ApiResponse(responseCode = "404", description = "Transaction not found")
    })
    public ResponseEntity<Void> deleteTransaction(
            @PathVariable long id,
            Principal principal) {

        transactionService.deleteTransaction(id);
        
        return ResponseEntity.noContent().build();
    }
}