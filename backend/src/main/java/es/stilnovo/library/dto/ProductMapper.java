package es.stilnovo.library.dto;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import es.stilnovo.library.model.Product;
import es.stilnovo.library.model.User;
import es.stilnovo.library.model.UserInteraction;

import java.util.List;

@Mapper(componentModel = "spring", uses = {UserMapper.class, ImageMapper.class, UserInteractionMapper.class})
public interface ProductMapper {

    @Mapping(source = "interactions", target = "userInteractions")
    ProductDTO toDTO(Product product);
    List<ProductDTO> toDTOs(List<Product> products);

    @Mapping(target = "interactions", ignore = true)
    Product toEntity(ProductDTO productDTO);
}