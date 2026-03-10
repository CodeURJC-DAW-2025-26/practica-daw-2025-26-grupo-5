package es.stilnovo.library.dto;

import java.util.List;

import org.mapstruct.Mapper;

import es.stilnovo.library.model.Transaction;

@Mapper(componentModel = "spring", uses = {UserMapper.class, ProductMapper.class})
public interface TransactionMapper {

    TransactionDTO toDTO(Transaction transaction);

    List<TransactionDTO> toDTOs(List<Transaction> transactions);

    Transaction toEntity(TransactionDTO transactionDTO);
}