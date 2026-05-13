package com.scholario.user.service;

import com.scholario.user.dto.DepartmentInput;
import com.scholario.user.dto.ProfileInput;
import com.scholario.user.dto.UserInput;
import com.scholario.user.model.Department;
import com.scholario.user.model.Role;
import com.scholario.user.model.User;
import com.scholario.user.repository.DepartmentRepository;
import com.scholario.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setUsername("testuser");
        user.setEmail("test@test.com");
        user.setFullName("Test User");
        user.setRoles(new java.util.HashSet<>(java.util.Set.of(Role.UNASSIGNED)));
    }

    @Test
    void registerUser_Success() {
        UserInput input = new UserInput("testuser", "test@test.com", "Test User", "password");
        when(passwordEncoder.encode(any())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User registeredUser = userService.registerUser(input);

        assertNotNull(registeredUser);
        assertEquals("testuser", registeredUser.getUsername());
        assertTrue(registeredUser.getRoles().contains(Role.UNASSIGNED));
        verify(userRepository).save(any(User.class));
    }

    @Test
    void updateUserProfile_Success() {
        ProfileInput input = new ProfileInput("Updated Name", "updated@test.com");
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        User updatedUser = userService.updateUserProfile(1L, input);

        assertEquals("Updated Name", updatedUser.getFullName());
        assertEquals("updated@test.com", updatedUser.getEmail());
    }

    @Test
    void assignRole_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        User updatedUser = userService.assignRole(1L, Role.ADMIN);

        assertTrue(updatedUser.getRoles().contains(Role.ADMIN));
        assertFalse(updatedUser.getRoles().contains(Role.UNASSIGNED));
    }

    @Test
    void linkFacultyToDepartment_Success() {
        user.setRoles(new java.util.HashSet<>(java.util.Set.of(Role.FACULTY)));
        Department dept = new Department();
        dept.setId(1L);
        dept.setName("Computer Science");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(dept));
        when(userRepository.save(any(User.class))).thenReturn(user);

        User linkedUser = userService.linkFacultyToDepartment(1L, 1L);

        assertEquals(dept, linkedUser.getDepartment());
    }

    @Test
    void linkFacultyToDepartment_Failure_NotFaculty() {
        user.setRoles(new java.util.HashSet<>(java.util.Set.of(Role.STUDENT)));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        assertThrows(RuntimeException.class, () -> userService.linkFacultyToDepartment(1L, 1L));
    }

    @Test
    void createDepartment_Success() {
        DepartmentInput input = new DepartmentInput("Computer Science", "CS");
        Department savedDepartment = new Department();
        savedDepartment.setId(1L);
        savedDepartment.setName("Computer Science");
        savedDepartment.setCode("CS");

        when(departmentRepository.save(any(Department.class))).thenReturn(savedDepartment);

        Department result = userService.createDepartment(input);

        assertNotNull(result);
        assertEquals("Computer Science", result.getName());
        assertEquals("CS", result.getCode());
        verify(departmentRepository).save(any(Department.class));
    }
}
