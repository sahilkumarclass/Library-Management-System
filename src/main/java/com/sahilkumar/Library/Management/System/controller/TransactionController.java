package com.sahilkumar.Library.Management.System.controller;

import com.sahilkumar.Library.Management.System.dto.request.IssueBookRequest;
import com.sahilkumar.Library.Management.System.dto.response.PageResponse;
import com.sahilkumar.Library.Management.System.dto.response.TransactionResponse;
import com.sahilkumar.Library.Management.System.service.TransactionService;
import com.sahilkumar.Library.Management.System.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;
    private final UserService userService;

    @PostMapping("/issue")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TransactionResponse> issue(@Valid @RequestBody IssueBookRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.issue(req));
    }

    @PostMapping("/{id}/return")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TransactionResponse> returnBook(@PathVariable Long id) {
        return ResponseEntity.ok(transactionService.returnBook(id));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PageResponse<TransactionResponse>> listAll(
            @PageableDefault(size = 10, sort = "id") Pageable pageable) {
        return ResponseEntity.ok(PageResponse.of(transactionService.listAll(pageable), t -> t));
    }

    @GetMapping("/me")
    public ResponseEntity<PageResponse<TransactionResponse>> myTransactions(
            Authentication auth,
            @PageableDefault(size = 10, sort = "id") Pageable pageable) {
        Long userId = userService.findEntityByEmail(auth.getName()).getId();
        return ResponseEntity.ok(PageResponse.of(transactionService.listByUser(userId, pageable), t -> t));
    }
}
