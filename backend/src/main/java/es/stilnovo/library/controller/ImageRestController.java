package es.stilnovo.library.controller;

import java.io.IOException;
import java.security.Principal;
import java.sql.SQLException;
import java.util.List;
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

@RestController
@RequestMapping("/api/v1/images")
public class ImageRestController {

	@Autowired
	private ImageService imageService;

	@Autowired
	private ProductService productService;

	@Autowired
	private ImageMapper imageMapper;

	@Autowired
	private ProductMapper productMapper;

	@GetMapping("/products/{productId}")
	public List<ImageDTO> getProductImages(@PathVariable long productId) {
		return imageService.getProductImages(productId).stream().map(imageMapper::toDTO).toList();
	}

	@GetMapping(value = "/{imageId}/file", produces = MediaType.IMAGE_JPEG_VALUE)
	public ResponseEntity<Resource> getImageFile(@PathVariable long imageId) throws SQLException {
		return ResponseEntity.ok().contentType(MediaType.IMAGE_JPEG).body(imageService.getImageFile(imageId));
	}

	@PostMapping("/products/{productId}")
	public ResponseEntity<ProductDTO> addProductImages(@PathVariable long productId,
									   @RequestParam("files") List<MultipartFile> files,
									   Principal principal) throws IOException {
		var product = productMapper.toDTO(productService.addImages(productId, principal.getName(), files));
		URI location = ServletUriComponentsBuilder.fromCurrentContextPath()
				.path("/api/v1/images/products/{productId}")
				.buildAndExpand(productId)
				.toUri();
		return ResponseEntity.created(location).body(product);
	}
}
