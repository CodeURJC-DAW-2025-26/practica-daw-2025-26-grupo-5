package es.stilnovo.library.dto;

import org.mapstruct.Mapper;
import java.util.List;

import es.stilnovo.library.model.Valoration;

// Añadimos los mappers de las entidades relacionadas para que MapStruct los use automáticamente
@Mapper(componentModel = "spring", uses = {UserMapper.class, TransactionMapper.class})
public interface ValorationMapper {

    ValorationDTO toDTO(Valoration valoration);
    
    List<ValorationDTO> toDTOs(List<Valoration> valorations);

    Valoration toEntity(ValorationDTO valorationDTO);
}