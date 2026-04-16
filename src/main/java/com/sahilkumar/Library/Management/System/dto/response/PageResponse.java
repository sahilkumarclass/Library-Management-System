package com.sahilkumar.Library.Management.System.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.function.Function;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PageResponse<T> {
    private List<T> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean last;

    public static <E, T> PageResponse<T> of(Page<E> src, Function<E, T> mapper) {
        return PageResponse.<T>builder()
                .content(src.map(mapper).getContent())
                .page(src.getNumber())
                .size(src.getSize())
                .totalElements(src.getTotalElements())
                .totalPages(src.getTotalPages())
                .last(src.isLast())
                .build();
    }
}
