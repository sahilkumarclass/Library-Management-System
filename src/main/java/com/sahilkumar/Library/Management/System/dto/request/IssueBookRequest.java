package com.sahilkumar.Library.Management.System.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueBookRequest {

    @NotNull(message = "bookId is required")
    private Long bookId;

    @NotNull(message = "userId is required")
    private Long userId;

    // Optional. When provided, overrides the default (issueDate + loan period).
    // Useful for testing overdue fines by issuing with a past due date.
    private LocalDate dueDate;
}
