package es.stilnovo.library.controller.restControllers;

import java.security.Principal;
import java.util.List;
import java.net.URI;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import es.stilnovo.library.dto.PagedResponse;
import es.stilnovo.library.dto.ProductDTO;
import es.stilnovo.library.dto.ProductMapper;
import es.stilnovo.library.dto.ProductWriteRequestDTO;
import es.stilnovo.library.model.User;
import es.stilnovo.library.service.CatalogPageResult;
import es.stilnovo.library.service.MainService;
import es.stilnovo.library.service.ProductService;

@RestController
@RequestMapping("/api/v1/products")
public class ProductRestController {

    @Autowired
    private ProductService productService;

    @Autowired
    private ProductMapper productMapper;

    @Autowired
    private MainService mainService;

    @GetMapping
    public PagedResponse<ProductDTO> getProducts(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String category,
            @PageableDefault(size = 10) Pageable pageable,
            Principal principal) {
        User user = mainService.getUserContext(principal != null ? principal.getName() : null);
        CatalogPageResult page = productService.getCatalogPage(query, category, user, pageable);
        return new PagedResponse<>(
                productMapper.toDTOs(page.products()),
                page.page(),
                page.size(),
                page.totalElements(),
                page.last());
    }

    @GetMapping("/recommendations")
    public List<ProductDTO> getRecommendations(Principal principal) {
        User user = mainService.getUserContext(principal != null ? principal.getName() : null);
        return productMapper.toDTOs(productService.getRecommendations(user));
    }

    @GetMapping("/{id}/summary")
    public ProductDTO getProduct(@PathVariable long id) {
        return productService.findById(id)
                .map(productMapper::toDTO)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductDTO> createProduct(@ModelAttribute ProductWriteRequestDTO request, Principal principal) {
        try {
            var created = productService.createProduct(
                    principal.getName(),
                    request.getName(),
                    request.getCategory(),
                    request.getDescription(),
                    request.getPrice() != null ? request.getPrice() : 0.0,
                    request.getLocation(),
                    request.getStatus() != null && !request.getStatus().isBlank() ? request.getStatus() : "Active",
                    request.getFiles());

            URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                    .path("/{id}")
                    .buildAndExpand(created.getId())
                    .toUri();

            return ResponseEntity.created(location).body(productMapper.toDTO(created));
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, exception.getMessage(), exception);
        }
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ProductDTO updateProduct(@PathVariable long id,
                                    @ModelAttribute ProductWriteRequestDTO request,
                                    Principal principal) {
        try {
            var product = new es.stilnovo.library.model.Product();
            product.setName(request.getName());
            product.setCategory(request.getCategory());
            product.setDescription(request.getDescription());
            product.setPrice(request.getPrice() != null ? request.getPrice() : 0.0);
            product.setLocation(request.getLocation());
            product.setStatus(request.getStatus());

            productService.updateProductSafely(id, product, principal.getName(), request.getFiles());

            return productService.findById(id)
                    .map(productMapper::toDTO)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, exception.getMessage(), exception);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id, Principal principal) {
        productService.deleteProduct(id, principal.getName());
        return ResponseEntity.noContent().build();
    }
}
