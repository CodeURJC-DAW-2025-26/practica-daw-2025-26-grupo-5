package es.stilnovo.library.controller;

import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import es.stilnovo.library.model.Product;
import es.stilnovo.library.service.ProductService;

@Controller // Essential: Tells Spring this class handles web requests
public class InfoProductController {

    @Autowired // Essential: Injects the service to access the database
    private ProductService productService;

    @GetMapping("/info-product-page/{id}")
    public String showProduct(Model model, @PathVariable Long id) {
        Optional<Product> product = productService.findById(id);

        if (product.isPresent()) {
            Product p = product.get();
            model.addAttribute("product", p);
        
            model.addAttribute("seller", p.getSeller()); 
        
            model.addAttribute("relatedProducts", productService.findAll());
            return "info-product-page";
        }
        return "redirect:/";
    }
}