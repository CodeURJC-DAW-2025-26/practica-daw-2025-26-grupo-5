package es.stilnovo.library.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import es.stilnovo.library.model.Product;
import es.stilnovo.library.service.ProductService;

@Controller
public class MainController {

    @Autowired
    private ProductService productService;

    // Added @RequestParam to capture the search input from the HTML form
    @GetMapping("/")
    public String index(Model model, @RequestParam(required = false) String query) {
    
        // 1. Fetch the list of products based on the search query
        List<Product> products = productService.findByQuery(query);

        // 2. LOGIC: If exactly ONE product is found during a search, redirect to its info page
        // We check that query is not null to avoid redirecting on the first page load
        if (query != null && !query.isEmpty() && products.size() == 1) {
            long productId = products.get(0).getId();
            // Redirect to the product detail route (adjust the URL to your actual info path)
            return "redirect:/info-product-page/" + productId;
        }

        // 3. Otherwise, show the marketplace list as usual
        model.addAttribute("products", products);
        model.addAttribute("query", (query != null) ? query : ""); 
    
        return "index";
    }
}