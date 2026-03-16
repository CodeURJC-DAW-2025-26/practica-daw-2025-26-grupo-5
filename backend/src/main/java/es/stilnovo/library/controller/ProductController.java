package es.stilnovo.library.controller;

import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import es.stilnovo.library.model.User;
import es.stilnovo.library.service.CatalogPageResult;
import es.stilnovo.library.service.MainService;
import es.stilnovo.library.service.ProductService;

/** Controller for product loading and pagination */
@Controller
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private MainService mainService;

    /**
     * Load next batch of products via AJAX for infinite scroll feature
     * Handles search filtering, category filtering, and pagination
     * @param offset number of products to skip
     * @param query optional search text
     * @param category optional category filter
     * @param principal current user session
     * @param model UI data model
     * @return product_items template fragment
     */
    @GetMapping("/load-more-products")
    public String loadMore(@RequestParam int offset, 
                            @RequestParam(required = false) String query,
                            @RequestParam(required = false) String category,
                            Principal principal,
                            Model model) {
        User user = mainService.getUserContext(principal != null ? principal.getName() : null);
        int pageSize = 10;
        int pageNumber = Math.max(0, offset / pageSize);

        CatalogPageResult page = productService.getCatalogPage(query, category, user, PageRequest.of(pageNumber, pageSize));

        model.addAttribute("products", page.products());
        model.addAttribute("isLast", page.last());
        
        return "product_items"; 
    }
}