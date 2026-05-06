package com.scholario.book.service;

import com.scholario.book.dto.BookInput;
import com.scholario.book.dto.BookVersionInput;
import com.scholario.book.model.*;
import com.scholario.book.repository.BookRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class BookService {

    private final BookRepository bookRepository;

    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    // Queries

    public Optional<Book> getBookById(Long id) {
        return bookRepository.findById(id);
    }

    public List<Book> searchBooks(String title, String isbn) {
        if (title != null && isbn != null) {
            return bookRepository.findAll().stream()
                    .filter(b -> b.getTitle().toLowerCase().contains(title.toLowerCase())
                            && b.getIsbn().contains(isbn))
                    .collect(Collectors.toList());
        } else if (title != null) {
            return bookRepository.findAll().stream()
                    .filter(b -> b.getTitle().toLowerCase().contains(title.toLowerCase()))
                    .collect(Collectors.toList());
        } else if (isbn != null) {
            return bookRepository.findByIsbn(isbn)
                    .map(List::of)
                    .orElse(List.of());
        }
        return bookRepository.findAll();
    }

    public List<Book> getBooksByFaculty(Long facultyId) {
        return bookRepository.findByFacultyId(facultyId);
    }

    public List<Book> getBookVersions(Long bookId) {
        Optional<Book> bookOpt = bookRepository.findById(bookId);
        if (bookOpt.isEmpty()) {
            return List.of();
        }
        Book book = bookOpt.get();
        if (book.getParentBookId() != null) {
            return bookRepository.findVersionsByParentBookId(book.getParentBookId());
        }
        return bookRepository.findVersionsByParentBookId(bookId);
    }

    // Mutations

    public Book createBook(BookInput input) {
        if (bookRepository.findByIsbn(input.isbn()).isPresent()) {
            throw new IllegalArgumentException("Book with ISBN " + input.isbn() + " already exists");
        }

        Book book = new Book();
        book.setTitle(input.title());
        book.setIsbn(input.isbn());
        book.setFacultyId(input.facultyId());
        book.setDescription(input.description());
        book.setState(new Draft());
        book.setVersionNumber(1);

        return bookRepository.save(book);
    }

    public Book updateBook(Long id, BookInput input) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Book not found with id: " + id));

        if (!(book.getState() instanceof Draft)) {
            throw new IllegalStateException("Cannot update book in " + book.getState().name() + " state");
        }

        if (input.title() != null) {
            book.setTitle(input.title());
        }
        if (input.description() != null) {
            book.setDescription(input.description());
        }

        return bookRepository.save(book);
    }

    public Book deleteBook(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Book not found with id: " + id));

        if (book.getState() instanceof Published) {
            throw new IllegalStateException("Cannot delete published book");
        }

        bookRepository.delete(book);
        return book;
    }

    public Book submitForReview(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Book not found with id: " + id));

        BookState currentState = book.getState();
        BookState newState = new Review();

        if (currentState.canTransitionTo(newState)) {
            book.setState(newState);
        } else {
            throw new IllegalStateException("Cannot transition from " + currentState.name() + " to REVIEW");
        }

        return bookRepository.save(book);
    }

    public Book updateBookState(Long id, BookState newState) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Book not found with id: " + id));

        BookState currentState = book.getState();
        if (currentState.canTransitionTo(newState)) {
            book.setState(newState);
        } else {
            throw new IllegalStateException("Cannot transition from " + currentState.name() + " to " + newState.name());
        }

        return bookRepository.save(book);
    }

    public Book publishBook(Long id) {
        return updateBookState(id, new Published());
    }

    public Book archiveBook(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Book not found with id: " + id));

        book.setState(new Archived());
        return bookRepository.save(book);
    }

    public Book versionBook(BookVersionInput input) {
        Book parentBook = bookRepository.findById(input.parentBookId())
                .orElseThrow(() -> new IllegalArgumentException("Parent book not found with id: " + input.parentBookId()));

        if (!(parentBook.getState() instanceof Published)) {
            throw new IllegalStateException("Can only version published books");
        }

        // Check if new ISBN is unique
        if (bookRepository.findByIsbn(input.isbn()).isPresent()) {
            throw new IllegalArgumentException("Book with ISBN " + input.isbn() + " already exists");
        }

        Book newVersion = new Book();
        newVersion.setTitle(input.title() != null ? input.title() : parentBook.getTitle());
        newVersion.setIsbn(input.isbn());
        newVersion.setFacultyId(parentBook.getFacultyId());
        newVersion.setDescription(input.description() != null ? input.description() : parentBook.getDescription());
        newVersion.setVersionNumber(parentBook.getVersionNumber() + 1);
        newVersion.setParentBookId(parentBook.getParentBookId() != null ? parentBook.getParentBookId() : parentBook.getId());
        newVersion.setState(new Draft());

        return bookRepository.save(newVersion);
    }
}
