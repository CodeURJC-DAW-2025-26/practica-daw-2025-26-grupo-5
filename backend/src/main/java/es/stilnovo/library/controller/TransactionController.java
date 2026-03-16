package es.stilnovo.library.controller;

import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

import es.stilnovo.library.service.TransactionService;

@Controller
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @PostMapping("/transactions/confirm/{productId}")
    public String confirmPayment(@PathVariable long productId, Principal principal) {
        try {
            transactionService.confirmPurchase(productId, principal.getName());
            return "redirect:/sales-and-orders-page";
        } catch (IllegalStateException exception) {
            return "redirect:/info-product-page/" + productId + "?error=" + exception.getMessage();
        }
    }
}
