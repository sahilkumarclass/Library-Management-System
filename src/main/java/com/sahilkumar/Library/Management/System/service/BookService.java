package com.sahilkumar.Library.Management.System.service;

import com.sahilkumar.Library.Management.System.dto.request.BookRequest;
import com.sahilkumar.Library.Management.System.dto.response.BookResponse;
import com.sahilkumar.Library.Management.System.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BookService {
    BookResponse create(BookRequest req);
    BookResponse update(Long id, BookRequest req);
    void delete(Long id);
    BookResponse get(Long id);
    Page<BookResponse> list(Pageable pageable);
    Page<BookResponse> search(String q, String by, Pageable pageable);
    Book findEntity(Long id);
}
