package com.sahilkumar.Library.Management.System.service;

import com.sahilkumar.Library.Management.System.dto.request.IssueBookRequest;
import com.sahilkumar.Library.Management.System.dto.response.TransactionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface TransactionService {
    TransactionResponse issue(IssueBookRequest req);
    TransactionResponse borrow(Long bookId, String userEmail);
    TransactionResponse returnBook(Long transactionId);
    Page<TransactionResponse> listAll(Pageable pageable);
    Page<TransactionResponse> listByUser(Long userId, Pageable pageable);
}
