package es.stilnovo.library.controller;

import java.security.Principal;
import java.util.List;
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

import es.stilnovo.library.dto.PagedResponse;
import es.stilnovo.library.dto.TransactionCreateRequestDTO;
import es.stilnovo.library.dto.TransactionDTO;
import es.stilnovo.library.dto.TransactionMapper;
import es.stilnovo.library.service.TransactionService;

@RestController
@RequestMapping("/api/v1/transactions")
public class TransactionRestController {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private TransactionMapper transactionMapper;

    @PostMapping
    public ResponseEntity<TransactionDTO> createTransaction(@RequestBody TransactionCreateRequestDTO request, Principal principal) {
        var created = transactionService.confirmPurchase(request.productId(), principal.getName());
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.getTransactionId())
                .toUri();
        return ResponseEntity.created(location).body(transactionMapper.toDTO(created));
    }

    @GetMapping("/{id}")
    public TransactionDTO getTransaction(@PathVariable long id, Principal principal) {
        return transactionMapper.toDTO(transactionService.getTransactionForInvolvedUser(id, principal.getName()));
    }

    @GetMapping("/sales")
    public PagedResponse<TransactionDTO> getSellerTransactions(Principal principal,
            @PageableDefault(size = 10) Pageable pageable) {
        var page = transactionService.getSellerTransactions(principal.getName(), pageable);
        return new PagedResponse<>(transactionMapper.toDTOs(page.getContent()),
                page.getNumber(), page.getSize(), page.getTotalElements(), page.isLast());
    }
}
