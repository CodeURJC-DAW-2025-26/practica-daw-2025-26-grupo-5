package es.stilnovo.library.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SignupWebController {

    @GetMapping("/signup-page")
    public String signup() {
        return "signup-page"; 
    }

    @GetMapping("/signup-error-page")
    public String signupError() {
        return "signup-error-page"; 
    }
}