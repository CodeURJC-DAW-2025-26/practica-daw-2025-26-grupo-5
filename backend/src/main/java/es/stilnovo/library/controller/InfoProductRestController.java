package es.stilnovo.library.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import es.stilnovo.library.dto.ProductDetailsDTO;
import es.stilnovo.library.dto.ProductMapper;
import es.stilnovo.library.model.Product;
import es.stilnovo.library.model.User;
import es.stilnovo.library.service.MainService;
import es.stilnovo.library.service.ProductService;

@RestController
@RequestMapping("/api/v1/products")
public class InfoProductRestController {

    @Autowired
    private ProductService productService;

    @Autowired
    private MainService mainService;

    @Autowired
    private ProductMapper productMapper;

    @GetMapping("/{id}")
    public ProductDetailsDTO getProductDetails(@PathVariable long id, Principal principal) {
        User user = principal != null ? mainService.getUserContext(principal.getName()) : null;
        Product product = productService.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        if (user != null) {
            productService.recordView(user, product);
        }

        List<Product> recommendations = productService.getRecommendations(user);
        recommendations.removeIf(current -> current.getId().equals(id));

        return new ProductDetailsDTO(
                productMapper.toDTO(product),
                productMapper.toDTOs(recommendations),
                user != null);
    }
}
