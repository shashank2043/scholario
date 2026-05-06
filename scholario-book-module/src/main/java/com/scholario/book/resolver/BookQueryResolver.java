package com.scholario.book.resolver;

import com.scholario.book.model.Book;
import com.scholario.book.service.BookService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Optional;

@Controller
@PreAuthorize("isAuthenticated()")
public class BookQueryResolver {

    private final BookService bookService;

    public BookQueryResolver(BookService bookService) {
        this.bookService = bookService;
    }

    @QueryMapping
    public Optional<Book> getBookById(@Argument Long id) {
        return bookService.getBookById(id);
    }

    @QueryMapping
    public List<Book> searchBooks(@Argument String title, @Argument String isbn) {
        return bookService.searchBooks(title, isbn);
    }

    @QueryMapping
    public List<Book> getBooksByFaculty(@Argument Long facultyId) {
        return bookService.getBooksByFaculty(facultyId);
    }

    @QueryMapping
    public List<Book> getBookVersions(@Argument Long bookId) {
        return bookService.getBookVersions(bookId);
    }
}
