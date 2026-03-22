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

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * REST Controller for image operations
 * Provides endpoints for retrieving and replacing product images
 */
@RestController
@RequestMapping("/api/v1")
@Tag(name = "Images", description = "REST API for image operations (retrieving and uploading product images)")
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
	@Operation(summary = "Get product image metadata", description = "Retrieves image metadata for a specific product")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "Image metadata retrieved successfully"),
		@ApiResponse(responseCode = "404", description = "Product or image not found")
	})
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
	@Operation(summary = "Get image file", description = "Retrieves the actual image file bytes as a JPEG")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "Image file retrieved successfully"),
		@ApiResponse(responseCode = "404", description = "Image not found"),
		@ApiResponse(responseCode = "500", description = "Database error while retrieving the image")
	})
	public ResponseEntity<Resource> getImageFile(@PathVariable long imageId) throws SQLException {
		return ResponseEntity.ok().contentType(MediaType.IMAGE_JPEG).body(imageService.getImageFile(imageId));
	}

	@PostMapping(value = "/products/{productId}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	@Operation(summary = "Replace product image", description = "Uploads a new image for a specific product and replaces the existing one")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "201", description = "Image replaced successfully"),
		@ApiResponse(responseCode = "400", description = "Invalid input or image processing failed"),
		@ApiResponse(responseCode = "401", description = "Unauthorized user"),
		@ApiResponse(responseCode = "404", description = "Product not found")
	})
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