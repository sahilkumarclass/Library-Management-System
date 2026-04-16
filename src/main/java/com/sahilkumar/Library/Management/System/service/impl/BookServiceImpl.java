package com.sahilkumar.Library.Management.System.service.impl;

import com.sahilkumar.Library.Management.System.dto.request.BookRequest;
import com.sahilkumar.Library.Management.System.dto.response.BookResponse;
import com.sahilkumar.Library.Management.System.entity.Book;
import com.sahilkumar.Library.Management.System.exception.DuplicateResourceException;
import com.sahilkumar.Library.Management.System.exception.ResourceNotFoundException;
import com.sahilkumar.Library.Management.System.mapper.BookMapper;
import com.sahilkumar.Library.Management.System.repository.BookRepository;
import com.sahilkumar.Library.Management.System.service.BookService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Transactional
public class BookServiceImpl implements BookService {

    private final BookRepository bookRepository;
    private final BookMapper bookMapper;

    @Override
    public BookResponse create(BookRequest req) {
        if (StringUtils.hasText(req.getIsbn()) && bookRepository.existsByIsbn(req.getIsbn())) {
            throw new DuplicateResourceException("Book with ISBN already exists: " + req.getIsbn());
        }
        Book saved = bookRepository.save(bookMapper.toEntity(req));
        return bookMapper.toResponse(saved);
    }

    @Override
    public BookResponse update(Long id, BookRequest req) {
        Book book = findEntity(id);
        if (StringUtils.hasText(req.getIsbn())
                && !req.getIsbn().equals(book.getIsbn())
                && bookRepository.existsByIsbn(req.getIsbn())) {
            throw new DuplicateResourceException("Book with ISBN already exists: " + req.getIsbn());
        }
        bookMapper.updateEntity(book, req);
        return bookMapper.toResponse(bookRepository.save(book));
    }

    @Override
    public void delete(Long id) {
        if (!bookRepository.existsById(id)) {
            throw ResourceNotFoundException.of("Book", id);
        }
        bookRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public BookResponse get(Long id) {
        return bookMapper.toResponse(findEntity(id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BookResponse> list(Pageable pageable) {
        return bookRepository.findAll(pageable).map(bookMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BookResponse> search(String q, String by, Pageable pageable) {
        if (!StringUtils.hasText(q)) {
            return list(pageable);
        }
        Page<Book> page = "author".equalsIgnoreCase(by)
                ? bookRepository.findByAuthorContainingIgnoreCase(q, pageable)
                : bookRepository.findByTitleContainingIgnoreCase(q, pageable);
        return page.map(bookMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Book findEntity(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Book", id));
    }
}
