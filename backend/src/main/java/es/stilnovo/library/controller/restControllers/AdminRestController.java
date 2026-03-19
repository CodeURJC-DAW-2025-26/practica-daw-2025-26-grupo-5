package es.stilnovo.library.controller.restControllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import es.stilnovo.library.dto.AdminUserBanRequestDTO;
import es.stilnovo.library.dto.AdminSummaryDTO;
import es.stilnovo.library.dto.PagedResponse;
import es.stilnovo.library.dto.ProductDTO;
import es.stilnovo.library.dto.ProductMapper;
import es.stilnovo.library.dto.TransactionDTO;
import es.stilnovo.library.dto.TransactionMapper;
import es.stilnovo.library.dto.UserDTO;
import es.stilnovo.library.dto.UserMapper;
import es.stilnovo.library.dto.ValorationDTO;
import es.stilnovo.library.dto.ValorationMapper;
import es.stilnovo.library.service.AdminService;
import es.stilnovo.library.service.TransactionService;
import es.stilnovo.library.service.ValorationService;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminRestController {

	@Autowired
	private AdminService adminService;

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

	@PatchMapping("/users/{id}")
	public UserDTO updateUserBanStatus(@PathVariable Long id, @RequestBody AdminUserBanRequestDTO request) {
		return userMapper.toDTO(adminService.setBanStatus(id, request.banned()));
	}

	@DeleteMapping("/users/{id}")
	public void deleteUser(@PathVariable Long id) {
		adminService.deleteUser(id);
	}

	@GetMapping("/products")
	public PagedResponse<ProductDTO> getProducts(@PageableDefault(size = 10) Pageable pageable) {
		var page = adminService.getInventoryPage(pageable);
		return new PagedResponse<>(productMapper.toDTOs(page.getContent()), page.getNumber(), page.getSize(),
				page.getTotalElements(), page.isLast());
	}

	@DeleteMapping("/products/{id}")
	public void deleteProduct(@PathVariable Long id) {
		adminService.deleteProductAsAdmin(id);
	}

	@GetMapping("/transactions")
	public PagedResponse<TransactionDTO> getTransactions(@PageableDefault(size = 10) Pageable pageable) {
		var page = adminService.getTransactionsPage(pageable);
		return new PagedResponse<>(transactionMapper.toDTOs(page.getContent()), page.getNumber(), page.getSize(),
				page.getTotalElements(), page.isLast());
	}

	@DeleteMapping("/transactions/{id}")
	public void deleteTransaction(@PathVariable Long id) {
		transactionService.deleteTransaction(id);
	}

	@GetMapping("/reviews") // cambia esto por valoration y no reviews
	public PagedResponse<ValorationDTO> getValorations(@PageableDefault(size = 10) Pageable pageable) {
		var page = adminService.getValorationsPage(pageable);
		return new PagedResponse<>(valorationMapper.toDTOs(page.getContent()), page.getNumber(), page.getSize(),
				page.getTotalElements(), page.isLast());
	}

	@DeleteMapping("/reviews/{id}")
	public void deleteValoration(@PathVariable Long id) {
		valorationService.deleteById(id);
	}
}
