package com.scholario.user.resolver;

import com.scholario.user.model.Department;
import com.scholario.user.model.User;
import com.scholario.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class UserQueryResolver {

    private final UserService userService;

    @QueryMapping
    public User getUserById(@Argument Long id) {
        return userService.getUserById(id);
    }

    @QueryMapping
    @org.springframework.security.access.prepost.PreAuthorize("isAuthenticated()")
    public User getMyProfile() {
        return userService.getCurrentUser();
    }

    @QueryMapping
    public List<User> getFacultyList() {
        return userService.getFacultyList();
    }

    @QueryMapping
    public List<User> getStudentList() {
        return userService.getStudentList();
    }

    @QueryMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public List<User> getUnassignedUsers() {
        return userService.getUnassignedUsers();
    }

    @QueryMapping
    public List<Department> getDepartments() {
        return userService.getDepartments();
    }
}
