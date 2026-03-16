package es.stilnovo.library.controller;

import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import es.stilnovo.library.dto.CheckoutDTO;
import es.stilnovo.library.dto.ProductMapper;
import es.stilnovo.library.dto.UserMapper;
import es.stilnovo.library.service.PaymentService;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentRestController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private ProductMapper productMapper;

    @Autowired
    private UserMapper userMapper;

    @GetMapping("/{id}")
    public CheckoutDTO getCheckout(@PathVariable long id, Principal principal) {
        var checkoutData = paymentService.prepareCheckout(id, principal != null ? principal.getName() : null);
        return new CheckoutDTO(
                productMapper.toDTO(checkoutData.product()),
                userMapper.toDTO(checkoutData.buyer()));
    }
}
