package es.stilnovo.library.dto;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import java.util.List;

import es.stilnovo.library.model.Valoration;

@Mapper(componentModel = "spring")
public interface ValorationMapper {

    @Mapping(source = "buyer.name", target = "buyerName")
    @Mapping(source = "transaction.transactionId", target = "transactionId")
    ValorationDTO toDTO(Valoration valoration);
    
    List<ValorationDTO> toDTOs(List<Valoration> valorations);

    @Mapping(target = "transaction", ignore = true)
    @Mapping(target = "seller", ignore = true)
    @Mapping(target = "buyer", ignore = true)
    Valoration toEntity(ValorationDTO valorationDTO);
}