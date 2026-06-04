package com.sahilkumar.Library.Management.System.service.impl;

import com.sahilkumar.Library.Management.System.dto.request.IssueBookRequest;
import com.sahilkumar.Library.Management.System.dto.response.TransactionResponse;
import com.sahilkumar.Library.Management.System.entity.AppUser;
import com.sahilkumar.Library.Management.System.entity.Book;
import com.sahilkumar.Library.Management.System.entity.Transaction;
import com.sahilkumar.Library.Management.System.entity.TransactionStatus;
import com.sahilkumar.Library.Management.System.exception.BookNotAvailableException;
import com.sahilkumar.Library.Management.System.exception.InvalidTransactionException;
import com.sahilkumar.Library.Management.System.exception.ResourceNotFoundException;
import com.sahilkumar.Library.Management.System.mapper.TransactionMapper;
import com.sahilkumar.Library.Management.System.repository.BookRepository;
import com.sahilkumar.Library.Management.System.repository.TransactionRepository;
import com.sahilkumar.Library.Management.System.service.BookService;
import com.sahilkumar.Library.Management.System.service.TransactionService;
import com.sahilkumar.Library.Management.System.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
@Transactional
public class TransactionServiceImpl implements TransactionService {

    @Value("${app.library.loan-period-days:14}")
    private int loanPeriodDays;

    @Value("${app.library.fine-per-day:5}")
    private BigDecimal finePerDay;

    private final TransactionRepository transactionRepository;
    private final BookRepository bookRepository;
    private final BookService bookService;
    private final UserService userService;
    private final TransactionMapper transactionMapper;

    @Override
    public TransactionResponse issue(IssueBookRequest req) {
        Book book = bookService.findEntity(req.getBookId());
        if (!book.isAvailable()) {
            throw new BookNotAvailableException("Book is not available: " + book.getTitle());
        }
        AppUser user = userService.findEntityById(req.getUserId());

        LocalDate today = LocalDate.now();
        LocalDate dueDate = req.getDueDate() != null
                ? req.getDueDate()
                : today.plusDays(loanPeriodDays);
        Transaction txn = Transaction.builder()
                .book(book)
                .user(user)
                .issueDate(today)
                .dueDate(dueDate)
                .fine(BigDecimal.ZERO)
                .status(TransactionStatus.ISSUED)
                .build();

        book.setAvailable(false);
        bookRepository.save(book);

        return transactionMapper.toResponse(transactionRepository.save(txn));
    }

    @Override
    public TransactionResponse borrow(Long bookId, String userEmail) {
        AppUser user = userService.findEntityByEmail(userEmail);
        return issue(IssueBookRequest.builder()
                .bookId(bookId)
                .userId(user.getId())
                .build());
    }

    @Override
    public TransactionResponse returnBook(Long transactionId) {
        Transaction txn = transactionRepository.findById(transactionId)
                .orElseThrow(() -> ResourceNotFoundException.of("Transaction", transactionId));
        if (txn.getStatus() == TransactionStatus.RETURNED) {
            throw new InvalidTransactionException("Transaction already returned");
        }

        LocalDate today = LocalDate.now();
        long daysLate = ChronoUnit.DAYS.between(txn.getDueDate(), today);
        BigDecimal fine = daysLate > 0
                ? finePerDay.multiply(BigDecimal.valueOf(daysLate))
                : BigDecimal.ZERO;

        txn.setReturnDate(today);
        txn.setFine(fine);
        txn.setStatus(TransactionStatus.RETURNED);

        Book book = txn.getBook();
        book.setAvailable(true);
        bookRepository.save(book);

        return transactionMapper.toResponse(transactionRepository.save(txn));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TransactionResponse> listAll(Pageable pageable) {
        return transactionRepository.findAll(pageable).map(transactionMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TransactionResponse> listByUser(Long userId, Pageable pageable) {
        return transactionRepository.findByUserId(userId, pageable).map(transactionMapper::toResponse);
    }
}
