package com.scholario.user.resolver;

import com.scholario.user.dto.DepartmentInput;
import com.scholario.user.dto.ProfileInput;
import com.scholario.user.dto.UserInput;
import com.scholario.user.model.Department;
import com.scholario.user.model.Role;
import com.scholario.user.model.User;
import com.scholario.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class UserMutationResolver {

    private final UserService userService;

    @MutationMapping
    public User registerUser(@Valid @Argument UserInput input) {
        return userService.registerUser(input);
    }

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public User updateUserProfile(@Valid @Argument ProfileInput input) {
        return userService.updateUserProfile(userService.getCurrentUserId(), input);
    }

    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public User assignRole(@Argument Long userId, @Argument Role role) {
        return userService.assignRole(userId, role);
    }

    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public User linkFacultyToDepartment(@Argument Long facultyId, @Argument Long departmentId) {
        return userService.linkFacultyToDepartment(facultyId, departmentId);
    }

    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Department createDepartment(@Valid @Argument DepartmentInput input) {
        return userService.createDepartment(input);
    }

    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Department updateDepartment(@Argument Long id, @Valid @Argument DepartmentInput input) {
        return userService.updateDepartment(id, input);
    }

    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public boolean deleteDepartment(@Argument Long id) {
        return userService.deleteDepartment(id);
    }
}
