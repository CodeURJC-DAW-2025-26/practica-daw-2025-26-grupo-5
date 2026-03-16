package es.stilnovo.library.controller;

import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import es.stilnovo.library.dto.ContactSellerPageDTO;
import es.stilnovo.library.dto.ProductMapper;
import es.stilnovo.library.dto.UserMapper;
import es.stilnovo.library.service.ContactSellerService;

@RestController
@RequestMapping("/api/v1/contact-seller")
public class ContactSellerRestController {

	@Autowired
	private ContactSellerService contactSellerService;

	@Autowired
	private ProductMapper productMapper;

	@Autowired
	private UserMapper userMapper;

	@GetMapping("/{id}")
	public ContactSellerPageDTO getContactSellerData(@PathVariable long id, Principal principal) {
		var pageData = contactSellerService.getContactSellerPageData(id, principal.getName());
		return new ContactSellerPageDTO(
				productMapper.toDTO(pageData.product()),
				userMapper.toDTO(pageData.seller()),
				pageData.buyerName(),
				pageData.buyerEmail());
	}
}
