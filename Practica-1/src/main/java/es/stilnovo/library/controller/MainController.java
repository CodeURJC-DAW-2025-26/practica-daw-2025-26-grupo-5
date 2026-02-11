package es.stilnovo.library.controller;

import jakarta.servlet.http.HttpServletRequest;
import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import es.stilnovo.library.service.ProductService;

@Controller
public class MainController {

    @Autowired
    private ProductService productService;

    @GetMapping("/")
    public String index(Model model) {
        // Only focus on loading products for the marketplace
        model.addAttribute("products", productService.findAll());
        return "index";
    }
}