package com.sahilkumar.Library.Management.System.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
}
