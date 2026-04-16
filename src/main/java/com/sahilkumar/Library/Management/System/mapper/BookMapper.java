package com.sahilkumar.Library.Management.System.mapper;

import com.sahilkumar.Library.Management.System.dto.request.BookRequest;
import com.sahilkumar.Library.Management.System.dto.response.BookResponse;
import com.sahilkumar.Library.Management.System.entity.Book;
import org.springframework.stereotype.Component;

@Component
public class BookMapper {

    public Book toEntity(BookRequest req) {
        return Book.builder()
                .title(req.getTitle())
                .author(req.getAuthor())
                .isbn(req.getIsbn())
                .available(true)
                .build();
    }

    public void updateEntity(Book book, BookRequest req) {
        book.setTitle(req.getTitle());
        book.setAuthor(req.getAuthor());
        book.setIsbn(req.getIsbn());
    }

    public BookResponse toResponse(Book book) {
        return BookResponse.builder()
                .id(book.getId())
                .title(book.getTitle())
                .author(book.getAuthor())
                .isbn(book.getIsbn())
                .available(book.isAvailable())
                .createdAt(book.getCreatedAt())
                .build();
    }
}
