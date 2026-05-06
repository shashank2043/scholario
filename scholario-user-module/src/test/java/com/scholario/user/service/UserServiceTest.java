package com.scholario.user.service;

import com.scholario.user.dto.ProfileInput;
import com.scholario.user.dto.UserInput;
import com.scholario.user.model.Department;
import com.scholario.user.model.Role;
import com.scholario.user.model.User;
import com.scholario.user.repository.DepartmentRepository;
import com.scholario.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testRegisterUser() {
        UserInput input = new UserInput("testuser","test@example.com","Test User","password",Role.STUDENT);

        User user = new User();
        user.setId(1L);
        user.setUsername(input.username());
        user.setEmail(input.email());
        user.setFullName(input.fullName());
        user.setRole(input.role());

        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(user);

        User registeredUser = userService.registerUser(input);

        assertNotNull(registeredUser);
        assertEquals("testuser", registeredUser.getUsername());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testLinkFacultyToDepartment() {
        Long facultyId = 1L;
        Long departmentId = 1L;

        User faculty = new User();
        faculty.setId(facultyId);
        faculty.setRole(Role.FACULTY);

        Department dept = new Department();
        dept.setId(departmentId);
        dept.setName("Computer Science");

        when(userRepository.findById(facultyId)).thenReturn(Optional.of(faculty));
        when(departmentRepository.findById(departmentId)).thenReturn(Optional.of(dept));
        when(userRepository.save(any(User.class))).thenReturn(faculty);

        User result = userService.linkFacultyToDepartment(facultyId, departmentId);

        assertNotNull(result);
        assertEquals(dept, result.getDepartment());
        verify(userRepository, times(1)).save(faculty);
    }

    @Test
    void testLinkNonFacultyToDepartmentThrowsException() {
        Long studentId = 1L;
        Long departmentId = 1L;

        User student = new User();
        student.setId(studentId);
        student.setRole(Role.STUDENT);

        when(userRepository.findById(studentId)).thenReturn(Optional.of(student));

        assertThrows(RuntimeException.class, () -> userService.linkFacultyToDepartment(studentId, departmentId));
    }
}
