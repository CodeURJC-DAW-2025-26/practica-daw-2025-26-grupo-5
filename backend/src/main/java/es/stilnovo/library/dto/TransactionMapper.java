package es.stilnovo.library.dto;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import es.stilnovo.library.model.Transaction;

/**
 * TransactionMapper: Converts between Transaction entity and TransactionDTO (MapStruct).
 * 
 * Maps complex nested relationships:
 * - Buyer/Seller user information via UserMapper
 * - Related product details via ProductMapper
 * - Transaction metadata (dates, amounts, status)
 */
@Mapper(componentModel = "spring", uses = {UserMapper.class, ProductMapper.class})
public interface TransactionMapper {

    /**
     * Convert Transaction entity to TransactionDTO for API responses.
     * Includes nested buyer/seller data and product information.
     * @param transaction the Transaction entity
     * @return TransactionDTO with full relationship details
     */
    TransactionDTO toDTO(Transaction transaction);

    /**
     * Batch convert multiple Transaction entities to DTOs.
     * @param transactions list of Transaction entities
     * @return list of TransactionDTO objects
     */
    List<TransactionDTO> toDTOs(List<Transaction> transactions);

    /**
     * Convert TransactionDTO back to Transaction entity.
     * @param transactionDTO the DTO data
     * @return Transaction entity ready for persistence
     */
    @Mapping(source = "transactionId", target = "transactionId")
    Transaction toEntity(TransactionDTO transactionDTO);
}