package com.scholario.book.resolver;

import com.scholario.book.model.Book;
import com.scholario.book.service.BookService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookQueryResolverTest {

    @Mock
    private BookService bookService;

    @InjectMocks
    private BookQueryResolver bookQueryResolver;

    @Test
    void getBookById_Success() {
        Book book = new Book();
        book.setId(1L);
        when(bookService.getBookById(1L)).thenReturn(Optional.of(book));

        Optional<Book> result = bookQueryResolver.getBookById(1L);

        assertTrue(result.isPresent());
        assertEquals(book, result.get());
        verify(bookService).getBookById(1L);
    }

    @Test
    void searchBooks_Success() {
        List<Book> books = List.of(new Book());
        when(bookService.searchBooks("title", null)).thenReturn(books);

        List<Book> result = bookQueryResolver.searchBooks("title", null);

        assertEquals(books, result);
        verify(bookService).searchBooks("title", null);
    }
}
