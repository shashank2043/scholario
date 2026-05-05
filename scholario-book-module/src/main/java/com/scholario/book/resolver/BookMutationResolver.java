package com.scholario.book.resolver;

import com.scholario.book.dto.BookInput;
import com.scholario.book.dto.BookVersionInput;
import com.scholario.book.model.Book;
import com.scholario.book.service.BookService;
import graphql.schema.DataFetchingEnvironment;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;

@Controller
public class BookMutationResolver {

    private final BookService bookService;

    public BookMutationResolver(BookService bookService) {
        this.bookService = bookService;
    }

    @MutationMapping
    public Book createBook(@Argument BookInput input) {
        return bookService.createBook(input);
    }

    @MutationMapping
    public Book updateBook(@Argument Long id,@Argument BookInput input) {
        return bookService.updateBook(id, input);
    }

    @MutationMapping
    public Book deleteBook(@Argument Long id) {
        return bookService.deleteBook(id);
    }

    @MutationMapping
    public Book publishBook(@Argument Long id) {
        return bookService.publishBook(id);
    }

    @MutationMapping
    public Book archiveBook(@Argument Long id) {
        return bookService.archiveBook(id);
    }

    @MutationMapping
    public Book versionBook(@Argument BookVersionInput input) {
        return bookService.versionBook(input);
    }
}
