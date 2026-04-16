package com.sahilkumar.Library.Management.System.mapper;

import com.sahilkumar.Library.Management.System.dto.response.TransactionResponse;
import com.sahilkumar.Library.Management.System.entity.Transaction;
import org.springframework.stereotype.Component;

@Component
public class TransactionMapper {

    public TransactionResponse toResponse(Transaction t) {
        return TransactionResponse.builder()
                .id(t.getId())
                .bookId(t.getBook().getId())
                .bookTitle(t.getBook().getTitle())
                .userId(t.getUser().getId())
                .userName(t.getUser().getName())
                .issueDate(t.getIssueDate())
                .dueDate(t.getDueDate())
                .returnDate(t.getReturnDate())
                .fine(t.getFine())
                .status(t.getStatus())
                .build();
    }
}
