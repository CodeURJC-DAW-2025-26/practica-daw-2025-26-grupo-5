package es.stilnovo.library.DTOs;

import java.util.List;

import org.mapstruct.Mapper;

import es.stilnovo.library.model.Inquiry;

@Mapper(componentModel = "spring", uses = {ProductMapper.class, UserMapper.class})
public interface InquiryMapper {

    InquiryDTO toDTO(Inquiry inquiry);
    
    List<InquiryDTO> toDTOs(List<Inquiry> inquiries);

    Inquiry toEntity(InquiryDTO inquiryDTO);
}