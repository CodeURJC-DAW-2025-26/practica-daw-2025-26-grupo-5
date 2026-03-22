package es.stilnovo.library.dto;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import java.util.List;

import es.stilnovo.library.model.Valoration;

/**
 * ValorationMapper: Converts between Valoration (review/rating) entity and ValorationDTO (MapStruct).
 * 
 * Handles nested field mapping:
 * - buyer.name → buyerName (flattened for API simplicity)
 * - transaction.transactionId → transactionId (reference only)
 * - Ignores seller/buyer/transaction objects on reverse mapping (security)
 */
@Mapper(componentModel = "spring")
public interface ValorationMapper {

    /**
     * Convert Valoration (review/rating) entity to ValorationDTO.
     * Flattens nested buyer name and transaction ID for API simplicity.
     * @param valoration the source Valoration entity
     * @return ValorationDTO with flattened buyer/transaction references
     */
    @Mapping(source = "buyer.name", target = "buyerName")
    @Mapping(source = "transaction.transactionId", target = "transactionId")
    ValorationDTO toDTO(Valoration valoration);
    
    /**
     * Batch convert multiple Valoration entities to DTOs.
     * @param valorations list of Valoration entities
     * @return list of ValorationDTO objects
     */
    List<ValorationDTO> toDTOs(List<Valoration> valorations);

    /**
     * Convert ValorationDTO back to entity.
     * Ignores relationship objects to avoid unauthorized modifications.
     * @param valorationDTO the DTO data
     * @return Valoration entity (relationships set by service layer)
     */
    @Mapping(target = "transaction", ignore = true)
    @Mapping(target = "seller", ignore = true)
    @Mapping(target = "buyer", ignore = true)
    Valoration toEntity(ValorationDTO valorationDTO);
}