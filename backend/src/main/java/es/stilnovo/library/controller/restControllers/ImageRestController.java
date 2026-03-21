package es.stilnovo.library.controller.restControllers;

import java.io.IOException;
import java.security.Principal;
import java.sql.SQLException;
import java.net.URI;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import es.stilnovo.library.dto.ImageDTO;
import es.stilnovo.library.dto.ImageMapper;
import es.stilnovo.library.dto.ProductDTO;
import es.stilnovo.library.dto.ProductMapper;
import es.stilnovo.library.service.ImageService;
import es.stilnovo.library.service.ProductService;

/**
 * REST Controller for image operations
 * Provides endpoints for retrieving and replacing product images
 */
@RestController
@RequestMapping("/api/v1")
public class ImageRestController {

	@Autowired
	private ImageService imageService;

	@Autowired
	private ProductService productService;

	@Autowired
	private ImageMapper imageMapper;

	@Autowired
	private ProductMapper productMapper;

	/**
	 * Retrieves image metadata for a specific product
	 * @param productId The ID of the product
	 * @return ImageDTO containing the image ID
	 */
	@GetMapping("/products/{productId}/image")
	public ImageDTO getProductImage(@PathVariable long productId) {
		return imageMapper.toDTO(imageService.getProductImage(productId));
	}

	/**
	 * Retrieves the actual image file bytes
	 * @param imageId The ID of the image to retrieve
	 * @return JPEG image content as ResponseEntity
	 * @throws SQLException If database access fails
	 */
	@GetMapping(value = "/images/{imageId}/file", produces = MediaType.IMAGE_JPEG_VALUE)
	public ResponseEntity<Resource> getImageFile(@PathVariable long imageId) throws SQLException {
		return ResponseEntity.ok().contentType(MediaType.IMAGE_JPEG).body(imageService.getImageFile(imageId));
	}

	@PostMapping("/products/{productId}/image")
	public ResponseEntity<ProductDTO> replaceProductImage(@PathVariable long productId,
			@RequestParam("file") MultipartFile file,
			Principal principal) throws IOException {
		var product = productMapper.toDTO(productService.replaceImage(productId, principal.getName(), file));
		URI location = ServletUriComponentsBuilder.fromCurrentContextPath()
				.path("/api/v1/products/{productId}/image")
				.buildAndExpand(productId)
				.toUri();
		return ResponseEntity.created(location).body(product);
	}
}
