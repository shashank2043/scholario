package com.scholario.user.resolver;

import com.scholario.user.dto.DepartmentInput;
import com.scholario.user.dto.ProfileInput;
import com.scholario.user.dto.UserInput;
import com.scholario.user.model.Department;
import com.scholario.user.model.Role;
import com.scholario.user.model.User;
import com.scholario.user.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserMutationResolverTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private UserMutationResolver userMutationResolver;

    @Test
    void registerUser_Success() {
        UserInput input = new UserInput("user", "email", "name", "pass", Role.STUDENT);
        User user = new User();
        when(userService.registerUser(input)).thenReturn(user);

        User result = userMutationResolver.registerUser(input);

        assertEquals(user, result);
        verify(userService).registerUser(input);
    }

    @Test
    void assignRole_Success() {
        User user = new User();
        when(userService.assignRole(1L, Role.ADMIN)).thenReturn(user);

        User result = userMutationResolver.assignRole(1L, Role.ADMIN);

        assertEquals(user, result);
        verify(userService).assignRole(1L, Role.ADMIN);
    }

    @Test
    void createDepartment_Success() {
        DepartmentInput input = new DepartmentInput("Computer Science", "CS");
        Department department = new Department();
        department.setId(1L);
        department.setName("Computer Science");
        department.setCode("CS");

        when(userService.createDepartment(input)).thenReturn(department);

        Department result = userMutationResolver.createDepartment(input);

        assertEquals(department, result);
        verify(userService).createDepartment(input);
    }
}
