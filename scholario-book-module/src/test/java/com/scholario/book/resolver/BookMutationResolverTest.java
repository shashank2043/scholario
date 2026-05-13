package com.scholario.book.resolver;

import com.scholario.book.dto.BookInput;
import com.scholario.book.model.Book;
import com.scholario.book.service.BookService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookMutationResolverTest {

    @Mock
    private BookService bookService;

    @InjectMocks
    private BookMutationResolver bookMutationResolver;

    @Test
    void createBook_Success() {
        BookInput input = new BookInput("Title", "ISBN", "Desc");
        Book book = new Book();
        when(bookService.createBook(input)).thenReturn(book);

        Book result = bookMutationResolver.createBook(input);

        assertEquals(book, result);
        verify(bookService).createBook(input);
    }

    @Test
    void publishBook_Success() {
        Book book = new Book();
        when(bookService.publishBook(1L)).thenReturn(book);

        Book result = bookMutationResolver.publishBook(1L);

        assertEquals(book, result);
        verify(bookService).publishBook(1L);
    }
}
