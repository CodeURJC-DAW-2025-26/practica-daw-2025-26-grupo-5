package es.stilnovo.library.controller.restControllers;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import es.stilnovo.library.dto.AdminSummaryDTO;
import es.stilnovo.library.dto.AdminUserBanRequestDTO;
import es.stilnovo.library.dto.PagedResponse;
import es.stilnovo.library.dto.ProductDTO;
import es.stilnovo.library.dto.ProductMapper;
import es.stilnovo.library.dto.TransactionDTO;
import es.stilnovo.library.dto.TransactionMapper;
import es.stilnovo.library.dto.UserDTO;
import es.stilnovo.library.dto.UserMapper;
import es.stilnovo.library.dto.ValorationDTO;
import es.stilnovo.library.dto.ValorationMapper;
import es.stilnovo.library.model.Product;
import es.stilnovo.library.model.User;
import es.stilnovo.library.service.AdminService;
import es.stilnovo.library.service.ProductService;
import es.stilnovo.library.service.TransactionService;
import es.stilnovo.library.service.UserService;
import es.stilnovo.library.service.ValorationService;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminRestController {

	@Autowired
	private AdminService adminService;

	@Autowired
	private UserService userService;

	@Autowired
	private ProductService productService;

	@Autowired
	private UserMapper userMapper;

	@Autowired
	private ProductMapper productMapper;

	@Autowired
	private TransactionMapper transactionMapper;

	@Autowired
	private ValorationMapper valorationMapper;

	@Autowired
	private TransactionService transactionService;

	@Autowired
	private ValorationService valorationService;


	@GetMapping("/summary")
	public AdminSummaryDTO getAdminPanel() {
		var panelData = adminService.getAdminPanelData();
		return new AdminSummaryDTO(
				panelData.numUsers(),
				panelData.numBanneds(),
				panelData.memoryUsage(),
				userMapper.toDTOs(panelData.users()),
				productMapper.toDTOs(panelData.products()));
	}

	
	@GetMapping("/users")
	public PagedResponse<UserDTO> getUsers(@PageableDefault(size = 10) Pageable pageable) {
		var page = adminService.getUsersPage(pageable);
		return new PagedResponse<>(userMapper.toDTOs(page.getContent()), page.getNumber(), page.getSize(),
				page.getTotalElements(), page.isLast());
	}

	@GetMapping("/users/{id}")
	public UserDTO getUserById(@PathVariable Long id) {
		User user = userService.findById(id)
				.orElseThrow(() -> new RuntimeException("User not found"));
		return userMapper.toDTO(user);
	}

	@PutMapping("/users/{id}")
	public ResponseEntity<UserDTO> updateUser(
			@PathVariable Long id,
			@RequestParam(required = false) String email,
			@RequestParam(required = false) String cardNumber,
			@RequestParam(required = false) String cardCvv,
			@RequestParam(required = false) String cardExpiringDate,
			@RequestParam(required = false) String description) throws IOException {

		adminService.updateUserAsAdmin(
				id,
				null,
				email,
				cardNumber,
				cardCvv,
				cardExpiringDate,
				description);

		User updatedUser = userService.findById(id).orElseThrow();
		return ResponseEntity.ok(userMapper.toDTO(updatedUser));
	}

	@PatchMapping("/users/{id}")
	public UserDTO updateUserBanStatus(@PathVariable Long id, @RequestBody AdminUserBanRequestDTO request) {
		return userMapper.toDTO(adminService.setBanStatus(id, request.banned()));
	}

	@DeleteMapping("/users/{id}")
	public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
		adminService.deleteUser(id);
		return ResponseEntity.noContent().build();
	}


	@GetMapping("/products")
	public PagedResponse<ProductDTO> getProducts(@PageableDefault(size = 10) Pageable pageable) {
		var page = adminService.getInventoryPage(pageable);
		return new PagedResponse<>(productMapper.toDTOs(page.getContent()), page.getNumber(), page.getSize(),
				page.getTotalElements(), page.isLast());
	}


	@GetMapping("/products/{id}")
	public ProductDTO getProductById(@PathVariable Long id) {
		Product product = productService.findById(id)
				.orElseThrow(() -> new RuntimeException("Product not found"));
		return productMapper.toDTO(product);
	}

	@PostMapping(value = "/products", consumes = "multipart/form-data")
	public ResponseEntity<ProductDTO> createProduct(
			@RequestParam Long sellerId,
			@RequestParam String name,
			@RequestParam String category,
			@RequestParam String description,
			@RequestParam Double price,
			@RequestParam String location,
			@RequestParam(defaultValue = "Active") String status,
			@RequestParam(required = false) MultipartFile file) throws IOException {

		Product product = adminService.createProductAsAdmin(
				sellerId,
				name,
				category,
				description,
				price,
				location,
				status,
				file);

		return ResponseEntity.ok(productMapper.toDTO(product));
	}


	@PutMapping(value = "/products/{id}", consumes = "multipart/form-data")
	public ResponseEntity<ProductDTO> updateProduct(
			@PathVariable Long id,
			@RequestParam(required = false) String name,
			@RequestParam(required = false) String category,
			@RequestParam(required = false) Double price,
			@RequestParam(required = false) String description,
			@RequestParam(required = false) String location,
			@RequestParam(required = false) String status,
			@RequestParam(required = false) MultipartFile file) throws IOException {

		Product updated = new Product();

		updated.setName(name);
		if (price != null) updated.setPrice(price);
		updated.setCategory(category);
		updated.setDescription(description);
		updated.setLocation(location);
		updated.setStatus(status);

		adminService.updateProductAsAdmin(id, updated, file);

		Product finalProduct = productService.findById(id).orElseThrow();
		return ResponseEntity.ok(productMapper.toDTO(finalProduct));
	}

	@DeleteMapping("/products/{id}")
	public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
		adminService.deleteProductAsAdmin(id);
		return ResponseEntity.noContent().build();
	}


	@GetMapping("/transactions")
	public PagedResponse<TransactionDTO> getTransactions(@PageableDefault(size = 10) Pageable pageable) {
		var page = adminService.getTransactionsPage(pageable);
		return new PagedResponse<>(transactionMapper.toDTOs(page.getContent()), page.getNumber(), page.getSize(),
				page.getTotalElements(), page.isLast());
	}

	@DeleteMapping("/transactions/{id}")
	public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
		transactionService.deleteTransaction(id);
		return ResponseEntity.noContent().build();
	}



	@GetMapping("/valorations")
	public PagedResponse<ValorationDTO> getValorations(@PageableDefault(size = 10) Pageable pageable) {
		var page = adminService.getValorationsPage(pageable);
		return new PagedResponse<>(valorationMapper.toDTOs(page.getContent()), page.getNumber(), page.getSize(),
				page.getTotalElements(), page.isLast());
	}

	@DeleteMapping("/valorations/{id}")
	public ResponseEntity<Void> deleteValoration(@PathVariable Long id) {
		valorationService.deleteById(id);
		return ResponseEntity.noContent().build();
	}
}
