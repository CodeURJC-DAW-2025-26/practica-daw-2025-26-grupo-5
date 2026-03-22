package es.stilnovo.library.dto;

import java.util.List;

import org.mapstruct.Mapper;

import es.stilnovo.library.model.Inquiry;

/**
 * InquiryMapper: Converts between Inquiry entity and InquiryDTO (MapStruct).
 * 
 * Maps buyer-to-seller inquiry messages:
 * - Product details via ProductMapper
 * - Buyer information via UserMapper
 * - Full inquiry content (message, phone, type, status)
 */
@Mapper(componentModel = "spring", uses = {ProductMapper.class, UserMapper.class})
public interface InquiryMapper {

    /**
     * Convert Inquiry entity to InquiryDTO for API responses.
     * Includes nested product and buyer information.
     * @param inquiry the Inquiry entity
     * @return InquiryDTO with message content and user references
     */
    InquiryDTO toDTO(Inquiry inquiry);
    
    /**
     * Batch convert multiple Inquiry entities to DTOs.
     * @param inquiries list of Inquiry entities
     * @return list of InquiryDTO objects
     */
    List<InquiryDTO> toDTOs(List<Inquiry> inquiries);

    /**
     * Convert InquiryDTO to Inquiry entity for persistence.
     * @param inquiryDTO the DTO data
     * @return Inquiry entity ready to store
     */
    Inquiry toEntity(InquiryDTO inquiryDTO);
}