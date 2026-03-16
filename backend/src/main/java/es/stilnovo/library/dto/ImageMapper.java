package es.stilnovo.library.dto;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import es.stilnovo.library.model.Image;

@Mapper(componentModel = "spring")
public interface ImageMapper {

    ImageDTO toDTO(Image image);

    @Mapping(target = "imageFile", ignore = true)
    @Mapping(target = "product", ignore = true)
    Image toEntity(ImageDTO imageDTO);
}