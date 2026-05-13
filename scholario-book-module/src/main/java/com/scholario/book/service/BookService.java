package com.scholario.book.service;

import com.scholario.book.dto.BookInput;
import com.scholario.book.dto.BookVersionInput;
import com.scholario.book.model.*;
import com.scholario.book.repository.BookRepository;
import com.scholario.user.model.Role;
import com.scholario.user.model.User;
import com.scholario.user.repository.UserRepository;
import com.scholario.notification.model.NotificationType;
import com.scholario.notification.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class BookService {

    private static final String BOOK_NOT_FOUND = "Book not found with id: ";
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public BookService(BookRepository bookRepository, UserRepository userRepository, NotificationService notificationService) {
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    // Queries

    public Optional<Book> getBookById(Long id) {
        return bookRepository.findById(id);
    }

    public List<Book> searchBooks(String title, String isbn) {
        if (title != null && isbn != null) {
            return bookRepository.findByTitleContainingIgnoreCaseAndIsbnContaining(title, isbn);
        } else if (title != null) {
            return bookRepository.findByTitleContainingIgnoreCase(title);
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
        return bookRepository.findById(bookId)
                .map(book -> bookRepository.findVersionsByParentBookId(
                        book.getParentBookId() != null ? book.getParentBookId() : bookId))
                .orElseGet(List::of);
    }

    // Mutations

    public Book createBook(BookInput input) {
        // Faculty ownership validation
        User faculty = userRepository.findById(input.facultyId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + input.facultyId()));

        if (faculty.getRole() != Role.FACULTY) {
            throw new IllegalArgumentException("User with id " + input.facultyId() + " is not a Faculty member");
        }

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
                .orElseThrow(() -> new IllegalArgumentException(BOOK_NOT_FOUND + id));

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
                .orElseThrow(() -> new IllegalArgumentException(BOOK_NOT_FOUND + id));

        if (book.getState() instanceof Published) {
            throw new IllegalStateException("Cannot delete published book");
        }

        bookRepository.delete(book);
        return book;
    }

    public Book submitForReview(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(BOOK_NOT_FOUND + id));

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
                .orElseThrow(() -> new IllegalArgumentException(BOOK_NOT_FOUND + id));

        BookState currentState = book.getState();
        if (currentState.canTransitionTo(newState)) {
            book.setState(newState);
        } else {
            throw new IllegalStateException("Cannot transition from " + currentState.name() + " to " + newState.name());
        }

        return bookRepository.save(book);
    }

    public Book publishBook(Long id) {
        Book book = updateBookState(id, new Published());
        notificationService.createNotification(
                NotificationType.BOOK_PUBLISHED,
                "Book '" + book.getTitle() + "' published successfully",
                book.getFacultyId(),
                book.getId()
        );
        return book;
    }

    public Book archiveBook(Long id) {
        return updateBookState(id, new Archived());
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
