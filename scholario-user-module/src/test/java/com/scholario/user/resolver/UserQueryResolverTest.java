package com.scholario.user.resolver;

import com.scholario.user.model.User;
import com.scholario.user.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserQueryResolverTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private UserQueryResolver userQueryResolver;

    @Test
    void getUserById_Success() {
        User user = new User();
        user.setId(1L);
        when(userService.getUserById(1L)).thenReturn(user);

        User result = userQueryResolver.getUserById(1L);

        assertEquals(user, result);
        verify(userService).getUserById(1L);
    }

    @Test
    void getFacultyList_Success() {
        List<User> faculty = List.of(new User());
        when(userService.getFacultyList()).thenReturn(faculty);

        List<User> result = userQueryResolver.getFacultyList();

        assertEquals(faculty, result);
        verify(userService).getFacultyList();
    }
}
