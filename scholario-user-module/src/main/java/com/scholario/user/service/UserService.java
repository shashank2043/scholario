package com.scholario.user.service;

import com.scholario.user.dto.DepartmentInput;
import com.scholario.user.dto.ProfileInput;
import com.scholario.user.dto.UserInput;
import com.scholario.user.model.Department;
import com.scholario.user.model.Role;
import com.scholario.user.model.User;
import com.scholario.user.repository.DepartmentRepository;
import com.scholario.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final String USER_NOT_FOUND = "User not found";
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final Set<String> syncedUsers = ConcurrentHashMap.newKeySet();

    @Transactional
    public User registerUser(UserInput input) {
        User user = new User();
        user.setUsername(input.username());
        user.setEmail(input.email());
        user.setFullName(input.fullName());
        user.setRole(input.role());
        user.setPassword(passwordEncoder.encode(input.password()));
        return userRepository.save(user);
    }

    @Transactional
    public User updateUserProfile(Long id, ProfileInput input) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(USER_NOT_FOUND));
        if (input.fullName() != null) {
            user.setFullName(input.fullName());
        }
        if (input.email() != null) {
            user.setEmail(input.email());
        }
        return userRepository.save(user);
    }

    @Transactional
    public User assignRole(Long userId, Role role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException(USER_NOT_FOUND));
        user.setRole(role);
        return userRepository.save(user);
    }

    @Transactional
    public User linkFacultyToDepartment(Long facultyId, Long departmentId) {
        User user = userRepository.findById(facultyId)
                .orElseThrow(() -> new IllegalArgumentException(USER_NOT_FOUND));
        if (user.getRole() != Role.FACULTY) {
            throw new IllegalStateException("Only faculty can be linked to a department");
        }
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));
        user.setDepartment(department);
        return userRepository.save(user);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(USER_NOT_FOUND));
    }

    public List<User> getFacultyList() {
        return userRepository.findByRole(Role.FACULTY);
    }

    public List<User> getStudentList() {
        return userRepository.findByRole(Role.STUDENT);
    }

    public List<Department> getDepartments() {
        return departmentRepository.findAll();
    }

    @Transactional
    public Department createDepartment(DepartmentInput input) {
        Department department = new Department();
        department.setName(input.name());
        department.setCode(input.code());
        return departmentRepository.save(department);
    }

    @Transactional
    public void syncUserFromExternalProvider(String username, String email, String fullName, List<String> roles) {
        if (syncedUsers.contains(username)) {
            return;
        }

        if (userRepository.findByUsername(username).isEmpty()) {
            User user = new User();
            user.setUsername(username);
            user.setEmail(email != null ? email : username + "@scholario.local");
            user.setFullName(fullName != null ? fullName : username);
            user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));

            user.setRole(resolveExternalRole(roles));
            userRepository.save(user);
        }
        syncedUsers.add(username);
    }

    private Role resolveExternalRole(List<String> roles) {
        if (roles == null) {
            return Role.STUDENT;
        }

        Optional<Role> firstAllowedRole = roles.stream()
                .map(role -> role == null ? "" : role.trim().toUpperCase(Locale.ROOT))
                .filter(role -> !role.isBlank())
                .flatMap(role -> {
                    try {
                        return java.util.stream.Stream.of(Role.valueOf(role));
                    } catch (IllegalArgumentException ignored) {
                        return java.util.stream.Stream.empty();
                    }
                })
                .findFirst();

        return firstAllowedRole.orElse(Role.STUDENT);
    }
}
