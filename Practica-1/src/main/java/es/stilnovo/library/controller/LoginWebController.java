package es.stilnovo.library.controller;

import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import jakarta.servlet.http.HttpServletRequest;

@Controller
public class LoginWebController {

    @GetMapping("/login-page")
    public String login(Model model, HttpServletRequest request) {
        // We extract the CSRF token from the request attributes
        CsrfToken token = (CsrfToken) request.getAttribute("_csrf");
        if (token != null) {
            model.addAttribute("token", token.getToken());
        }
        return "login-page";
    }

    @GetMapping("/login-error-page")
    public String loginError(Model model, HttpServletRequest request) {
        CsrfToken token = (CsrfToken) request.getAttribute("_csrf");
        if (token != null) {
            model.addAttribute("token", token.getToken());
        }
        // This allows you to show an error message in the HTML
        model.addAttribute("loginError", true);
        return "login-page";
    }
}