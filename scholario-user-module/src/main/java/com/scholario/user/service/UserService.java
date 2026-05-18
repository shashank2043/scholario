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
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private static final String USER_NOT_FOUND = "User not found";
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final KeycloakRoleSyncService keycloakRoleSyncService;

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("User not authenticated");
        }

        String username;
        Object principal = authentication.getPrincipal();

        if (principal instanceof UserDetails userDetails) {
            username = userDetails.getUsername();
        } else if (principal instanceof Jwt jwt) {
            username = jwt.getClaimAsString("preferred_username");
        } else if (principal instanceof String s) {
            username = s;
        } else {
            username = authentication.getName();
        }

        if (username == null) {
            throw new IllegalStateException("Could not extract username from security context");
        }

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException(USER_NOT_FOUND + ": " + username));
    }

    public Long getCurrentUserId() {
        return getCurrentUser().getId();
    }

    @Transactional
    public User registerUser(UserInput input) {
        User user = new User();
        user.setUsername(input.username());
        user.setEmail(input.email());
        user.setFullName(input.fullName());
        user.setRoles(Set.of(Role.UNASSIGNED));
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
        user.getRoles().remove(Role.UNASSIGNED);
        user.getRoles().add(role);
        User savedUser = userRepository.save(user);
        keycloakRoleSyncService.syncRoles(savedUser.getUsername(), savedUser.getRoles());
        return savedUser;
    }

    @Transactional
    public User removeRole(Long userId, Role role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException(USER_NOT_FOUND));
        user.getRoles().remove(role);
        User savedUser = userRepository.save(user);
        keycloakRoleSyncService.syncRoles(savedUser.getUsername(), savedUser.getRoles());
        return savedUser;
    }

    @Transactional
    public User linkFacultyToDepartment(Long facultyId, Long departmentId) {
        User user = userRepository.findById(facultyId)
                .orElseThrow(() -> new IllegalArgumentException(USER_NOT_FOUND));
        if (!user.getRoles().contains(Role.FACULTY)) {
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

    public List<User> getUnassignedUsers() {
        return userRepository.findByRoles(Role.UNASSIGNED);
    }

    public List<User> getFacultyList() {
        return userRepository.findByRoles(Role.FACULTY);
    }

    public List<User> getStudentList() {
        return userRepository.findByRoles(Role.STUDENT);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
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
    public Department updateDepartment(Long id, DepartmentInput input) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));
        department.setName(input.name());
        department.setCode(input.code());
        return departmentRepository.save(department);
    }

    @Transactional
    public boolean deleteDepartment(Long id) {
        if (!departmentRepository.existsById(id)) {
            return false;
        }
        // severed links: set department to null for all users in this department
        userRepository.findAll().stream()
                .filter(user -> user.getDepartment() != null && user.getDepartment().getId().equals(id))
                .forEach(user -> {
                    user.setDepartment(null);
                    userRepository.save(user);
                });
        departmentRepository.deleteById(id);
        return true;
    }

    @Transactional
    public void syncUserFromExternalProvider(String username, String email, String fullName, List<String> roles) {
        Optional<User> userOptional = userRepository.findByUsername(username);
        Set<Role> externalRoles = resolveExternalRoles(roles);

        // Detect if the incoming token has UNASSIGNED but we've pruned it because other roles exist.
        // This indicates Keycloak is out of sync with our pruning logic.
        boolean tokenHasStaleUnassigned = roles != null && 
                roles.stream().anyMatch(r -> "UNASSIGNED".equalsIgnoreCase(r != null ? r.trim() : "")) &&
                !externalRoles.contains(Role.UNASSIGNED);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            boolean changed = false;

            if (!user.getRoles().equals(externalRoles)) {
                user.setRoles(externalRoles);
                changed = true;
            }
            if (email != null && !email.equals(user.getEmail())) {
                user.setEmail(email);
                changed = true;
            }
            if (fullName != null && !fullName.equals(user.getFullName())) {
                user.setFullName(fullName);
                changed = true;
            }

            if (changed || tokenHasStaleUnassigned) {
                userRepository.save(user);
                // If we pruned UNASSIGNED, changed roles, OR the token still shows UNASSIGNED,
                // sync back to Keycloak to ensure Keycloak is also clean.
                if (tokenHasStaleUnassigned && !changed) {
                    log.info("Keycloak token for {} still contains UNASSIGNED role. Forcing cleanup sync.", username);
                } else {
                    log.info("Triggering Keycloak role synchronization for existing user: {}", username);
                }
                keycloakRoleSyncService.syncRoles(username, externalRoles);
            }
        } else {
            User user = new User();
            user.setUsername(username);
            user.setEmail(email != null ? email : username + "@scholario.local");
            user.setFullName(fullName != null ? fullName : username);
            user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            user.setRoles(externalRoles);
            userRepository.save(user);
            
            // If the initial sync had both functional roles and UNASSIGNED (unlikely but possible),
            // ensure Keycloak is updated.
            if (externalRoles.size() > 1 || !externalRoles.contains(Role.UNASSIGNED)) {
                log.info("Triggering Keycloak role synchronization for new user: {}", username);
                keycloakRoleSyncService.syncRoles(username, externalRoles);
            }
        }
    }

    private Set<Role> resolveExternalRoles(List<String> roles) {
        if (roles == null || roles.isEmpty()) {
            return new java.util.HashSet<>(Set.of(Role.UNASSIGNED));
        }

        Set<Role> resolvedRoles = roles.stream()
                .map(role -> role == null ? "" : role.trim().toUpperCase(Locale.ROOT))
                .filter(role -> !role.isBlank())
                .flatMap(role -> {
                    try {
                        return java.util.stream.Stream.of(Role.valueOf(role));
                    } catch (IllegalArgumentException ignored) {
                        return java.util.stream.Stream.empty();
                    }
                })
                .collect(java.util.stream.Collectors.toSet());

        // Ensure UNASSIGNED is removed if functional roles exist
        if (resolvedRoles.size() > 1 && resolvedRoles.contains(Role.UNASSIGNED)) {
            resolvedRoles.remove(Role.UNASSIGNED);
        }

        return resolvedRoles.isEmpty() ? new java.util.HashSet<>(Set.of(Role.UNASSIGNED)) : resolvedRoles;
    }
}
