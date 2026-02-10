package es.stilnovo.library.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AboutUsController {
	
	@GetMapping("/about-page")
	public String login() {
		return "about-page";
	}
}