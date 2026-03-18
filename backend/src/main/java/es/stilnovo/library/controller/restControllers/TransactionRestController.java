package es.stilnovo.library.controller.restControllers;

import java.security.Principal;
import java.net.URI;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
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
import es.stilnovo.library.dto.UserMapper;
import es.stilnovo.library.service.PaymentService;
import es.stilnovo.library.service.TransactionService;

@RestController
@RequestMapping("/api/v1/transactions")
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
     * Processes and confirms a new product purchase.
     * The buyer identity is resolved from the security context, and the transaction 
     * is created based on the provided product ID.
     *
     * @param request   DTO containing the target product ID for the purchase.
     * @param principal The security context of the authenticated buyer.
     * @return ResponseEntity with 201 Created status, the URI location of the new 
     * transaction, and the confirmed TransactionDTO.
     */
    @PostMapping
    public ResponseEntity<TransactionDTO> createTransaction(@RequestBody TransactionCreateRequestDTO request, Principal principal) {
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
     * @return TransactionDTO containing the full deal details (price, date, participants).
     */
    @GetMapping("/{id}")
    public TransactionDTO getTransaction(@PathVariable long id, Principal principal) {
        return transactionMapper.toDTO(transactionService.getTransactionForInvolvedUser(id, principal.getName()));
    }

    /**
     * Retrieves a paginated list of all sales (transactions as a seller) 
     * for the authenticated user.
     *
     * @param principal The security context of the authenticated seller.
     * @param pageable  Pagination and sorting parameters (page, size, sort).
     * @return PagedResponse containing a list of TransactionDTOs representing sales.
     */
    @GetMapping("/sales")
    public PagedResponse<TransactionDTO> getSellerTransactions(Principal principal,
            @PageableDefault(size = 10) Pageable pageable) {
        
        var page = transactionService.getSellerTransactions(principal.getName(), pageable);
        
        return new PagedResponse<>(transactionMapper.toDTOs(page.getContent()),
                page.getNumber(), page.getSize(), page.getTotalElements(), page.isLast());
    }

    /**
     * Prepares the checkout summary for a potential purchase.
     * This endpoint aggregates the product to be bought and the authenticated buyer's 
     * profile data to facilitate the final review step in the payment process.
     *
     * @param id        The unique identifier of the product to be purchased.
     * @param principal The security context of the authenticated user (prospective buyer).
     * @return CheckoutDTO containing the product details and the buyer's information.
     */
    @GetMapping("/{id}/checkout")
    public CheckoutDTO getCheckout(@PathVariable long id, Principal principal) {
        // 1. Prepare checkout data through the payment service
        // Resolves the buyer's name from the Principal for a personalized summary
        var checkoutData = paymentService.prepareCheckout(id, principal != null ? principal.getName() : null);
        
        // 2. Map domain objects to DTOs for the final response
        return new CheckoutDTO(
                productMapper.toDTO(checkoutData.product()),
                userMapper.toDTO(checkoutData.buyer()));
    }
}
