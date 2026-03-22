package es.stilnovo.library.dto;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import es.stilnovo.library.model.Image;

/**
 * ImageMapper: Converts between Image entity and ImageDTO (MapStruct).
 * 
 * Minimal mapping - only exposes image ID for references.
 * Actual image file is handled via separate binary endpoints.
 */
@Mapper(componentModel = "spring")
public interface ImageMapper {

    /**
     * Convert Image entity to ImageDTO for API responses.
     * Only exposes image ID; binary file handled separately.
     * @param image the Image entity
     * @return ImageDTO with ID reference only
     */
    ImageDTO toDTO(Image image);

    /**
     * Convert ImageDTO to Image entity.
     * Ignores actual file and ID for security and storage consistency.
     * @param imageDTO the DTO data
     * @return Image entity (file handled by service layer)
     */
    @Mapping(target = "imageFile", ignore = true)
    @Mapping(target = "id", ignore = true)
    Image toEntity(ImageDTO imageDTO);
}