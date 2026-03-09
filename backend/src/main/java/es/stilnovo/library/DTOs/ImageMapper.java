package es.stilnovo.library.DTOs;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import es.stilnovo.library.model.Image;

@Mapper(componentModel = "spring")
public interface ImageMapper {

    ImageDTO toDTO(Image image);
}