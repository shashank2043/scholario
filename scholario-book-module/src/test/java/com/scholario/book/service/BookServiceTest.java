package com.scholario.book.service;

import com.scholario.book.dto.BookInput;
import com.scholario.book.model.*;
import com.scholario.book.repository.BookRepository;
import com.scholario.notification.service.NotificationService;
import com.scholario.user.model.Role;
import com.scholario.user.model.User;
import com.scholario.user.repository.UserRepository;
import com.scholario.user.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookServiceTest {

    @Mock
    private BookRepository bookRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private UserService userService;

    @InjectMocks
    private BookService bookService;

    private User faculty;
    private Book book;

    @BeforeEach
    void setUp() {
        faculty = new User();
        faculty.setId(1L);
        faculty.setRoles(java.util.Set.of(Role.FACULTY));

        book = new Book();
        book.setId(1L);
        book.setTitle("Test Book");
        book.setIsbn("1234567890");
        book.setFacultyId(1L);
        book.setState(new Draft());
    }

    @Test
    void createBook_Success() {
        BookInput input = new BookInput("Test Book", "1234567890", "Description");
        when(userService.getCurrentUser()).thenReturn(faculty);
        when(bookRepository.findByIsbn("1234567890")).thenReturn(Optional.empty());
        when(bookRepository.save(any(Book.class))).thenReturn(book);

        Book createdBook = bookService.createBook(input);

        assertNotNull(createdBook);
        assertEquals("Test Book", createdBook.getTitle());
    }

    @Test
    void createBook_Failure_NotFaculty() {
        faculty.setRoles(java.util.Set.of(Role.STUDENT));
        BookInput input = new BookInput("Test Book", "1234567890", "Description");
        when(userService.getCurrentUser()).thenReturn(faculty);

        assertThrows(IllegalArgumentException.class, () -> bookService.createBook(input));
    }

    @Test
    void publishBook_Success() {
        book.setState(new Review());
        when(bookRepository.findById(1L)).thenReturn(Optional.of(book));
        when(bookRepository.save(any(Book.class))).thenAnswer(i -> i.getArguments()[0]);

        Book publishedBook = bookService.publishBook(1L);

        assertTrue(publishedBook.getState() instanceof Published);
        verify(notificationService).createNotification(any(), any(), any(), any());
    }

    @Test
    void updateBook_Failure_WhenPublished() {
        book.setState(new Published());
        BookInput input = new BookInput("New Title", "1234567890", "New Description");
        when(bookRepository.findById(1L)).thenReturn(Optional.of(book));

        assertThrows(IllegalStateException.class, () -> bookService.updateBook(1L, input));
    }
}
