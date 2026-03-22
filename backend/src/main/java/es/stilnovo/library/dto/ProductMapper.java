package es.stilnovo.library.dto;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import es.stilnovo.library.model.Product;

import java.util.List;

/**
 * ProductMapper: Converts between Product entity and ProductDTO (MapStruct).
 * 
 * Handles complex mappings:
 * - Product.interactions → ProductDTO.userInteractions (list conversion)
 * - Dependency injection of related mappers (UserMapper, ImageMapper, UserInteractionMapper)
 * - Excludes internal fields and relationships on reverse mapping
 */
@Mapper(componentModel = "spring", uses = {UserMapper.class, ImageMapper.class, UserInteractionMapper.class})
public interface ProductMapper {

	/**
	 * Convert Product entity to ProductDTO for API responses.
	 * Maps interactions list to userInteractions field.
	 * @param product the product entity
	 * @return ProductDTO with all public fields populated
	 */
    @Mapping(source = "interactions", target = "userInteractions")
    ProductDTO toDTO(Product product);
    
    /**
     * Convert list of Product entities to list of ProductDTOs.
     * @param products list of product entities
     * @return list of ProductDTOs
     */
    List<ProductDTO> toDTOs(List<Product> products);

    /**
     * Convert ProductDTO back to Product entity (for updates).
     * Ignores relationships and internal fields to prevent data exposure.
     * @param productDTO the DTO from API request
     * @return Product entity ready for persistence
     */
    @Mapping(target = "interactions", ignore = true)
    @Mapping(target = "image", ignore = true)
    Product toEntity(ProductDTO productDTO);
}