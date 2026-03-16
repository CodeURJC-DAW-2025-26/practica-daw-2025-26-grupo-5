package es.stilnovo.library.controller;

import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import es.stilnovo.library.service.MainService;

/**
 * MainController: Displays the homepage and handles product browsing
 * 
 * This controller manages:
 * - Homepage display with product listings
 * - Product search by query text
 * - Product filtering by category
 * - Personalized recommendations (for logged-in users)
 * - Pagination/infinite scroll for product loading
 * - Auto-redirect when search returns single product
 * 
 * Uses: MainService, ProductService
 */
@Controller
public class MainController {

    @Autowired
    private MainService mainService;

    /** Display homepage with product listings and recommendations */
    @GetMapping("/")
    public String index(Model model,
                        @RequestParam(required = false) String query,
                        @RequestParam(required = false) String category,
                        Principal principal) {
        var homePageData = mainService.getHomePageData(query, category, principal != null ? principal.getName() : null, 10);

        model.addAttribute("products", homePageData.products());
        model.addAttribute("recommendedProducts", homePageData.recommendedProducts());
        model.addAttribute("user", homePageData.user());
        model.addAttribute("logged", homePageData.logged());
        model.addAttribute("isAdmin", homePageData.admin());
        model.addAttribute("query", homePageData.query());
        model.addAttribute("searching", homePageData.searching());
        model.addAttribute("isLast", homePageData.last());
        model.addAttribute("nextOffset", homePageData.nextOffset());

        if (homePageData.products().size() == 1 && homePageData.searching()) {
            return "redirect:/info-product-page/" + homePageData.products().get(0).getId();
        }

        return "index";
    }
}